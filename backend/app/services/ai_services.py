from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from PIL import Image # For image processing
import io # For handling byte streams
import numpy as np # For numerical operations, image manipulation
from typing import List, Optional # Added Optional for get_fashion_trends_service user
import torch # For PyTorch models

# For AI model loading and inference
from transformers import pipeline, ViTFeatureExtractor, ViTModel
from transformers import DetrFeatureExtractor, DetrForObjectDetection
from sklearn.cluster import KMeans

from .. import tables as schemas, model as models

# --- Load AI Models ---
# These models are loaded globally when the module is imported.
# For production, consider pre-downloading to the container/server.

# Image Embeddings Model (ViT)
try:
    embedding_feature_extractor = ViTFeatureExtractor.from_pretrained('google/vit-base-patch16-224-in21k')
    embedding_model = ViTModel.from_pretrained('google/vit-base-patch16-224-in21k')
except Exception as e:
    print(f"Error loading embedding models: {e}")
    embedding_feature_extractor = None
    embedding_model = None

# Object Detection Model (DETR)
try:
    object_detection_feature_extractor = DetrFeatureExtractor.from_pretrained("facebook/detr-resnet-50")
    object_detection_model = DetrForObjectDetection.from_pretrained("facebook/detr-resnet-50")
except Exception as e:
    print(f"Error loading object detection models: {e}")
    object_detection_feature_extractor = None
    object_detection_model = None

# Image Captioning Model (for style detection)
try:
    captioner = pipeline("image-to-text", model="nlpconnect/vit-gpt2-image-captioning")
except Exception as e:
    print(f"Error loading captioning model: {e}")
    captioner = None

# --- AI Functions ---

def extract_image_embedding(image: Image.Image) -> Optional[List[float]]:
    """
    Extracts image embedding using a pre-trained ViT model.
    """
    if embedding_model is None or embedding_feature_extractor is None:
        print("Embedding models not loaded. Cannot extract embedding.")
        return None
    try:
        inputs = embedding_feature_extractor(images=image, return_tensors="pt")
        with torch.no_grad(): # Ensure no gradients are computed
            outputs = embedding_model(**inputs)
        # Use the pooler output for a fixed-size embedding
        embedding = outputs.pooler_output.squeeze().tolist()
        # Alternatively, use the last hidden state (flattened)
        # embedding = outputs.last_hidden_state.flatten().tolist()
        return embedding
    except Exception as e:
        print(f"Error during image embedding extraction: {e}")
        return None

# Replace mock_extract_colors with the actual implementation
def extract_colors(image: Image.Image, num_colors=5) -> List[str]:
    """
    Extracts dominant colors from an image using KMeans clustering.
    """
    try:
        # Resize image for performance. Smaller images process faster.
        # Aspect ratio is preserved. Max dimension set to 100px.
        image.thumbnail((100, 100))

        # Convert image to numpy array
        image_arr = np.array(image)

        # Ensure image is RGB (3 channels)
        if image_arr.ndim == 2: # Grayscale image
            # Convert grayscale to RGB by replicating the single channel
            image_arr = np.stack((image_arr,)*3, axis=-1)
        elif image_arr.shape[2] == 4: # RGBA image
            # Convert RGBA to RGB by discarding the alpha channel
            image_arr = image_arr[:, :, :3]

        # Reshape to (width*height, 3) array of pixels
        pixels = image_arr.reshape(-1, 3)

        # Use KMeans to find dominant colors
        # n_init='auto' is good for scikit-learn versions that support it
        # For older versions, you might need to set n_init explicitly (e.g., 10)
        kmeans = KMeans(n_clusters=num_colors, random_state=0, n_init='auto').fit(pixels)
        dominant_colors = kmeans.cluster_centers_.astype(int)

        # Convert colors to hex strings
        hex_colors = [f"#{r:02x}{g:02x}{b:02x}" for r, g, b in dominant_colors]
        return hex_colors
    except Exception as e:
        print(f"Error during color extraction: {e}")
        # Fallback to some default colors if extraction fails
        return ["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF"]

