from app.config import settings
from app.schemas import (
    CompleteCheckoutSessionResponse,
    StripeCheckoutSession,
    Invoice,
    SubscriptionInfo,
    CancelSubscriptionResponse,
)
from fastapi import APIRouter, HTTPException, Request, Body, Depends
import stripe
from app.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.users import current_active_user
from datetime import datetime

router = APIRouter(tags=["billing"])

stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/create-checkout-session", response_model=StripeCheckoutSession)
async def create_checkout_session(
    package_type: str = Body(...),
    quantity: int = Body(...),
    promo_code: str = Body(None),  # Optional promo code
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

        # Check if this is a subscription (homeideasai_pro) or one-time payment
        is_subscription = package_type.lower() == "homeideasai_pro"

        if is_subscription:
            # Create subscription checkout session
            session_params = {
                "customer": customer_id,
                "line_items": [
                    {
                        "price": price_id,
                        "quantity": 1,  # Subscriptions typically have quantity 1
                    }
                ],
                "billing_address_collection": "required",
                "mode": "subscription",
                "allow_promotion_codes": True,  # Enable promo code input
                "success_url": settings.FRONTEND_URL
                + "/success"
                + "?session_id={CHECKOUT_SESSION_ID}",
                "cancel_url": settings.FRONTEND_URL + "/cancel",
            }

            # Apply promo code if provided
            if promo_code:
                try:
                    # Retrieve the promotion code to validate it exists
                    promotion_code = stripe.PromotionCode.list(code=promo_code, limit=1)
                    if promotion_code.data:
                        session_params["discounts"] = [
                            {"promotion_code": promotion_code.data[0].id}
                        ]
                except stripe.error.StripeError:
                    # If promo code is invalid, just continue without it
                    pass

            session = stripe.checkout.Session.create(**session_params)
        else:
            # Create one-time payment session
            session_params = {
                "customer": customer_id,
                "line_items": [
                    {
                        "price": price_id,
                        "quantity": quantity,
                    }
                ],
                "billing_address_collection": "required",
                "mode": "payment",
                "invoice_creation": {"enabled": True},
                "allow_promotion_codes": True,  # Enable promo code input
                "success_url": settings.FRONTEND_URL
                + "/success"
                + "?session_id={CHECKOUT_SESSION_ID}",
                "cancel_url": settings.FRONTEND_URL + "/cancel",
            }

            # Apply promo code if provided
            if promo_code:
                try:
                    # Retrieve the promotion code to validate it exists
                    promotion_code = stripe.PromotionCode.list(code=promo_code, limit=1)
                    if promotion_code.data:
                        session_params["discounts"] = [
                            {"promotion_code": promotion_code.data[0].id}
                        ]
                except stripe.error.StripeError:
                    # If promo code is invalid, just continue without it
                    pass

            session = stripe.checkout.Session.create(**session_params)
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
    request: Request, db: AsyncSession = Depends(get_async_session)
):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    print(f"Received webhook event: {event_type}")

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        print(f"Processing checkout.session.completed for session {session.get('id')}")
        await handle_checkout_session_completed(session, db)
    elif event_type == "customer.subscription.created":
        subscription = event["data"]["object"]
        print(
            f"Processing customer.subscription.created for subscription {subscription.get('id')}"
        )
        await handle_subscription_created(subscription, db)
    elif event_type == "customer.subscription.updated":
        subscription = event["data"]["object"]
        print(
            f"Processing customer.subscription.updated for subscription {subscription.get('id')}"
        )
        await handle_subscription_updated(subscription, db)
    elif event_type == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        print(
            f"Processing customer.subscription.deleted for subscription {subscription.get('id')}"
        )
        await handle_subscription_deleted(subscription, db)
    elif event_type == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        print(f"Processing invoice.payment_succeeded for invoice {invoice.get('id')}")
        if invoice["billing_reason"] == "subscription_cycle":
            await handle_subscription_renewal(invoice, db)
    else:
        print(f"Unhandled webhook event type: {event_type}")

    return {"status": "success"}


