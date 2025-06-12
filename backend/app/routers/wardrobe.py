from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from .. import schemas, models # Import models and schemas
from ..security import get_current_user # get_current_user returns schemas.User
from ..db.database import get_db

router = APIRouter(
    prefix="/wardrobe",
    tags=["Wardrobe"],
    responses={404: {"description": "Not found"}},
)

# Remove fake_wardrobe_db and next_item_id

@router.post("/items/", response_model=schemas.WardrobeItem, status_code=status.HTTP_201_CREATED)
async def create_wardrobe_item(
    item: schemas.WardrobeItemCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_item = models.WardrobeItem(
        **item.model_dump(),
        user_id=current_user.id,
        date_added=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        times_worn=0,
        favorite=False
    )
    if item.tags: # Assuming model setter handles JSON conversion for tags
        db_item.tags = item.tags

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/items/", response_model=List[schemas.WardrobeItem])
async def read_wardrobe_items(
    category: Optional[str] = None,
    season: Optional[str] = None,
    favorite: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    query = db.query(models.WardrobeItem).filter(models.WardrobeItem.user_id == current_user.id)

    if category:
        query = query.filter(models.WardrobeItem.category.ilike(f"%{category}%"))
    if season:
        query = query.filter(models.WardrobeItem.season.ilike(f"%{season}%"))
    if favorite is not None:
        query = query.filter(models.WardrobeItem.favorite == favorite)

    items = query.offset(skip).limit(limit).all()
    return items

@router.get("/items/{item_id}", response_model=schemas.WardrobeItem)
async def read_wardrobe_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_item = db.query(models.WardrobeItem).filter(models.WardrobeItem.id == item_id, models.WardrobeItem.user_id == current_user.id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return db_item

@router.put("/items/{item_id}", response_model=schemas.WardrobeItem)
async def update_wardrobe_item(
    item_id: int,
    item_update: schemas.WardrobeItemUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_item = db.query(models.WardrobeItem).filter(models.WardrobeItem.id == item_id, models.WardrobeItem.user_id == current_user.id).first()

    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)

    db_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wardrobe_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_item = db.query(models.WardrobeItem).filter(models.WardrobeItem.id == item_id, models.WardrobeItem.user_id == current_user.id).first()

    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    db.delete(db_item)
    db.commit()
    return
