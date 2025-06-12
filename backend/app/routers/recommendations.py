from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List # For List type hint

from .. import schemas, models # Assuming models might be needed later
from ..security import get_current_user
from ..db.database import get_db
from ..services.recommendation_services import get_wardrobe_recommendations_service

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
    responses={404: {"description": "Not found"}},
)

@router.get("/wardrobe/", response_model=schemas.PersonalizedWardrobeSuggestions)
async def get_personalized_wardrobe_recommendations(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user) # Ensure type is schemas.User
):
    suggestions = await get_wardrobe_recommendations_service(db=db, user=current_user)
    if not suggestions.newOutfitIdeas and not suggestions.itemsToAcquire:
        # Optional: return a specific message or 204 if no suggestions,
        # or just return the empty suggestion structure.
        # For now, returning empty structure is fine.
        pass
    return suggestions