async def handle_checkout_session_completed(session, db: AsyncSession):
    """Handle checkout session completion for both one-time payments and subscriptions"""
    try:
        customer_id = session["customer"]
        mode = session["mode"]

        # Find the user by Stripe customer ID
        result = await db.execute(
            select(User).filter(User.stripe_customer_id == customer_id)
        )
        user = result.scalars().first()

        if not user:
            print(f"User not found for customer {customer_id}")
            return

        if mode == "payment":
            # Handle one-time payment (credits purchase)
            line_items = stripe.checkout.Session.list_line_items(session["id"])
            quantity = sum(item["quantity"] for item in line_items["data"])

            if user.credits is None:
                user.credits = 0
            user.credits += quantity
            await db.commit()

        elif mode == "subscription":
            # Subscription will be handled by subscription.created webhook
            pass

    except Exception as e:
        print(f"Error handling checkout session: {e}")


async def handle_subscription_created(subscription, db: AsyncSession):
    """Handle new subscription creation"""
    try:
        customer_id = subscription["customer"]
        subscription_id = subscription["id"]
        status = subscription["status"]
        current_period_start = datetime.fromtimestamp(
            subscription["current_period_start"]
        )
        current_period_end = datetime.fromtimestamp(subscription["current_period_end"])
        price_id = subscription["items"]["data"][0]["price"]["id"]

        # Find the user by Stripe customer ID
        result = await db.execute(
            select(User).filter(User.stripe_customer_id == customer_id)
        )
        user = result.scalars().first()

        if not user:
            print(
                f"ERROR: User not found for customer {customer_id} in subscription creation"
            )
            return

        # Update user subscription info
        user.stripe_subscription_id = subscription_id
        user.subscription_status = status
        user.subscription_current_period_start = current_period_start
        user.subscription_current_period_end = current_period_end
        user.subscription_cancel_at_period_end = False
        user.plan_id = price_id

        # Grant initial credits for Pro plan (200 credits)
        if user.credits is None:
            user.credits = 0
        user.credits += 200

        await db.commit()

    except Exception as e:
        print(f"CRITICAL ERROR handling subscription creation: {e}")
        import traceback

        traceback.print_exc()


async def handle_subscription_updated(subscription, db: AsyncSession):
    """Handle subscription updates (status changes, etc.)"""
    try:
        subscription_id = subscription["id"]
        status = subscription["status"]
        current_period_start = datetime.fromtimestamp(
            subscription["current_period_start"]
        )
        current_period_end = datetime.fromtimestamp(subscription["current_period_end"])
        cancel_at_period_end = subscription.get("cancel_at_period_end", False)

        # Find the user by subscription ID
        result = await db.execute(
            select(User).filter(User.stripe_subscription_id == subscription_id)
        )
        user = result.scalars().first()

        if not user:
            print(f"User not found for subscription {subscription_id}")
            return

        # Update subscription info
        user.subscription_status = status
        user.subscription_current_period_start = current_period_start
        user.subscription_current_period_end = current_period_end
        user.subscription_cancel_at_period_end = cancel_at_period_end

        await db.commit()

    except Exception as e:
        print(f"Error handling subscription update: {e}")


async def handle_subscription_deleted(subscription, db: AsyncSession):
    """Handle subscription cancellation"""
    try:
        subscription_id = subscription["id"]

        # Find the user by subscription ID
        result = await db.execute(
            select(User).filter(User.stripe_subscription_id == subscription_id)
        )
        user = result.scalars().first()

        if not user:
            print(f"User not found for subscription {subscription_id}")
            return

        # Clear subscription info
        user.subscription_status = "canceled"
        user.stripe_subscription_id = None
        user.subscription_current_period_start = None
        user.subscription_current_period_end = None
        user.subscription_cancel_at_period_end = False
        user.plan_id = None

        await db.commit()

    except Exception as e:
        print(f"Error handling subscription deletion: {e}")


