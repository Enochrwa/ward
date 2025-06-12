from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from typing import List, Optional
from datetime import datetime
import shutil
import uuid
import os
from sqlalchemy.orm import Session

from .. import tables as schemas
from .. import model as models # Import models and schemas
from ..security import get_current_user # get_current_user returns schemas.User
from ..db.database import get_db

router = APIRouter(
    prefix="/wardrobe",
    tags=["Wardrobe"],
    responses={404: {"description": "Not found"}},
)

# Remove fake_wardrobe_db and next_item_id

# Define the static directory for images
STATIC_DIR = "static"
WARDROBE_IMAGES_DIR = os.path.join(STATIC_DIR, "wardrobe_images")
# Create the directory if it doesn't exist. This should ideally be done at app startup.
os.makedirs(WARDROBE_IMAGES_DIR, exist_ok=True)

@router.post("/items/", response_model=schemas.WardrobeItem, status_code=status.HTTP_201_CREATED)
async def create_wardrobe_item(
    item: schemas.WardrobeItemCreate = Depends(), # Use Depends for form data when file is also expected
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    item_data = item.model_dump() # Get data from the Pydantic model

    # Handle image upload
    if image and image.filename:
        # Generate a unique filename
        unique_id = uuid.uuid4()
        extension = os.path.splitext(image.filename)[1]
        filename = f"{unique_id}{extension}"
        file_path = os.path.join(WARDROBE_IMAGES_DIR, filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            item_data['image_url'] = f"/{file_path}"  # Store relative path, e.g., /static/wardrobe_images/uuid.jpg
        except Exception as e:
            # Log the error, potentially raise HTTPException or proceed without image
            print(f"Error saving image: {e}") # Replace with proper logging
            item_data['image_url'] = item.image_url # Fallback to image_url from body if any
        finally:
            image.file.close()
    elif item.image_url: # If no new image uploaded, but image_url is in the payload
        item_data['image_url'] = item.image_url
    else:
        item_data['image_url'] = None


    db_item = models.WardrobeItem(
        **item_data, # image_url is now part of item_data
        user_id=current_user.id,
        date_added=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        times_worn=0, # Default value
        favorite=item_data.get('favorite', False) # Ensure favorite has a default if not in item_data
    )
    # The WardrobeItem model's @tags.setter handles JSON conversion.
    # item_data from model_dump() on WardrobeItemCreate already includes tags if provided.
    # So, if item_data['tags'] is not None, it will be set correctly by **item_data.

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
    item_update: schemas.WardrobeItemUpdate = Depends(), # Use Depends for form data
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_item = db.query(models.WardrobeItem).filter(models.WardrobeItem.id == item_id, models.WardrobeItem.user_id == current_user.id).first()

    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    update_data = item_update.model_dump(exclude_unset=True)

    if image and image.filename: # A new image is being uploaded
        # Optionally, delete the old image
        if db_item.image_url:
            old_image_path_on_disk = db_item.image_url.lstrip("/") # e.g., static/wardrobe_images/uuid.jpg
            if os.path.exists(old_image_path_on_disk):
                try:
                    os.remove(old_image_path_on_disk)
                except Exception as e:
                    print(f"Error deleting old image {old_image_path_on_disk}: {e}") # Replace with proper logging

        # Save the new image
        unique_id = uuid.uuid4()
        extension = os.path.splitext(image.filename)[1]
        new_filename = f"{unique_id}{extension}"
        new_file_path_on_disk = os.path.join(WARDROBE_IMAGES_DIR, new_filename)

        try:
            with open(new_file_path_on_disk, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            update_data['image_url'] = f"/{new_file_path_on_disk}" # Update path for DB
        except Exception as e:
            print(f"Error saving new image: {e}") # Replace with proper logging
            # Decide if you want to proceed without updating image_url or raise error
        finally:
            image.file.close()

    elif 'image_url' in update_data and update_data['image_url'] is None:
        # If image_url is explicitly set to null in the request body (and no new image file uploaded)
        if db_item.image_url:
            old_image_path_on_disk = db_item.image_url.lstrip("/")
            if os.path.exists(old_image_path_on_disk):
                try:
                    os.remove(old_image_path_on_disk)
                except Exception as e:
                    print(f"Error deleting image {old_image_path_on_disk}: {e}") # Replace with proper logging
        update_data['image_url'] = None # Ensure DB field is set to None

    for key, value in update_data.items():
        setattr(db_item, key, value)

    # The WardrobeItem model's @tags.setter handles JSON conversion.
    # If 'tags' is in update_data, setattr will use the setter.

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