# Replace mock_detect_style with the actual implementation
def detect_style(image: Image.Image) -> str:
    """
    Detects the style of an outfit in an image using image captioning.
    The generated caption is used as a proxy for style.
    """
    if captioner is None:
        print("Captioning model not loaded. Cannot detect style.")
        return "Style detection model not available"
    try:
        # Ensure image is in a format compatible with the captioner if necessary
        # Most Hugging Face pipelines handle PIL Images directly.
        caption_result = captioner(image)
        if caption_result and isinstance(caption_result, list) and len(caption_result) > 0:
            caption = caption_result[0]['generated_text']
            # Post-processing the caption can be done here if needed (e.g., keyword extraction)
            # For now, returning the raw caption as the style.
            return caption
        else:
            return "Could not generate caption"
    except Exception as e:
        print(f"Error during style detection: {e}")
        return "Error in style detection"

# Replace mock_identify_items with the actual implementation
def identify_items(image: Image.Image) -> List[str]:
    """
    Identifies items in an image using a pre-trained object detection model (DETR).
    """
    if object_detection_model is None or object_detection_feature_extractor is None:
        print("Object detection models not loaded. Cannot identify items.")
        return ["Object detection model not available"]

    try:
        inputs = object_detection_feature_extractor(images=image, return_tensors="pt")
        with torch.no_grad(): # Ensure no gradients are computed
            outputs = object_detection_model(**inputs)

        # Post-process the outputs
        # Target sizes should be the original image size, in (height, width) format.
        target_sizes = torch.tensor([image.size[::-1]])
        results = object_detection_feature_extractor.post_process_object_detection(
            outputs=outputs,
            threshold=0.7, # Confidence threshold
            target_sizes=target_sizes
        )[0]

        identified_labels = []
        if 'labels' in results and 'scores' in results:
            for score, label_id in zip(results['scores'], results['labels']):
                label = object_detection_model.config.id2label[label_id.item()]
                # Optional: Filter out common non-clothing items or items with low confidence
                # Example filter:
                # if label not in ["person", "background"] and score.item() > 0.7:
                identified_labels.append(label)

        if not identified_labels:
            return ["No items identified with sufficient confidence"]

        return identified_labels
    except Exception as e:
        print(f"Error during item identification: {e}")
        return ["Error in item identification"]

# --- Main Service Function ---

async def analyze_outfit_image_service(
    file: UploadFile, # Changed from image_data to UploadFile
    db: Session,
    user: schemas.User # Assuming schemas.User from get_current_user
) -> schemas.OutfitAnalysisResponse: # Define this schema
    try:
        image_bytes = await file.read()
        # Ensure image is converted to RGB after opening
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    # Perform AI analysis using the new functions
    # Embedding is extracted but not directly returned in this response for now.
    # It would typically be stored for later use (e.g., similarity searches).
    image_embedding = extract_image_embedding(image.copy()) # Use a copy if image is used elsewhere

    # Actual AI function calls
    extracted_colors = extract_colors(image.copy()) # Use a copy for functions that might modify it (like thumbnailing)
    detected_style = detect_style(image.copy())
    identified_items = identify_items(image.copy())

    # Generic recommendations and insights until more advanced services are built
    recommendations = [
        "Ensure the outfit is comfortable and appropriate for the planned occasion.",
        "Accessorize thoughtfully to enhance your look."
    ]
    if identified_items and "model not available" not in identified_items[0] and "Error in item identification" not in identified_items[0]:
        recommendations.append(f"This outfit featuring {', '.join(identified_items[:2])} looks interesting.")
    else:
        recommendations.append("Could not identify specific items, but focus on fit and color coordination.")

    # For demonstration, we're not saving the analysis to DB yet.
    # In a real application, an OutfitAnalysis record might be created here,
    # potentially storing the image_embedding as well.

    return schemas.OutfitAnalysisResponse(
        fileName=file.filename,
        contentType=file.content_type,
        style=detected_style,
        dominantColors=extracted_colors,
        identifiedItems=identified_items,
        occasionSuitability="To be determined", # Placeholder
        confidenceScore=0.75, # Placeholder, actual confidence might come from models
        recommendations=recommendations,
        colorPalette=[{"color": c, "name": "Dominant Color", "percentage": round(100/len(extracted_colors),1) if extracted_colors and "model not available" not in extracted_colors[0] and "Error" not in extracted_colors[0] else 0} for c in extracted_colors],
        styleInsights=[{"category": "Overall Style", "score": 75, "description": f"The outfit is described as: {detected_style}" if "model not available" not in detected_style and "Error" not in detected_style else "Style insights pending."}]
    )

