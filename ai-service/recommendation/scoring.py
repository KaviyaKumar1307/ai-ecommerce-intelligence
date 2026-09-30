"""
Recommendation Scoring Weights & Formulas
Calculates composite weighted recommendation scores across content, behavioral, and popularity signals.
"""
from typing import Dict, Any

class RecommendationScorer:
    """
    Configurable Recommendation Scoring System
    
    Formula:
        score = (w_content * content_sim) + (w_behavior * behavior_score) + (w_popularity * pop_score)
        where:
        w_content = 0.5
        w_behavior = 0.3
        w_popularity = 0.2
        w_content + w_behavior + w_popularity = 1.0
    """
    def __init__(self, w_content: float = 0.5, w_behavior: float = 0.3, w_popularity: float = 0.2):
        self.w_content = w_content
        self.w_behavior = w_behavior
        self.w_popularity = w_popularity

    def compute_composite_score(
        self,
        content_sim: float,
        behavior_score: float,
        popularity_score: float
    ) -> float:
        score = (
            (self.w_content * content_sim) +
            (self.w_behavior * behavior_score) +
            (self.w_popularity * popularity_score)
        )
        return round(float(score), 4)

    def compute_popularity_score(self, rating: float, rating_count: int, is_featured: bool) -> float:
        """
        Normalize product rating (0 to 5) and rating volume to a [0, 1] interval.
        """
        norm_rating = min(1.0, max(0.0, (rating - 3.0) / 2.0)) if rating >= 3.0 else 0.1
        norm_volume = min(1.0, rating_count / 500.0)
        featured_bonus = 0.15 if is_featured else 0.0

        pop_score = (0.6 * norm_rating) + (0.25 * norm_volume) + featured_bonus
        return min(1.0, max(0.0, pop_score))
