"""
FastAPI backend for Antihypertensive Drug Recommender ML model.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
import joblib
import os
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Antihypertensive Drug Recommender API",
    description="ML-powered drug recommendation for antihypertensive treatments",
    version="1.0.0",
)

# Enable CORS for your Next.js frontend
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://yourdomain.com",  # Update with your actual domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Models/Schemas ---
class PatientFeatures(BaseModel):
    """Patient feature input for prediction."""
    # Demographic
    category_Young_Adults_18_40: float = 0
    category_Older_Adults_60: float = 0
    category_Very_Old_85_Frail: float = 0
    category_Pregnancy: float = 0
    category_Postpartum_Women: float = 0
    category_Breastfeeding_Mothers: float = 0
    
    # Blood pressure
    init_sbp: float = 120
    init_dbp: float = 80
    target_sbp: float = 130
    target_dbp: float = 80
    
    # Patient metrics
    frailty_index: float = 0
    adherence_score: float = 5
    risk_hmod: float = 0
    
    # Special conditions
    pregnancy_trimester: float = 0
    lactation_status: float = 0
    requires_abpm: float = 0
    orthostatic_risk: float = 0
    electrolyte_monitoring: float = 0
    postpartum_followup: float = 0
    
    # Comorbidities
    diabetes: float = 0
    chronic_kidney_disease: float = 0
    heart_failure: float = 0
    coronary_artery_disease: float = 0
    stroke_history: float = 0
    obesity: float = 0
    smoking: float = 0
    alcohol_use: float = 0
    dyslipidemia: float = 0
    family_history_htn: float = 0


class PredictionResponse(BaseModel):
    """API response with predictions."""
    preferred_drugs: List[str]
    contraindicated_drugs: List[str]
    confidence: Optional[Dict[str, float]] = None
    message: str


class HealthCheckResponse(BaseModel):
    """Health check response."""
    status: str
    model_loaded: bool
    feature_count: Optional[int] = None


# --- Model Management ---
class ModelManager:
    """Manages ML model loading and inference."""
    
    def __init__(self):
        self.model = None
        self.feature_cols = None
        self.target_cols = None
        self.is_loaded = False
    
    def load_model(self, model_path: str, feature_cols: List[str], target_cols: List[str]):
        """Load pre-trained model and metadata."""
        try:
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.feature_cols = feature_cols
                self.target_cols = target_cols
                self.is_loaded = True
                logger.info(f"Model loaded from {model_path}")
            else:
                logger.warning(f"Model file not found at {model_path}. Train a model first.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def predict(self, input_data: Dict[str, float]) -> tuple:
        """Make prediction on input data."""
        if not self.is_loaded or self.model is None:
            raise ValueError("Model not loaded. Train the model first.")
        
        # Convert dict to DataFrame with correct columns
        df = pd.DataFrame([input_data])
        
        # Ensure all required features are present
        for col in self.feature_cols:
            if col not in df.columns:
                df[col] = 0
        
        # Reorder to match training data
        df = df[self.feature_cols]
        
        # Make prediction
        predictions = self.model.predict(df)[0]
        
        # Extract preferred and contraindicated drugs
        pref_drugs = [col.replace("_pref", "") for col, val in zip(self.target_cols, predictions)
                      if col.endswith("_pref") and int(val) == 1]
        contra_drugs = [col.replace("_contra", "") for col, val in zip(self.target_cols, predictions)
                        if col.endswith("_contra") and int(val) == 1]
        
        return sorted(pref_drugs), sorted(contra_drugs)


# Initialize model manager
model_manager = ModelManager()


# --- API Routes ---
@app.on_event("startup")
async def startup_event():
    """Initialize model on startup."""
    model_path = os.getenv("MODEL_PATH", "models/antihypertensive_model.pkl")
    if os.path.exists(model_path):
        try:
            # For now, we'll train the model on startup if it doesn't exist
            # In production, you'd have a pre-trained model
            logger.info("Loading model...")
            model_manager.model = joblib.load(model_path)
            model_manager.is_loaded = True
        except Exception as e:
            logger.error(f"Startup error: {e}")


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint."""
    return HealthCheckResponse(
        status="healthy",
        model_loaded=model_manager.is_loaded,
        feature_count=len(model_manager.feature_cols) if model_manager.feature_cols else None,
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(patient: PatientFeatures):
    """
    Make a drug recommendation prediction based on patient features.
    
    Returns preferred and contraindicated drugs.
    """
    if not model_manager.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Convert pydantic model to dict
        input_data = patient.dict()
        
        # Make prediction
        pref_drugs, contra_drugs = model_manager.predict(input_data)
        
        return PredictionResponse(
            preferred_drugs=pref_drugs,
            contraindicated_drugs=contra_drugs,
            message="Prediction successful",
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/train")
async def train_model(csv_path: str = "antihypertensive_dataset_expanded.csv"):
    """
    Train the model from a CSV dataset.
    
    Requires: csv_path - path to training dataset
    """
    try:
        from sklearn.impute import SimpleImputer
        
        # Load and prepare data
        df = pd.read_csv(csv_path).fillna(0)
        
        # Split features and targets
        target_cols = [c for c in df.columns if c.endswith("_pref") or c.endswith("_contra")]
        feature_cols = [c for c in df.columns if c not in target_cols]
        
        X = df[feature_cols].astype(float)
        y = df[target_cols].astype(int)
        
        # Train model
        logger.info(f"Training on {len(X)} samples with {len(feature_cols)} features...")
        
        forest = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
        model = MultiOutputClassifier(forest, n_jobs=-1)
        model.fit(X, y)
        
        # Save model
        model_path = "models/antihypertensive_model.pkl"
        os.makedirs("models", exist_ok=True)
        joblib.dump(model, model_path)
        
        # Update manager
        model_manager.model = model
        model_manager.feature_cols = feature_cols
        model_manager.target_cols = target_cols
        model_manager.is_loaded = True
        
        logger.info(f"Model trained and saved to {model_path}")
        
        return {
            "status": "success",
            "message": "Model trained successfully",
            "features": len(feature_cols),
            "targets": len(target_cols),
            "samples": len(X),
        }
    except Exception as e:
        logger.error(f"Training error: {e}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        log_level="info",
    )
