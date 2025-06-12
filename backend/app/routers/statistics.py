from fastapi import APIRouter, Depends
from typing import List, Dict
from collections import Counter

from .. import schemas
from ..security import get_current_user
from .wardrobe import fake_wardrobe_db
from .outfits import fake_outfits_db
# fake_style_history_db might be needed if wear counts are not solely from WardrobeItem.times_worn
# from .style_history import fake_style_history_db

router = APIRouter(
    prefix="/statistics",
    tags=["Statistics"],
)

@router.get("/summary", response_model=schemas.WardrobeStats)
async def get_wardrobe_summary(current_user: schemas.User = Depends(get_current_user)):
    user_items = [item for item in fake_wardrobe_db if item.user_id == current_user.id]
    user_outfits = [outfit for outfit in fake_outfits_db if outfit.user_id == current_user.id]

    total_items = len(user_items)
    total_outfits = len(user_outfits)

    items_by_category = Counter(item.category for item in user_items if item.category)
    items_by_season = Counter(item.season for item in user_items if item.season)

    favorite_items_count = sum(1 for item in user_items if item.favorite)

    # Sort items by times_worn for most/least worn
    # Ensure times_worn is available and up-to-date in user_items
    # WardrobeItem.times_worn is updated by style_history router
    sorted_items_by_wear = sorted(user_items, key=lambda x: x.times_worn, reverse=True)

    most_worn_items = sorted_items_by_wear[:5]

    # For least_worn_items, we could filter out never-worn items if desired
    # For now, include all, sorted ascending by times_worn
    least_worn_items_all = sorted(user_items, key=lambda x: x.times_worn)
    least_worn_items = least_worn_items_all[:5]

    return schemas.WardrobeStats(
        total_items=total_items,
        total_outfits=total_outfits,
        items_by_category=dict(items_by_category),
        items_by_season=dict(items_by_season),
        most_worn_items=most_worn_items,
        least_worn_items=least_worn_items,
        favorite_items_count=favorite_items_count,
    )

@router.get("/item-wear-frequency", response_model=List[schemas.ItemWearFrequency])
async def get_item_wear_frequency(current_user: schemas.User = Depends(get_current_user)):
    user_items = [item for item in fake_wardrobe_db if item.user_id == current_user.id]

    frequency_list = [
        schemas.ItemWearFrequency(item=item, wear_count=item.times_worn)
        for item in user_items
    ]

    # Sort by wear_count, descending
    sorted_frequency_list = sorted(frequency_list, key=lambda x: x.wear_count, reverse=True)

    return sorted_frequency_list

@router.get("/category-usage", response_model=List[schemas.CategoryUsage])
async def get_category_usage(current_user: schemas.User = Depends(get_current_user)):
    user_items = [item for item in fake_wardrobe_db if item.user_id == current_user.id]
    total_items = len(user_items)

    if total_items == 0:
        return []

    items_by_category = Counter(item.category for item in user_items if item.category)

    category_usage_list = []
    for category, count in items_by_category.items():
        percentage = (count / total_items) * 100 if total_items > 0 else 0
        category_usage_list.append(schemas.CategoryUsage(
            category=category,
            item_count=count,
            usage_percentage=round(percentage, 2) # Round to 2 decimal places
        ))

    # Sort by item_count or percentage, descending
    sorted_category_usage = sorted(category_usage_list, key=lambda x: x.item_count, reverse=True)

    return sorted_category_usage
