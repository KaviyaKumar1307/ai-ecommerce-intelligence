"""
AI Service Main Application Entry Point
FastAPI AI Service for AI-Powered E-Commerce Intelligence System
"""
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as ai_router

app = FastAPI(
    title="AI-Powered E-Commerce Intelligence Engine",
    description="High-performance Python ML/NLP service powering semantic search, hybrid recommendations, conversational assistant, time-series forecasting, and customer segmentation.",
    version="1.0.0"
)

# Enable CORS for Node.js backend and local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all AI endpoints
app.include_router(ai_router)

@app.get("/")
def root():
    return {
        "service": "AI-Powered E-Commerce Intelligence Engine",
        "status": "ONLINE",
        "documentation": "/docs",
        "health_check": "/health"
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🧠 Starting FastAPI AI Engine on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
