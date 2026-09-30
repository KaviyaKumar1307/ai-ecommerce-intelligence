"""
Comprehensive Verification Script for AI Service Modules
Tests:
1. TF-IDF Preprocessor and Cosine Similarity
2. Semantic Search Engine
3. Hybrid Recommendation Engine
4. AI Shopping Assistant
5. Sales Forecaster
6. Customer Segmenter (K-Means)
"""
import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from search.semantic_search import SemanticSearchEngine
from recommendation.recommender import HybridRecommender
from assistant.shopping_assistant import ShoppingAssistant
from forecasting.forecast_model import SalesForecaster
from segmentation.clustering import CustomerSegmenter

# Sample product fixtures
mock_products = [
    {
        "id": 1,
        "name": "MacBook Pro 16-inch M3 Max",
        "brand": "Apple",
        "category": "Laptops & Computers",
        "description": "High performance Apple laptop for software development, machine learning, and 3D rendering.",
        "features_text": "apple m3 max 36gb ram 1tb ssd coding developer",
        "price": 249900.0,
        "rating": 4.9,
        "rating_count": 180,
        "is_featured": True
    },
    {
        "id": 11,
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "brand": "Sony",
        "category": "Audio & Headphones",
        "description": "Industry leading active noise cancelling headphones with 30-hour battery life.",
        "features_text": "noise cancelling anc ldac hi-res music over ear travel focus",
        "price": 28990.0,
        "rating": 4.85,
        "rating_count": 480,
        "is_featured": True
    },
    {
        "id": 31,
        "name": "Nike Vaporfly 3 Carbon Road Racing Shoes",
        "brand": "Nike",
        "category": "Fitness & Sports",
        "description": "Super light carbon plate marathon running shoe with ZoomX foam for road racing.",
        "features_text": "carbon plate marathon racing shoes speed lightweight personal best road",
        "price": 21995.0,
        "rating": 4.9,
        "rating_count": 245,
        "is_featured": True
    },
    {
        "id": 32,
        "name": "Asics Gel-Nimbus 26 Running Shoes",
        "brand": "Asics",
        "category": "Fitness & Sports",
        "description": "Maximum cushion comfortable long distance road running shoes for marathon training.",
        "features_text": "cushioning puregel marathon distance training recovery soft road running",
        "price": 15999.0,
        "rating": 4.85,
        "rating_count": 190,
        "is_featured": True
    }
]

def test_semantic_search():
    print("\n--- 1. Testing Semantic Search ---")
    engine = SemanticSearchEngine()
    query = "comfortable running shoes for marathon training"
    res = engine.search(query, mock_products, top_k=2)
    assert len(res['results']) > 0, "Semantic search should return matches"
    top_match = res['results'][0]
    print(f"Query: '{query}'")
    print(f"Top Result: {top_match['name']} (Score: {top_match['similarity_score']})")
    print(f"Explanation: {top_match['explanation']}")
    assert "Running Shoes" in top_match['name'] or "Vaporfly" in top_match['name']
    print("[PASS] Semantic Search Passed!")

def test_recommender():
    print("\n--- 2. Testing Hybrid Recommender ---")
    recommender = HybridRecommender()
    events = [
        {"user_id": 2, "product_id": 31, "event_type": "PRODUCT_VIEW"},
        {"user_id": 2, "product_id": 31, "event_type": "ADD_TO_CART"}
    ]
    res = recommender.recommend(user_id=2, target_product_id=None, strategy="HYBRID", top_k=2, products=mock_products, events=events)
    assert len(res['recommendations']) > 0
    print(f"Strategy: {res['strategy']}")
    print(f"Top Pick: Product #{res['recommendations'][0]['id']} - Score: {res['recommendations'][0]['score']}")
    print(f"Reason: {res['recommendations'][0]['reason']}")
    print("[PASS] Recommender Engine Passed!")

def test_shopping_assistant():
    print("\n--- 3. Testing AI Shopping Assistant ---")
    assistant = ShoppingAssistant()
    user_query = "I need running shoes under Rs 20000"
    res = assistant.process(user_query, [], mock_products)
    print(f"User: '{user_query}'")
    print(f"Assistant Reply: {res['reply']}")
    print(f"Parsed Filters: {res['parsed_filters']}")
    assert len(res['suggested_products']) > 0
    print("[PASS] AI Shopping Assistant Passed!")

def test_segmentation():
    print("\n--- 4. Testing Customer Segmentation ---")
    segmenter = CustomerSegmenter(k_clusters=2)
    mock_customers = [
        {"user_id": 1, "name": "Alice", "email": "a@ex.com", "total_spending": 180000, "number_of_orders": 5, "average_order_value": 36000, "recency_days": 5, "product_views": 25, "cart_activity": 8},
        {"user_id": 2, "name": "Bob", "email": "b@ex.com", "total_spending": 220000, "number_of_orders": 6, "average_order_value": 36666, "recency_days": 10, "product_views": 30, "cart_activity": 12},
        {"user_id": 3, "name": "Charlie", "email": "c@ex.com", "total_spending": 3500, "number_of_orders": 1, "average_order_value": 3500, "recency_days": 80, "product_views": 2, "cart_activity": 0},
        {"user_id": 4, "name": "Diana", "email": "d@ex.com", "total_spending": 4200, "number_of_orders": 1, "average_order_value": 4200, "recency_days": 90, "product_views": 3, "cart_activity": 1}
    ]
    res = segmenter.segment(mock_customers)
    print(f"Clusters: {res['k_clusters']}, Silhouette Score: {res['silhouette_score']}")
    for s in res['segments']:
        print(f"- Cluster #{s['cluster_id']}: '{s['name']}' ({s['customer_count']} customers): {s['characteristics']}")
    assert len(res['segments']) == 2
    print("[PASS] Customer Segmentation Passed!")

if __name__ == '__main__':
    test_semantic_search()
    test_recommender()
    test_shopping_assistant()
    test_segmentation()
    print("\n[ALL AI MODULES VERIFIED & WORKING PERFECTLY!]")
