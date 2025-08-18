from app.config import settings
from app.schemas import CompleteCheckoutSessionResponse, StripeCheckoutSession, Invoice
from fastapi import APIRouter, HTTPException, Request, Body, Depends
import stripe
from app.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.users import current_active_user

router = APIRouter(tags=["billing"])

stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/create-checkout-session", response_model=StripeCheckoutSession)
async def create_checkout_session(
    package_type: str = Body(...),
    quantity: int = Body(...),
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    try:
        # Lookup price ID based on package_type
        price_id = await get_price_id(package_type)

        # Retrieve user from the database
        result = await db.execute(select(User).filter(User.id == user.id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Use the user's Stripe customer ID if it exists, otherwise create a new customer
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(email=user.email)
            user.stripe_customer_id = customer.id
            await db.commit()  # Save the new customer ID to the database
        customer_id = user.stripe_customer_id

        session = stripe.checkout.Session.create(
            customer=customer_id,
            line_items=[
                {
                    "price": price_id,
                    "quantity": quantity,
                }
            ],
            billing_address_collection="required",
            mode="payment",
            invoice_creation={"enabled": True},
            success_url=settings.FRONTEND_URL
            + "/success"
            + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=settings.FRONTEND_URL + "/cancel",
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        handle_checkout_session(session)

    return {"status": "success"}


def handle_checkout_session(session):
    # Update user credits based on the session
    pass


async def get_price_id(package_type: str) -> str:
    try:
        # List all prices and filter by package type
        # prices = stripe.Price.list(limit=100)  # Adjust limit as needed
        prices = stripe.Price.list(lookup_keys=[package_type])

        # Find the price with the desired package type
        for price in prices["data"]:
            if (
                price["lookup_key"] == package_type
            ):  # Assuming 'nickname' is used for package type
                return price["id"]

        # If no matching price is found, raise an exception
        raise HTTPException(status_code=400, detail="Invalid package type")
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe API error: {str(e)}")


@router.post(
    "/complete-checkout-session", response_model=CompleteCheckoutSessionResponse
)
async def complete_checkout_session(
    session_id: str = Body(...),
    db: AsyncSession = Depends(get_async_session),
):
    try:
        # Retrieve the session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)

        # Call the function to handle the session and get the total amount and currency
        total_amount, currency = await handle_checkout_session(session, db)

        return {
            "status": "success",
            "amount": total_amount,
            "currency": currency,  # Use the currency returned from the session
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def handle_checkout_session(session, db: AsyncSession):
    # Extract the customer ID from the session
    customer_id = session["customer"]

    # Retrieve the line items for the session
    line_items = stripe.checkout.Session.list_line_items(session["id"])

    # Extract the quantity and calculate the total amount from the line items
    quantity = sum(item["quantity"] for item in line_items["data"])
    total_amount = (
        sum(item["amount_total"] for item in line_items["data"]) / 100
    )  # Stripe amounts are in cents

    # Extract the currency from the first line item (assuming all items have the same currency)
    currency = line_items["data"][0]["currency"] if line_items["data"] else "USD"

    # Retrieve the user from the database using the customer ID
    result = await db.execute(
        select(User).filter(User.stripe_customer_id == customer_id)
    )

    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.credits == None:
        user.credits = 0
    # Update the user's credits
    user.credits += quantity
    await db.commit()

    return total_amount, currency


@router.get("/invoices", response_model=list[Invoice])
async def get_user_invoices(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    try:
        # Ensure the user has a Stripe customer ID
        if not user.stripe_customer_id:
            raise HTTPException(
                status_code=404, detail="User has no Stripe customer ID"
            )

        # Retrieve the invoices from Stripe
        invoices = stripe.Invoice.list(customer=user.stripe_customer_id, limit=10)

        # Format the invoice data
        invoice_data = [
            {
                "invoice_link": invoice.hosted_invoice_url,
                "date": invoice.created,
                "amount": str(invoice.total / 100),  # Stripe amounts are in cents
                "credits": sum(item.quantity for item in invoice.lines.data),
            }
            for invoice in invoices.data
        ]

        return invoice_data
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
