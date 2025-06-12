from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict
from datetime import datetime, date

from .. import schemas
from ..security import get_current_user
# Import fake_outfits_db for validation
from .outfits import fake_outfits_db

router = APIRouter(
    prefix="/weekly-plans",
    tags=["Weekly Plans"],
    responses={404: {"description": "Not found"}},
)

fake_weekly_plans_db: List[schemas.WeeklyPlan] = []
next_weekly_plan_id = 1

VALID_DAYS = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}

def validate_plan_outfits_for_user(daily_outfits: Dict[str, Optional[int]], user_id: int):
    """
    Validates if all outfit_ids in daily_outfits exist in fake_outfits_db and belong to the user.
    Outfit_id can be None.
    Raises HTTPException if validation fails.
    """
    if not daily_outfits:
        return True # No outfits to validate

    for day, outfit_id in daily_outfits.items():
        if day.lower() not in VALID_DAYS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid day '{day}'. Must be one of {', '.join(VALID_DAYS)}."
            )
        if outfit_id is None:
            continue  # None is a valid outfit_id, means no outfit planned

        outfit_found = False
        for outfit_model in fake_outfits_db: # Iterate over Outfit models
            if outfit_model.id == outfit_id:
                if outfit_model.user_id != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Outfit with ID {outfit_id} on day '{day}' does not belong to the current user."
                    )
                outfit_found = True
                break
        if not outfit_found:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Outfit with ID {outfit_id} on day '{day}' not found."
            )
    return True

@router.post("/", response_model=schemas.WeeklyPlan, status_code=status.HTTP_201_CREATED)
async def create_weekly_plan(
    plan: schemas.WeeklyPlanCreate,
    current_user: schemas.User = Depends(get_current_user)
):
    global next_weekly_plan_id

    if plan.start_date > plan.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before or the same as end date."
        )

    validate_plan_outfits_for_user(plan.daily_outfits, current_user.id)

    new_plan = schemas.WeeklyPlan(
        id=next_weekly_plan_id,
        user_id=current_user.id,
        name=plan.name,
        start_date=plan.start_date,
        end_date=plan.end_date,
        daily_outfits=plan.daily_outfits,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    fake_weekly_plans_db.append(new_plan)
    next_weekly_plan_id += 1
    return new_plan

@router.get("/", response_model=List[schemas.WeeklyPlan])
async def read_weekly_plans(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(get_current_user)
):
    user_plans = [p for p in fake_weekly_plans_db if p.user_id == current_user.id]
    return user_plans[skip : skip + limit]

@router.get("/{plan_id}", response_model=schemas.WeeklyPlan)
async def read_weekly_plan(
    plan_id: int,
    current_user: schemas.User = Depends(get_current_user)
):
    for p in fake_weekly_plans_db:
        if p.id == plan_id and p.user_id == current_user.id:
            return p
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weekly plan not found")

@router.put("/{plan_id}", response_model=schemas.WeeklyPlan)
async def update_weekly_plan(
    plan_id: int,
    plan_update: schemas.WeeklyPlanUpdate,
    current_user: schemas.User = Depends(get_current_user)
):
    for index, db_plan in enumerate(fake_weekly_plans_db):
        if db_plan.id == plan_id:
            if db_plan.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this plan")

            update_data = plan_update.model_dump(exclude_unset=True)

            # Validate start_date and end_date consistency
            start_date = update_data.get("start_date", db_plan.start_date)
            end_date = update_data.get("end_date", db_plan.end_date)
            if start_date > end_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Start date must be before or the same as end date."
                )

            # Validate outfits if they are being updated
            if "daily_outfits" in update_data and update_data["daily_outfits"] is not None:
                validate_plan_outfits_for_user(update_data["daily_outfits"], current_user.id)

            updated_plan = db_plan.model_copy(update=update_data)
            updated_plan.updated_at = datetime.utcnow()
            fake_weekly_plans_db[index] = updated_plan
            return updated_plan

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weekly plan not found")

@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_weekly_plan(
    plan_id: int,
    current_user: schemas.User = Depends(get_current_user)
):
    global fake_weekly_plans_db

    plan_to_delete_index = -1
    for index, p in enumerate(fake_weekly_plans_db):
        if p.id == plan_id:
            if p.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this plan")
            plan_to_delete_index = index
            break

    if plan_to_delete_index != -1:
        del fake_weekly_plans_db[plan_to_delete_index]
        return

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weekly plan not found")
