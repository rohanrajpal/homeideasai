from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from app.models import Waitlist, User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.users import get_user_manager, UserManager

router = APIRouter(tags=["waitlist"])


@router.post("/add")
async def add_to_waitlist(
    email: str = Body(...),
    db: AsyncSession = Depends(get_async_session),
):
    # Check if the email already exists

    result = await db.execute(select(Waitlist).filter(Waitlist.email == email))
    existing_entry = result.scalars().first()

    if existing_entry:
        raise HTTPException(status_code=409, detail="Email already on waitlist")

    # Add the email to the waitlist
    new_entry = Waitlist(email=email)
    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)

    return {"message": "Email added to waitlist successfully"}


@router.post("/trigger-account-created")
async def trigger_account_created_for_all(
    db: AsyncSession = Depends(get_async_session),
    user_manager: UserManager = Depends(get_user_manager),
):
    # Get all users
    result = await db.execute(select(User))
    users = result.scalars().unique().all()

    processed_count = 0
    for user in users:
        await user_manager.trigger_account_created(user)
        processed_count += 1

    return {
        "message": f"Account created sequence triggered for {processed_count} users"
    }
