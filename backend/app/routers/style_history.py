from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime

from .. import schemas
from ..security import get_current_user
from .wardrobe import fake_wardrobe_db # To update WardrobeItem
from .outfits import fake_outfits_db  # To validate Outfit if outfit_id is given

router = APIRouter(
    prefix="/style-history",
    tags=["Style History"],
    responses={404: {"description": "Not found"}},
)

fake_style_history_db: List[schemas.StyleHistory] = []
next_style_history_id = 1

def validate_style_history_references(
    user_id: int,
    item_id: Optional[int] = None,
    outfit_id: Optional[int] = None
):
    if item_id is not None:
        item_found = False
        for item_model in fake_wardrobe_db:
            if item_model.id == item_id:
                if item_model.user_id != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Item with ID {item_id} does not belong to the current user."
                    )
                item_found = True
                break
        if not item_found:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Wardrobe item with ID {item_id} not found."
            )
    elif outfit_id is not None:
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
    # Validator in schemas.StyleHistoryCreate already ensures one is not None and not both are None
    return True

@router.post("/", response_model=schemas.StyleHistory, status_code=status.HTTP_201_CREATED)
async def create_style_history_entry(
    history_entry: schemas.StyleHistoryCreate,
    current_user: schemas.User = Depends(get_current_user)
):
    global next_style_history_id

    # The Pydantic model StyleHistoryCreate already validates item_id/outfit_id mutual exclusivity.
    # Now, validate existence and ownership.
    validate_style_history_references(
        user_id=current_user.id,
        item_id=history_entry.item_id,
        outfit_id=history_entry.outfit_id
    )

    new_entry = schemas.StyleHistory(
        id=next_style_history_id,
        user_id=current_user.id,
        item_id=history_entry.item_id,
        outfit_id=history_entry.outfit_id,
        date_worn=history_entry.date_worn,
        notes=history_entry.notes
    )
    fake_style_history_db.append(new_entry)
    next_style_history_id += 1

    # Side effect: Update WardrobeItem if item_id is logged
    if new_entry.item_id is not None:
        for i, item_in_db in enumerate(fake_wardrobe_db):
            if item_in_db.id == new_entry.item_id and item_in_db.user_id == current_user.id:
                # Create a new WardrobeItem instance with updated fields
                updated_item_data = item_in_db.model_dump()
                updated_item_data["times_worn"] = item_in_db.times_worn + 1
                updated_item_data["last_worn"] = new_entry.date_worn
                updated_item_data["updated_at"] = datetime.utcnow() # Also update general updated_at

                # Pydantic models are immutable by default if Config.allow_mutation = False (default is True)
                # Direct assignment might work if allow_mutation=True.
                # For safety and explicitness with potentially immutable models, replace the instance.
                fake_wardrobe_db[i] = schemas.WardrobeItem(**updated_item_data)
                break

    return new_entry

@router.get("/", response_model=List[schemas.StyleHistory])
async def read_style_history(
    item_id: Optional[int] = None,
    outfit_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(get_current_user)
):
    user_history = [
        entry for entry in fake_style_history_db if entry.user_id == current_user.id
    ]

    if item_id is not None:
        user_history = [entry for entry in user_history if entry.item_id == item_id]

    if outfit_id is not None:
        user_history = [entry for entry in user_history if entry.outfit_id == outfit_id]

    return user_history[skip : skip + limit]

@router.get("/{entry_id}", response_model=schemas.StyleHistory)
async def read_style_history_entry(
    entry_id: int,
    current_user: schemas.User = Depends(get_current_user)
):
    for entry in fake_style_history_db:
        if entry.id == entry_id and entry.user_id == current_user.id:
            return entry
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Style history entry not found")

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_style_history_entry(
    entry_id: int,
    current_user: schemas.User = Depends(get_current_user)
):
    global fake_style_history_db

    entry_to_delete_index = -1
    entry_item_id_to_decrement = None # For potential side-effect adjustment

    for index, entry in enumerate(fake_style_history_db):
        if entry.id == entry_id:
            if entry.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this entry")
            entry_to_delete_index = index
            # entry_item_id_to_decrement = entry.item_id # Store for potential side-effect
            break

    if entry_to_delete_index != -1:
        del fake_style_history_db[entry_to_delete_index]

        # Optional: Decrement times_worn for the item.
        # For now, as per instruction, this is skipped for simplicity with fake DB.
        # if entry_item_id_to_decrement is not None:
        #    for i, item_in_db in enumerate(fake_wardrobe_db):
        #        if item_in_db.id == entry_item_id_to_decrement and item_in_db.user_id == current_user.id:
        #            item_in_db.times_worn = max(0, item_in_db.times_worn - 1) # Avoid negative
        #            # Deciding how to update last_worn on deletion is complex, so often left as is or re-calculated.
        #            item_in_db.updated_at = datetime.utcnow()
        #            fake_wardrobe_db[i] = schemas.WardrobeItem(**item_in_db.model_dump())
        #            break
        return

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Style history entry not found")
