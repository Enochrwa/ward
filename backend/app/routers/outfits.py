from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime

from .. import schemas
from ..security import get_current_user
# Import fake_wardrobe_db and WardrobeItem for validation
from .wardrobe import fake_wardrobe_db

router = APIRouter(
    prefix="/outfits",
    tags=["Outfits"],
    responses={404: {"description": "Not found"}},
)

fake_outfits_db: List[schemas.Outfit] = []
next_outfit_id = 1

def validate_items_for_user(item_ids: List[int], user_id: int):
    """
    Validates if all item_ids exist in fake_wardrobe_db and belong to the user.
    Raises HTTPException if validation fails.
    """
    for item_id in item_ids:
        item_found = False
        for wardrobe_item_model in fake_wardrobe_db: # Iterate over WardrobeItem models
            if wardrobe_item_model.id == item_id:
                if wardrobe_item_model.user_id != user_id:
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
    return True

@router.post("/", response_model=schemas.Outfit, status_code=status.HTTP_201_CREATED)
async def create_outfit(
    outfit: schemas.OutfitCreate,
    current_user: schemas.User = Depends(get_current_user)
):
    global next_outfit_id

    # Validate items
    if outfit.item_ids:
        validate_items_for_user(outfit.item_ids, current_user.id)

    new_outfit = schemas.Outfit(
        id=next_outfit_id,
        user_id=current_user.id,
        name=outfit.name,
        item_ids=outfit.item_ids,
        tags=outfit.tags if outfit.tags else [],
        image_url=outfit.image_url,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    fake_outfits_db.append(new_outfit)
    next_outfit_id += 1
    return new_outfit

@router.get("/", response_model=List[schemas.Outfit])
async def read_outfits(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(get_current_user)
):
    user_outfits = [o for o in fake_outfits_db if o.user_id == current_user.id]
    return user_outfits[skip : skip + limit]

@router.get("/{outfit_id}", response_model=schemas.Outfit)
async def read_outfit(
    outfit_id: int,
    current_user: schemas.User = Depends(get_current_user)
):
    for o in fake_outfits_db:
        if o.id == outfit_id and o.user_id == current_user.id:
            return o
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outfit not found")

@router.put("/{outfit_id}", response_model=schemas.Outfit)
async def update_outfit(
    outfit_id: int,
    outfit_update: schemas.OutfitUpdate,
    current_user: schemas.User = Depends(get_current_user)
):
    for index, db_outfit in enumerate(fake_outfits_db):
        if db_outfit.id == outfit_id:
            if db_outfit.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this outfit")

            update_data = outfit_update.model_dump(exclude_unset=True)

            # Validate items if they are being updated
            if "item_ids" in update_data and update_data["item_ids"] is not None:
                validate_items_for_user(update_data["item_ids"], current_user.id)

            updated_outfit = db_outfit.model_copy(update=update_data)
            updated_outfit.updated_at = datetime.utcnow()
            fake_outfits_db[index] = updated_outfit
            return updated_outfit

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outfit not found")

@router.delete("/{outfit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_outfit(
    outfit_id: int,
    current_user: schemas.User = Depends(get_current_user)
):
    global fake_outfits_db
    initial_len = len(fake_outfits_db)

    outfit_to_delete_index = -1
    for index, o in enumerate(fake_outfits_db):
        if o.id == outfit_id:
            if o.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this outfit")
            outfit_to_delete_index = index
            break

    if outfit_to_delete_index != -1:
        del fake_outfits_db[outfit_to_delete_index]
        return

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outfit not found")
