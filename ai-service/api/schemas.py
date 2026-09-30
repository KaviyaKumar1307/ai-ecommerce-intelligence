"""
Pydantic Request & Response Validation Schemas for FastAPI AI Service
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# --- Semantic Search Schemas ---
class ProductPayload(BaseModel):
    id: int
    name: str
    description: Optional[str] = ""
    brand: Optional[str] = ""
    category: Optional[str] = ""
    category_id: Optional[int] = None
    price: Optional[float] = 0.0
    rating: Optional[float] = 4.0
    rating_count: Optional[int] = 0
    is_featured: Optional[bool] = False
    features_text: Optional[str] = ""

class SemanticSearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 10
    products: List[ProductPayload]

class SemanticSearchResultItem(BaseModel):
    id: int
    name: Optional[str]
    similarity_score: float
    matched_terms: List[str]
    explanation: str

class SemanticSearchResponse(BaseModel):
    success: bool = True
    query: str
    algorithm: str
    formula: str
    total_matches: int
    results: List[SemanticSearchResultItem]

# --- Recommendation Schemas ---
class EventPayload(BaseModel):
    user_id: Optional[int] = None
    product_id: Optional[int] = None
    event_type: str
    timestamp: Optional[Any] = None

class RecommendationRequest(BaseModel):
    user_id: Optional[int] = None
    target_product_id: Optional[int] = None
    strategy: Optional[str] = "HYBRID"
    top_k: Optional[int] = 8
    products: List[ProductPayload]
    events: Optional[List[EventPayload]] = []

class RecommendationItem(BaseModel):
    id: int
    score: float
    strategy: str
    reason: str

class RecommendationResponse(BaseModel):
    success: bool = True
    strategy: str
    algorithm_details: str
    top_preferred_category: Optional[str] = None
    recommendations: List[RecommendationItem]

# --- Shopping Assistant Schemas ---
class AssistantMessage(BaseModel):
    role: str
    content: str

class ShoppingAssistantRequest(BaseModel):
    message: str
    history: Optional[List[AssistantMessage]] = []
    products: List[ProductPayload]

class SuggestedProductItem(BaseModel):
    id: int
    rank: int
    match_reason: str

class ShoppingAssistantResponse(BaseModel):
    success: bool = True
    reply: str
    parsed_filters: Dict[str, Any]
    intent: str
    suggested_products: List[SuggestedProductItem]

# --- Forecasting Schemas ---
class HistoricalSalesRecord(BaseModel):
    date: str
    total_sales: float
    total_orders: Optional[int] = 0
    total_units: Optional[int] = 0

class ForecastRequest(BaseModel):
    horizon_days: Optional[int] = 14
    historical_sales: List[HistoricalSalesRecord]

class ForecastItem(BaseModel):
    date: str
    day_name: str
    predicted_sales: float
    lower_bound: float
    upper_bound: float

class ForecastResponse(BaseModel):
    success: bool = True
    model: str
    version: str
    trained_at: str
    metrics: Dict[str, float]
    horizon_days: int
    forecast: List[ForecastItem]

# --- Customer Segmentation Schemas ---
class CustomerFeatureRecord(BaseModel):
    user_id: int
    name: str
    email: str
    total_spending: float
    number_of_orders: int
    average_order_value: float
    recency_days: float
    product_views: int
    cart_activity: int

class SegmentationRequest(BaseModel):
    customers: List[CustomerFeatureRecord]

class SegmentProfile(BaseModel):
    cluster_id: int
    name: str
    customer_count: int
    characteristics: str
    metrics: Dict[str, float]
    customers: List[Dict[str, Any]]

class SegmentationResponse(BaseModel):
    success: bool = True
    algorithm: str
    k_clusters: int
    silhouette_score: float
    features_used: List[str]
    segments: List[SegmentProfile]