# Placeholder for trend forecasting service (will be in Step 4)
# In backend/app/services/ai_services.py
# Replace the existing placeholder for get_fashion_trends_service

# ... (other imports and functions like analyze_outfit_image_service) ...
from typing import Optional # Make sure Optional is imported from typing

async def get_fashion_trends_service(db: Session, user: Optional[schemas.User] = None) -> schemas.TrendForecastResponse:
    # Mock implementation for now, structured like AITrendForecasting.tsx's mockForecast
    # In a real scenario:
    # - Fetch raw trend data (e.g., from social media, fashion articles, sales data).
    # - Process with NLP (transformers) for text data.
    # - Use time-series analysis (sklearn, tensorflow) for sales/popularity data.
    # - Generate personalized recommendations based on user's wardrobe/style history if 'user' is provided.

    mock_trends_data = [
        schemas.TrendDataItem(
            id='1',
            name='Neo-Cottagecore AI',
            category='Aesthetic Movement (Backend)',
            popularity=94,
            growth=267,
            description='Backend AI: A futuristic take on cottagecore with sustainable tech fabrics and earthy tones.',
            colors=['Sage Green', 'Mushroom Brown', 'Lavender', 'Cream'],
            season='Spring 2025',
            confidence=96,
            outfitImages=['https://via.placeholder.com/150/A2D2A2/000000?text=NeoCottage1', 'https://via.placeholder.com/150/D2A2D2/000000?text=NeoCottage2'],
            celebrities=['Celeb A (AI)', 'Celeb B (AI)'],
            hashtags=['#NeoCottagecoreAI', '#SustainableFashionAI'],
            priceRange='$100-$350',
            occasion=['Casual AI', 'Work From Home AI']
        ),
        schemas.TrendDataItem(
            id='2',
            name='Cyber-Minimalism AI',
            category='Fashion Tech (Backend)',
            popularity=89,
            growth=189,
            description='Backend AI: Clean lines meet smart fabrics with embedded tech and holographic accents.',
            colors=['Chrome Silver', 'Deep Black', 'Electric Blue', 'Pure White'],
            season='Fall 2025',
            confidence=92,
            outfitImages=['https://via.placeholder.com/150/C0C0C0/FFFFFF?text=CyberMin1', 'https://via.placeholder.com/150/0000FF/FFFFFF?text=CyberMin2'],
            celebrities=['Celeb C (AI)', 'Celeb D (AI)'],
            hashtags=['#CyberMinimalAI', '#TechWearAI'],
            priceRange='$180-$850',
            occasion=['Night Out AI', 'Creative Events AI']
        )
    ]

    mock_personalized_recommendations = schemas.PersonalizedRecommendations(
        mustHave=['AI: Smart casual blazer', 'AI: Sustainable denim'],
        avoid=['AI: Fast fashion basics', 'AI: Overly specific trends'],
        investIn=['AI: Quality tech outerwear', 'AI: Versatile pieces']
    )

    mock_seasonal_predictions = schemas.SeasonalPredictions(
        emerging=['AI: Biometric jewelry', 'AI: Climate-responsive clothing'],
        declining=['AI: Logo-heavy designs', 'AI: Single-use items'],
        stable=['AI: Classic denim', 'AI: White shirts (backend)']
    )

    return schemas.TrendForecastResponse(
        trends=mock_trends_data,
        personalizedRecommendations=mock_personalized_recommendations,
        seasonalPredictions=mock_seasonal_predictions
    )
