from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime

from .. import schemas
from ..security import get_current_user # Corrected import path

router = APIRouter(
    prefix="/wardrobe",
    tags=["Wardrobe"],
    responses={404: {"description": "Not found"}},
)

fake_wardrobe_db: List[schemas.WardrobeItem] = []
next_item_id = 1

@router.post("/items/", response_model=schemas.WardrobeItem, status_code=status.HTTP_201_CREATED)
async def create_wardrobe_item(
    item: schemas.WardrobeItemCreate,
    current_user: schemas.User = Depends(get_current_user)
):
    global next_item_id
    new_item = schemas.WardrobeItem(
        id=next_item_id,
        user_id=current_user.id,
        name=item.name,
        brand=item.brand,
        category=item.category,
        size=item.size,
        price=item.price,
        material=item.material,
        season=item.season,
        image_url=item.image_url,
        tags=item.tags if item.tags else [],
        favorite=False,
        times_worn=0,
        date_added=datetime.utcnow(),
        last_worn=None,
        updated_at=datetime.utcnow() # Set updated_at on creation as well
    )
    fake_wardrobe_db.append(new_item)
    next_item_id += 1
    return new_item

@router.get("/items/", response_model=List[schemas.WardrobeItem])
async def read_wardrobe_items(
    category: Optional[str] = None,
    season: Optional[str] = None,
    favorite: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100, # Increased default limit
    current_user: schemas.User = Depends(get_current_user)
):
    user_items = [item for item in fake_wardrobe_db if item.user_id == current_user.id]

    if category:
        user_items = [item for item in user_items if item.category and item.category.lower() == category.lower()]
    if season:
        user_items = [item for item in user_items if item.season and item.season.lower() == season.lower()]
    if favorite is not None:
        user_items = [item for item in user_items if item.favorite == favorite]

    return user_items[skip : skip + limit]

@router.get("/items/{item_id}", response_model=schemas.WardrobeItem)
async def read_wardrobe_item(
    item_id: int,
    current_user: schemas.User = Depends(get_current_user)
):
    for item in fake_wardrobe_db:
        if item.id == item_id and item.user_id == current_user.id:
            return item
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

@router.put("/items/{item_id}", response_model=schemas.WardrobeItem)
async def update_wardrobe_item(
    item_id: int,
    item_update: schemas.WardrobeItemUpdate,
    current_user: schemas.User = Depends(get_current_user)
):
    for index, db_item in enumerate(fake_wardrobe_db):
        if db_item.id == item_id:
            if db_item.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this item")

            update_data = item_update.model_dump(exclude_unset=True) # Use model_dump
            updated_item = db_item.model_copy(update=update_data) # Use model_copy
            updated_item.updated_at = datetime.utcnow()
            fake_wardrobe_db[index] = updated_item
            return updated_item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wardrobe_item(
    item_id: int,
    current_user: schemas.User = Depends(get_current_user)
):
    global fake_wardrobe_db
    initial_len = len(fake_wardrobe_db)

    item_to_delete_index = -1
    for index, item in enumerate(fake_wardrobe_db):
        if item.id == item_id:
            if item.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this item")
            item_to_delete_index = index
            break

    if item_to_delete_index != -1:
        del fake_wardrobe_db[item_to_delete_index]
        return # Returns 204 No Content

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
