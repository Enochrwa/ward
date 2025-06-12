from fastapi import FastAPI
from app.routers import auth, wardrobe, outfits, weekly_plans, occasions, style_history, statistics # Import statistics router

app = FastAPI()

app.include_router(auth.router, prefix="/api")
app.include_router(wardrobe.router, prefix="/api")
app.include_router(outfits.router, prefix="/api")
app.include_router(weekly_plans.router, prefix="/api")
app.include_router(occasions.router, prefix="/api")
app.include_router(style_history.router, prefix="/api")
app.include_router(statistics.router, prefix="/api") # Include statistics router

@app.get("/")
async def root():
    return {"message": "Hello World"}
