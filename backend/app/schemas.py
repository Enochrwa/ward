from pydantic import BaseModel, model_validator
from datetime import datetime, date
from typing import List, Optional, Dict

# Forward declaration for Outfit used in Occasion
class Outfit(BaseModel):
    pass

class User(BaseModel):
    id: int
    username: str
    email: str
    # hashed_password: str # Should not be in response model
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True # For Pydantic v2

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

    class Config:
        from_attributes = True

class WardrobeItem(BaseModel):
    id: int
    user_id: int
    name: str
    brand: Optional[str] = None
    category: str
    size: Optional[str] = None
    price: Optional[float] = None
    material: Optional[str] = None
    season: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    favorite: bool = False
    times_worn: int = 0
    date_added: datetime
    last_worn: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

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

class Outfit(BaseModel): # Actual definition of Outfit
    id: int
    user_id: int
    name: str
    item_ids: List[int]
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

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
    name: str
    start_date: date
    end_date: date
    daily_outfits: Dict[str, Optional[int]]
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

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
    name: str
    date: Optional[datetime] = None
    outfit_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    suggested_outfits: Optional[List[Outfit]] = None # Correctly referencing Outfit

    class Config:
        from_attributes = True

class OccasionCreate(BaseModel):
    name: str
    date: Optional[datetime] = None
    outfit_id: Optional[int] = None
    notes: Optional[str] = None

class OccasionUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[datetime] = None
    outfit_id: Optional[int] = None
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
        return values

class StyleHistoryCreate(StyleHistoryBase):
    pass

class StyleHistory(StyleHistoryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Statistics Schemas
class WardrobeStats(BaseModel):
    total_items: int
    total_outfits: int
    items_by_category: Dict[str, int]
    items_by_season: Dict[str, int]
    most_worn_items: List[WardrobeItem]
    least_worn_items: List[WardrobeItem]
    favorite_items_count: int

    class Config:
        from_attributes = True

class ItemWearFrequency(BaseModel):
    item: WardrobeItem
    wear_count: int

    class Config:
        from_attributes = True

class CategoryUsage(BaseModel):
    category: str
    item_count: int
    usage_percentage: float

    class Config:
        from_attributes = True

# AI Service Schemas
class ColorPaletteItem(BaseModel):
    color: str
    name: str
    percentage: float

class StyleInsightItem(BaseModel):
    category: str
    score: int # Or float
    description: str

class OutfitAnalysisResponse(BaseModel):
    fileName: Optional[str] = None
    contentType: Optional[str] = None
    style: str
    dominantColors: List[str]
    identifiedItems: List[str]
    occasionSuitability: str
    confidenceScore: float
    recommendations: List[str]
    colorPalette: Optional[List[ColorPaletteItem]] = None
    styleInsights: Optional[List[StyleInsightItem]] = None

    class Config:
        from_attributes = True

class TrendDataItem(BaseModel):
    id: str
    name: str
    category: str
    popularity: int
    growth: int
    description: str
    colors: List[str]
    season: str
    confidence: int
    outfitImages: Optional[List[str]] = None
    celebrities: Optional[List[str]] = None
    hashtags: Optional[List[str]] = None
    priceRange: Optional[str] = None
    occasion: Optional[List[str]] = None

class PersonalizedRecommendations(BaseModel): # Used by TrendForecastResponse
    mustHave: List[str]
    avoid: List[str]
    investIn: List[str]

class SeasonalPredictions(BaseModel): # Used by TrendForecastResponse
    emerging: List[str]
    declining: List[str]
    stable: List[str]

class TrendForecastResponse(BaseModel):
    trends: List[TrendDataItem]
    personalizedRecommendations: PersonalizedRecommendations
    seasonalPredictions: SeasonalPredictions

    class Config:
        from_attributes = True

# Recommendation Service Schemas
class PersonalizedWardrobeSuggestions(BaseModel):
    newOutfitIdeas: List[str]
    itemsToAcquire: List[str]

    class Config:
        from_attributes = True

# Update forward references if Pydantic v1 style is strictly needed
# For Pydantic v2, this is often handled more automatically.
# If issues arise, call Model.model_rebuild() for models with forward refs
# after all definitions. This is typically done once at application startup.
# For now, we assume Pydantic v2 handles it or this structure is fine.
User.model_rebuild()
Token.model_rebuild()
WardrobeItem.model_rebuild()
Outfit.model_rebuild()
WeeklyPlan.model_rebuild()
Occasion.model_rebuild()
StyleHistory.model_rebuild()
WardrobeStats.model_rebuild()
ItemWearFrequency.model_rebuild()
CategoryUsage.model_rebuild()
OutfitAnalysisResponse.model_rebuild()
TrendForecastResponse.model_rebuild()
PersonalizedWardrobeSuggestions.model_rebuild()
