from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime

from .. import schemas
from ..security import get_current_user
from .outfits import fake_outfits_db # For outfit validation

router = APIRouter(
    prefix="/occasions",
    tags=["Occasions"],
    responses={404: {"description": "Not found"}},
)

fake_occasions_db: List[schemas.Occasion] = []
next_occasion_id = 1

def validate_occasion_outfit_for_user(outfit_id: Optional[int], user_id: int):
    """
    Validates if the given outfit_id (if not None) exists in fake_outfits_db
    and belongs to the user. Raises HTTPException if validation fails.
    """
    if outfit_id is None:
        return True # No outfit to validate

    outfit_found = False
    for outfit_model in fake_outfits_db:
        if outfit_model.id == outfit_id:
            if outfit_model.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Outfit with ID {outfit_id} does not belong to the current user."
                )
            outfit_found = True
            break
    if not outfit_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Outfit with ID {outfit_id} not found."
        )
    return True

@router.post("/", response_model=schemas.Occasion, status_code=status.HTTP_201_CREATED)
async def create_occasion(
    occasion: schemas.OccasionCreate,
    current_user: schemas.User = Depends(get_current_user)
):
    global next_occasion_id

    if occasion.outfit_id is not None:
        validate_occasion_outfit_for_user(occasion.outfit_id, current_user.id)

    new_occasion = schemas.Occasion(
        id=next_occasion_id,
        user_id=current_user.id,
        name=occasion.name,
        date=occasion.date,
        outfit_id=occasion.outfit_id,
        notes=occasion.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    fake_occasions_db.append(new_occasion)
    next_occasion_id += 1
    return new_occasion

@router.get("/", response_model=List[schemas.Occasion])
async def read_occasions(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(get_current_user)
):
    user_occasions = [occ for occ in fake_occasions_db if occ.user_id == current_user.id]
    return user_occasions[skip : skip + limit]

@router.get("/{occasion_id}", response_model=schemas.Occasion)
async def read_occasion(
    occasion_id: int,
    current_user: schemas.User = Depends(get_current_user)
):
    for occ in fake_occasions_db:
        if occ.id == occasion_id and occ.user_id == current_user.id:
            return occ
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Occasion not found")

@router.put("/{occasion_id}", response_model=schemas.Occasion)
async def update_occasion(
    occasion_id: int,
    occasion_update: schemas.OccasionUpdate,
    current_user: schemas.User = Depends(get_current_user)
):
    for index, db_occasion in enumerate(fake_occasions_db):
        if db_occasion.id == occasion_id:
            if db_occasion.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this occasion")

            update_data = occasion_update.model_dump(exclude_unset=True)

            # Validate outfit_id if it's being updated
            if "outfit_id" in update_data: # This means outfit_id is explicitly set in the request
                validate_occasion_outfit_for_user(update_data["outfit_id"], current_user.id)

            updated_occasion = db_occasion.model_copy(update=update_data)
            updated_occasion.updated_at = datetime.utcnow()
            fake_occasions_db[index] = updated_occasion
            return updated_occasion

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Occasion not found")

@router.delete("/{occasion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_occasion(
    occasion_id: int,
    current_user: schemas.User = Depends(get_current_user)
):
    global fake_occasions_db

    occasion_to_delete_index = -1
    for index, occ in enumerate(fake_occasions_db):
        if occ.id == occasion_id:
            if occ.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this occasion")
            occasion_to_delete_index = index
            break

    if occasion_to_delete_index != -1:
        del fake_occasions_db[occasion_to_delete_index]
        return

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Occasion not found")
