from pydantic import BaseModel, model_validator
from datetime import datetime, date
from typing import List, Optional, Dict

class User(BaseModel):
    id: int
    username: str
    email: str
    # hashed_password: str # Should not be in response model
    created_at: datetime
    updated_at: datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class WardrobeItem(BaseModel):
    id: int
    user_id: int
    name: str
    brand: Optional[str] = None
    category: str
    size: Optional[str] = None
    price: Optional[float] = None
    material: Optional[str] = None
    season: Optional[str] = None  # e.g., Summer, Winter, All Seasons
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    favorite: bool = False
    times_worn: int = 0
    date_added: datetime
    last_worn: Optional[datetime] = None
    updated_at: Optional[datetime] = None # Added for tracking updates

class WardrobeItemCreate(BaseModel):
    name: str
    brand: Optional[str] = None
    category: str
    size: Optional[str] = None
    price: Optional[float] = None
    material: Optional[str] = None
    season: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    # user_id is set from current_user
    # date_added is set automatically
    # user_id is set from current_user
    # date_added is set automatically
    # times_worn, favorite are set to defaults
    # times_worn and last_worn are handled by StyleHistory logging

class WardrobeItemUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    size: Optional[str] = None
    price: Optional[float] = None
    material: Optional[str] = None
    season: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    favorite: Optional[bool] = None
    # times_worn and last_worn are usually updated by StyleHistory logging or specific actions

class Outfit(BaseModel):
    id: int
    user_id: int
    name: str
    item_ids: List[int]  # List of WardrobeItem ids
    created_at: datetime
    updated_at: Optional[datetime] = None # Ensure this is present and optional
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None  # For a composed image of the outfit

class OutfitCreate(BaseModel):
    name: str
    item_ids: List[int]
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None

class OutfitUpdate(BaseModel):
    name: Optional[str] = None
    item_ids: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None

class WeeklyPlan(BaseModel):
    id: int
    user_id: int
    name: str  # e.g., "Work Week Outfits", "Vacation Plan"
    start_date: date
    end_date: date
    daily_outfits: Dict[str, Optional[int]]  # E.g., {"monday": outfit_id_123, "tuesday": None, ...}
    created_at: datetime
    updated_at: Optional[datetime] = None # Ensure this is present and optional

class WeeklyPlanCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    daily_outfits: Dict[str, Optional[int]]

class WeeklyPlanUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    daily_outfits: Optional[Dict[str, Optional[int]]] = None

class Occasion(BaseModel):
    id: int
    user_id: int
    name: str  # E.g., "Wedding Guest", "Beach Party"
    date: Optional[datetime] = None
    outfit_id: Optional[int] = None # Foreign key to Outfit
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None # Ensure this is present and optional

class OccasionCreate(BaseModel):
    name: str
    date: Optional[datetime] = None
    outfit_id: Optional[int] = None
    notes: Optional[str] = None

class OccasionUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[datetime] = None
    outfit_id: Optional[int] = None # Can be set to None to remove an outfit
    notes: Optional[str] = None

class StyleHistoryBase(BaseModel):
    item_id: Optional[int] = None
    outfit_id: Optional[int] = None
    date_worn: datetime
    notes: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def check_item_or_outfit_id(cls, values):
        item_id, outfit_id = values.get('item_id'), values.get('outfit_id')
        if (item_id is None and outfit_id is None) or \
           (item_id is not None and outfit_id is not None):
            raise ValueError('Either item_id or outfit_id must be provided, but not both.')
        # Ensure that if one is provided, it's an int. Pydantic will handle if it's not parseable to int.
        # The main check here is the mutual exclusivity.
        return values

class StyleHistoryCreate(StyleHistoryBase):
    pass

class StyleHistory(StyleHistoryBase):
    id: int
    user_id: int
    # Fields from StyleHistoryBase are inherited: item_id, outfit_id, date_worn, notes

# Statistics Schemas
class WardrobeStats(BaseModel):
    total_items: int
    total_outfits: int
    items_by_category: Dict[str, int]
    items_by_season: Dict[str, int]
    most_worn_items: List[WardrobeItem] # Using existing WardrobeItem schema
    least_worn_items: List[WardrobeItem]
    favorite_items_count: int

class ItemWearFrequency(BaseModel):
    item: WardrobeItem # Using existing WardrobeItem schema
    wear_count: int

class CategoryUsage(BaseModel):
    category: str
    item_count: int
    usage_percentage: float
