from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from .. import models, schemas
from sqlalchemy import func, or_

# Helper function to find matching outfits based on simple criteria
def find_matching_outfits_for_occasion(
    db: Session,
    user_id: int,
    occasion_name: Optional[str] = None,
    occasion_notes: Optional[str] = None,
    num_recommendations: int = 3
) -> List[models.Outfit]:

    query = db.query(models.Outfit).filter(models.Outfit.user_id == user_id)

    # Potential keywords from occasion name and notes
    keywords = []
    if occasion_name:
        keywords.extend(occasion_name.lower().split())
    if occasion_notes:
        keywords.extend(occasion_notes.lower().split())

    # Filter outfits based on keywords matching outfit name or tags
    # This is a very basic approach. More sophisticated matching would involve NLP, TF-IDF, etc.
    if keywords:
        keyword_filters = []
        for keyword in set(keywords): # Use set to avoid duplicate keywords
            keyword_filters.append(models.Outfit.name.ilike(f"%{keyword}%"))
            # Assuming Outfit.tags is a JSON string of a list. This requires DB specific functions for JSON.
            # For simplicity, we'll skip tag matching if it's complex JSON unless DB supports it easily.
            # If Outfit.tags were a simple string field:
            # keyword_filters.append(models.Outfit.tags.ilike(f"%{keyword}%"))

            # Let's assume tags are stored in a way that can be queried or filter after fetching.
            # For now, only matching outfit name.
            # A more robust solution might involve a separate tags table or FTS.

        if keyword_filters:
            query = query.filter(or_(*keyword_filters))

    # Further heuristics:
    # - Prioritize outfits with more items (more complete)
    # - Prioritize outfits favorited by user (if applicable, though Outfit model doesn't have 'favorite')
    # - Avoid recently worn outfits (requires StyleHistory lookup, can be complex here)

    # For now, just limit the number of recommendations
    recommended_outfits = query.order_by(func.random()).limit(num_recommendations).all() # Get random selection

    return recommended_outfits


async def recommend_outfits_for_occasion_service(
    db: Session,
    user: schemas.User, # User for whom recommendations are being made
    occasion: schemas.Occasion, # The occasion details
    num_recommendations: int = 3
) -> List[schemas.Outfit]: # Return a list of Outfit schemas

    # Use the helper to find matching outfits
    db_outfits = find_matching_outfits_for_occasion(
        db=db,
        user_id=user.id,
        occasion_name=occasion.name,
        occasion_notes=occasion.notes,
        num_recommendations=num_recommendations
    )

    # Convert SQLAlchemy models to Pydantic schemas
    # This assumes schemas.Outfit can be created from models.Outfit (e.g., from_attributes=True)
    # and handles the items relationship correctly.

    # Need to ensure items are loaded for each outfit to be part of the response schema
    # If not loaded by default, this would require a loop or options in the query

    # Simplified: Assuming schemas.Outfit correctly serializes items.
    # If Outfit schema expects item_ids list, that's handled by model property.
    # If it expects list of WardrobeItem schemas, that requires relationships to be loaded.

    # Let's refine find_matching_outfits_for_occasion to use joinedload for items
    # to ensure they are available for schema conversion. This is done in the calling service for now.

    recommendations = []
    for outfit_model in db_outfits:
        # Manually load items if not already loaded to ensure they appear in the schema
        # This is inefficient here; better to use joinedload in the query itself.
        # For simplicity of this subtask, let's assume the Outfit schema and its from_attributes
        # handle the items relationship correctly (e.g., by using the item_ids property or similar).
        # A robust solution would use `options(joinedload(models.Outfit.items))` in the query.
        recommendations.append(schemas.Outfit.model_validate(outfit_model))

    return recommendations


async def get_wardrobe_recommendations_service(
    db: Session,
    user: schemas.User,
    num_recommendations: int = 5
) -> schemas.PersonalizedWardrobeSuggestions: # Define this schema

    # Initial simple logic:
    # 1. Suggest items from categories the user has few of but are part of their outfits.
    # 2. Suggest creating outfits with least worn items.

    # Get user's wardrobe items
    user_items = db.query(models.WardrobeItem).filter(models.WardrobeItem.user_id == user.id).all()

    # Suggestion 1: Least worn items
    least_worn_items = sorted(user_items, key=lambda x: (x.times_worn or 0, x.date_added))[:num_recommendations]
    suggestions_for_least_worn = [
        f"Try creating a new outfit with '{item.name}' (worn {item.times_worn or 0} times)."
        for item in least_worn_items if (item.times_worn or 0) < 3 # Example threshold
    ]

    # Suggestion 2: Category gap (simplified)
    # Find categories user has items in
    user_categories = {item.category for item in user_items if item.category}

    # Example "popular" categories (could be globally defined or derived from trends)
    popular_categories = {"Tops", "Bottoms", "Shoes", "Outerwear", "Accessories"}
    missing_popular_categories = popular_suggestions = [
        f"Consider adding items to your '{cat}' category for more variety."
        for cat in popular_categories if cat not in user_categories
    ][:2] # Limit suggestions

    # Suggestion 3: Items to pair (very mock)
    pairing_suggestions = []
    if len(user_items) > 5: # Only if user has a few items
        # Mock: Suggest pairing a random top with a random bottom if not already in many outfits
        # This requires more complex outfit analysis - keeping it simple for now.
        pairing_suggestions.append("Explore new combinations: try pairing a bright top with neutral bottoms from your wardrobe.")


    # Combine suggestions
    all_suggestions = (suggestions_for_least_worn +
                       missing_popular_categories +
                       pairing_suggestions)

    # For "items to acquire", this would be more complex, e.g., based on trend data
    # or items frequently paired with user's existing items by other users (collaborative filtering).
    # Mock "items to acquire" for now:
    items_to_acquire_suggestions = []
    if "Tops" not in user_categories:
        items_to_acquire_suggestions.append("A versatile white t-shirt or a classic button-down shirt.")
    if "Outerwear" not in user_categories and any(s in user.username.lower() for s in ["cold", "winter"]): # Silly example
        items_to_acquire_suggestions.append("A warm jacket or coat for colder weather.")


    return schemas.PersonalizedWardrobeSuggestions(
        newOutfitIdeas=all_suggestions[:num_recommendations], # Cap total suggestions
        itemsToAcquire=items_to_acquire_suggestions[:2] # Cap acquisition suggestions
    )