async def handle_subscription_renewal(invoice, db: AsyncSession):
    """Handle subscription renewal (monthly credit grant)"""
    try:
        customer_id = invoice["customer"]
        subscription_id = invoice["subscription"]

        # Find the user by Stripe customer ID
        result = await db.execute(
            select(User).filter(User.stripe_customer_id == customer_id)
        )
        user = result.scalars().first()

        if not user:
            print(f"User not found for customer {customer_id}")
            return

        # Grant 200 credits for Pro plan renewal
        if user.credits is None:
            user.credits = 0
        user.credits += 200

        await db.commit()

    except Exception as e:
        print(f"Error handling subscription renewal: {e}")


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
        total_amount, currency = await handle_checkout_session_legacy(session, db)

        return {
            "status": "success",
            "amount": total_amount,
            "currency": currency,  # Use the currency returned from the session
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def handle_checkout_session_legacy(session, db: AsyncSession):
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


@router.get("/subscription", response_model=SubscriptionInfo)
async def get_subscription_info(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    try:
        # Refresh user data from database
        result = await db.execute(select(User).filter(User.id == user.id))
        user = result.scalars().first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get plan name from plan_id
        plan_name = None
        if user.plan_id:
            try:
                price = stripe.Price.retrieve(user.plan_id)
                plan_name = price.lookup_key or "Pro Plan"
            except:
                plan_name = "Pro Plan"

        return SubscriptionInfo(
            status=user.subscription_status or "none",
            current_period_start=user.subscription_current_period_start,
            current_period_end=user.subscription_current_period_end,
            cancel_at_period_end=user.subscription_cancel_at_period_end or False,
            plan_name=plan_name,
            credits_remaining=user.credits or 0,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/subscription/cancel", response_model=CancelSubscriptionResponse)
async def cancel_subscription(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    try:
        # Refresh user data from database
        result = await db.execute(select(User).filter(User.id == user.id))
        user = result.scalars().first()

        if not user or not user.stripe_subscription_id:
            raise HTTPException(status_code=404, detail="No active subscription found")

        # Cancel the subscription at period end
        subscription = stripe.Subscription.modify(
            user.stripe_subscription_id, cancel_at_period_end=True
        )

        # Update local database
        user.subscription_cancel_at_period_end = True
        await db.commit()

        return CancelSubscriptionResponse(
            success=True,
            message="Subscription will be canceled at the end of the current billing period",
            cancel_at_period_end=True,
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/subscription/reactivate", response_model=CancelSubscriptionResponse)
async def reactivate_subscription(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    try:
        # Refresh user data from database
        result = await db.execute(select(User).filter(User.id == user.id))
        user = result.scalars().first()

        if not user or not user.stripe_subscription_id:
            raise HTTPException(status_code=404, detail="No active subscription found")

        # Reactivate the subscription
        subscription = stripe.Subscription.modify(
            user.stripe_subscription_id, cancel_at_period_end=False
        )

        # Update local database
        user.subscription_cancel_at_period_end = False
        await db.commit()

        return CancelSubscriptionResponse(
            success=True,
            message="Subscription has been reactivated",
            cancel_at_period_end=False,
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/checkout-session/{session_id}")
async def get_checkout_session_info(
    session_id: str,
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Get checkout session information to determine if it was subscription or payment"""
    try:
        print(f"Retrieving checkout session {session_id} for user {user.id}")

        # Refresh user data from database to get latest stripe_customer_id
        result = await db.execute(select(User).filter(User.id == user.id))
        fresh_user = result.scalars().first()
        if not fresh_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Retrieve the session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        print(
            f"Retrieved session: customer={session.customer}, mode={session.mode}, status={session.status}"
        )
        print(f"User stripe_customer_id (from DB): {fresh_user.stripe_customer_id}")

        # Check if this session belongs to the current user
        if session.customer != fresh_user.stripe_customer_id:
            print(
                f"Customer mismatch: session.customer={session.customer} vs user.stripe_customer_id={fresh_user.stripe_customer_id}"
            )
            raise HTTPException(
                status_code=403, detail="Session does not belong to current user"
            )

        return {
            "id": session.id,
            "mode": session.mode,  # "subscription" or "payment"
            "status": session.status,
            "customer": session.customer,
            "created": session.created,
        }
    except stripe.error.StripeError as e:
        print(f"Stripe API error retrieving session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Stripe API error: {str(e)}")
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        print(f"Unexpected error retrieving session {session_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


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
