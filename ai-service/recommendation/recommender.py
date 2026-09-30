"""
Hybrid Recommendation Engine
Combines content-based text similarity, behavioral user interaction signals,
and popularity indicators with explainable output.
"""
from typing import List, Dict, Any, Optional
from preprocessing.text_preprocessor import TFIDFVectorizer
from recommendation.scoring import RecommendationScorer

# Behavioral interaction signal weights
EVENT_WEIGHTS = {
    'PURCHASE': 1.0,
    'ADD_TO_CART': 0.6,
    'WISHLIST': 0.4,
    'PRODUCT_VIEW': 0.2
}

class HybridRecommender:
    def __init__(self):
        self.vectorizer = TFIDFVectorizer()
        self.scorer = RecommendationScorer(w_content=0.5, w_behavior=0.3, w_popularity=0.2)
        self.product_vectors: Dict[int, Dict[str, float]] = {}
        self.products_by_id: Dict[int, Dict[str, Any]] = {}
        self.indexed: bool = False

    def index_catalog(self, products: List[Dict[str, Any]]):
        self.products_by_id = {p['id']: p for p in products}
        docs = []
        pids = []

        for p in products:
            text = f"{p.get('name', '')} {p.get('brand', '')} {p.get('category', '')} {p.get('description', '')} {p.get('features_text', '')}"
            docs.append(text)
            pids.append(p['id'])

        if docs:
            self.vectorizer.fit(docs)
            self.product_vectors = {
                pid: self.vectorizer.transform(docs[idx])
                for idx, pid in enumerate(pids)
            }
            self.indexed = True

    def recommend(
        self,
        user_id: Optional[int],
        target_product_id: Optional[int],
        strategy: str,
        top_k: int,
        products: List[Dict[str, Any]],
        events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not self.indexed or len(self.products_by_id) != len(products):
            self.index_catalog(products)

        # 1. Similar Products (Content-Based) if target_product_id is provided
        if target_product_id and target_product_id in self.products_by_id:
            return self._recommend_similar_products(target_product_id, top_k)

        # 2. Check if user has interaction history
        user_events = [e for e in events if e.get('user_id') == user_id] if user_id else []

        if not user_events:
            # Cold-start strategy: return popular & highest rated products
            return self._recommend_cold_start(top_k)

        # 3. Hybrid Personalized Recommendation
        return self._recommend_hybrid(user_id, user_events, top_k)

    def _recommend_similar_products(self, target_pid: int, top_k: int) -> Dict[str, Any]:
        target_vec = self.product_vectors.get(target_pid, {})
        target_product = self.products_by_id.get(target_pid, {})
        target_cat = target_product.get('category', '')

        candidates = []
        for pid, p in self.products_by_id.items():
            if pid == target_pid:
                continue
            sim = self.vectorizer.cosine_similarity(target_vec, self.product_vectors.get(pid, {}))
            # Category boost
            if p.get('category') == target_cat:
                sim = min(1.0, sim + 0.15)

            candidates.append({
                "id": pid,
                "score": round(float(sim), 4),
                "strategy": "CONTENT_SIMILARITY",
                "reason": f"Similar specifications and category match to '{target_product.get('name')}'"
            })

        candidates.sort(key=lambda x: x['score'], reverse=True)
        return {
            "strategy": "SIMILAR_PRODUCTS",
            "algorithm_details": "TF-IDF Attribute Vectorization with Cosine Similarity",
            "recommendations": candidates[:top_k]
        }

    def _recommend_hybrid(self, user_id: int, user_events: List[Dict[str, Any]], top_k: int) -> Dict[str, Any]:
        # Compute behavioral interaction weights per product
        behavior_affinity: Dict[int, float] = {}
        category_affinity: Dict[str, float] = {}
        interacted_product_ids = set()

        for event in user_events:
            pid = event.get('product_id')
            etype = event.get('event_type')
            weight = EVENT_WEIGHTS.get(etype, 0.2)

            if pid and pid in self.products_by_id:
                behavior_affinity[pid] = behavior_affinity.get(pid, 0.0) + weight
                interacted_product_ids.add(pid)
                p_cat = self.products_by_id[pid].get('category')
                if p_cat:
                    category_affinity[p_cat] = category_affinity.get(p_cat, 0.0) + weight

        # Normalize behavior affinity to max 1.0
        max_b = max(behavior_affinity.values()) if behavior_affinity else 1.0
        norm_behavior = {pid: v / max_b for pid, v in behavior_affinity.items()}

        # Construct aggregate user interest vector from top interacted products
        top_interacted_pids = sorted(behavior_affinity.keys(), key=lambda k: behavior_affinity[k], reverse=True)[:3]
        user_interest_vec: Dict[str, float] = {}
        for pid in top_interacted_pids:
            p_vec = self.product_vectors.get(pid, {})
            for term, val in p_vec.items():
                user_interest_vec[term] = user_interest_vec.get(term, 0.0) + val

        # L2 normalize user profile vector
        import math
        u_norm = math.sqrt(sum(v * v for v in user_interest_vec.values()))
        if u_norm > 0:
            for term in user_interest_vec:
                user_interest_vec[term] = user_interest_vec[term] / u_norm

        top_fav_category = max(category_affinity.keys(), key=lambda k: category_affinity[k]) if category_affinity else None

        candidates = []
        for pid, p in self.products_by_id.items():
            content_sim = self.vectorizer.cosine_similarity(user_interest_vec, self.product_vectors.get(pid, {}))
            b_score = norm_behavior.get(pid, 0.0)

            # Category boost if it aligns with user preference
            if p.get('category') == top_fav_category:
                content_sim = min(1.0, content_sim + 0.1)

            pop_score = self.scorer.compute_popularity_score(
                rating=float(p.get('rating', 4.0)),
                rating_count=int(p.get('rating_count', 0)),
                is_featured=bool(p.get('is_featured', False))
            )

            composite = self.scorer.compute_composite_score(
                content_sim=content_sim,
                behavior_score=b_score,
                popularity_score=pop_score
            )

            # Generate natural explanation
            if pid in interacted_product_ids:
                reason = "Because of your recent views and cart interest"
                strategy_tag = "BEHAVIORAL_REENGAGEMENT"
            elif top_fav_category and p.get('category') == top_fav_category:
                reason = f"Recommended because you frequently view {top_fav_category}"
                strategy_tag = "CATEGORY_AFFINITY_HYBRID"
            else:
                reason = f"Matches your interest profile with strong {p.get('rating')}★ customer rating"
                strategy_tag = "HYBRID_CONTENT_POPULARITY"

            candidates.append({
                "id": pid,
                "score": composite,
                "strategy": strategy_tag,
                "reason": reason
            })

        # Rank descending
        candidates.sort(key=lambda x: x['score'], reverse=True)
        return {
            "strategy": "HYBRID_PERSONALIZATION",
            "algorithm_details": "0.5*Content(TF-IDF) + 0.3*Behavioral(RFM interactions) + 0.2*Popularity",
            "top_preferred_category": top_fav_category,
            "recommendations": candidates[:top_k]
        }

    def _recommend_cold_start(self, top_k: int) -> Dict[str, Any]:
        """Cold-start strategy for new or guest visitors without interaction logs."""
        candidates = []
        for pid, p in self.products_by_id.items():
            pop_score = self.scorer.compute_popularity_score(
                rating=float(p.get('rating', 4.0)),
                rating_count=int(p.get('rating_count', 0)),
                is_featured=bool(p.get('is_featured', False))
            )
            candidates.append({
                "id": pid,
                "score": round(pop_score, 4),
                "strategy": "COLD_START_POPULARITY",
                "reason": f"Customer favorite with {p.get('rating')}★ rating ({p.get('rating_count')} reviews)"
            })

        candidates.sort(key=lambda x: x['score'], reverse=True)
        return {
            "strategy": "COLD_START_POPULARITY",
            "algorithm_details": "Normalized bayesian rating + review volume + featured flag",
            "recommendations": candidates[:top_k]
        }
