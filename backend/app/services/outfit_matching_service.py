from typing import List, Dict, Any, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from itertools import combinations

# Placeholder for more sophisticated color harmony logic
# For now, we'll use a simplified approach.

# Helper to convert hex to RGB
def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

# Basic color harmony checks (can be expanded significantly)
def check_color_harmony(colors_hex: List[str]) -> float:
    if not colors_hex or len(colors_hex) < 2:
        return 1.0 # Neutral score if not enough colors to compare

    # Simple rule: Penalize if too many highly saturated, different colors
    # This is a very basic placeholder. Real color harmony is complex.
    # For example, check if there's a mix of neutrals and accents,
    # or if colors belong to a known pleasing palette (analogous, complementary, etc.)

    # Example: Count unique 'bright' colors.
    # A more advanced version would analyze HSL/HSV values.
    num_colors = len(colors_hex)
    # Simplified: if more than 2-3 primary-like colors, penalize slightly.
    # This is not robust.
    if num_colors > 3: # Arbitrary threshold
        # Consider variance in RGB values as a proxy for diversity
        rgb_colors = [hex_to_rgb(c) for c in colors_hex]
        if len(rgb_colors) > 1:
            variance = np.var(rgb_colors, axis=0).mean()
            if variance > 3000: # High variance might mean clashing, arbitrary
                return 0.6
    return 0.8 # Default score if basic checks pass


class OutfitMatchingService:
    def __init__(self):
        # Potentially load models or configurations if needed in the future
        pass

    def calculate_compatibility_score(
        self,
        item_features: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculates an overall compatibility score for a list of items.
        Each item in item_features should be a dict with at least:
        {
            "id": "item_id", // Or some identifier
            "embedding": List[float], // Image embedding
            "colors": List[str] // List of dominant hex colors
        }
        """
        if not item_features or len(item_features) < 2:
            return {
                "score": 0.0,
                "message": "Not enough items to compare.",
                "style_cohesion_score": 0.0,
                "color_harmony_score": 0.0
            }

        embeddings = [np.array(item["embedding"]) for item in item_features if item.get("embedding")]

        # 1. Style Cohesion (using embeddings)
        style_cohesion_score = 0.0
        if len(embeddings) >= 2:
            pairwise_similarities = []
            for emb1, emb2 in combinations(embeddings, 2):
                similarity = cosine_similarity(emb1.reshape(1, -1), emb2.reshape(1, -1))[0][0]
                pairwise_similarities.append(similarity)

            if pairwise_similarities:
                style_cohesion_score = np.mean(pairwise_similarities)
                # Normalize to 0-1 range (cosine similarity is -1 to 1, but embeddings usually non-negative relations)
                style_cohesion_score = (style_cohesion_score + 1) / 2
        else: # Not enough embeddings to compare
             style_cohesion_score = 0.5 # Neutral score

        # 2. Color Harmony
        # Collect all dominant colors from all items in the outfit
        all_dominant_colors_hex = []
        for item in item_features:
            if item.get("colors"):
                all_dominant_colors_hex.extend(item["colors"])

        # Use unique colors for harmony check to avoid penalizing multiple items of same color
        unique_colors_hex = list(set(all_dominant_colors_hex))
        color_harmony_score = check_color_harmony(unique_colors_hex)

        # 3. Combine scores (simple weighted average for now)
        # Weights can be tuned
        style_weight = 0.7
        color_weight = 0.3
        overall_score = (style_cohesion_score * style_weight) + (color_harmony_score * color_weight)

        # Ensure score is between 0 and 1
        overall_score = max(0, min(1, overall_score))

        return {
            "score": round(overall_score, 3),
            "style_cohesion_score": round(style_cohesion_score, 3),
            "color_harmony_score": round(color_harmony_score, 3),
            "message": "Compatibility calculated."
        }

# Example usage (for testing or if used directly):
# if __name__ == "__main__":
#     matcher = OutfitMatchingService()
#     # Example item features (embeddings would be large lists of floats)
#     mock_embedding_1 = [0.1] * 512 # Example embedding size for ViT base
#     mock_embedding_2 = [0.15] * 512
#     mock_embedding_3 = [0.5] * 512

#     items = [
#         {"id": "item1", "embedding": mock_embedding_1, "colors": ["#FF0000", "#FFFFFF"]},
#         {"id": "item2", "embedding": mock_embedding_2, "colors": ["#0000FF", "#F0F0F0"]},
#         # Item with different style embedding and potentially clashing color
#         {"id": "item3", "embedding": mock_embedding_3, "colors": ["#00FF00"]},
#     ]
#     result = matcher.calculate_compatibility_score(items)
#     print(result)

#     items_single = [
#          {"id": "item1", "embedding": mock_embedding_1, "colors": ["#FF0000", "#FFFFFF"]},
#     ]
#     result_single = matcher.calculate_compatibility_score(items_single)
#     print(result_single)

#     items_no_embeddings = [
#         {"id": "item1", "colors": ["#FF0000", "#FFFFFF"]},
#         {"id": "item2", "colors": ["#0000FF", "#F0F0F0"]},
#     ]
#     result_no_emb = matcher.calculate_compatibility_score(items_no_embeddings)
#     print(result_no_emb)
