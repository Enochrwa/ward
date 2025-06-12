from fastapi import FastAPI
import uvicorn

from app.routers import (
    auth,
    wardrobe,
    outfits,
    weekly_plans,
    occasions,
    style_history,
    statistics,
)

app = FastAPI()

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(wardrobe.router, prefix="/api")
app.include_router(outfits.router, prefix="/api")
app.include_router(weekly_plans.router, prefix="/api")
app.include_router(occasions.router, prefix="/api")
app.include_router(style_history.router, prefix="/api")
app.include_router(statistics.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Hello World"}


# Run Uvicorn when executing: python main.py
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Remove in production
        workers=1,  # Adjust as needed
        log_level="info",
    )
