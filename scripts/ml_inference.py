#!/usr/bin/env python3
"""
ML Model Inference Script
Used by Next.js API routes via subprocess calls.

Receives patient data as JSON stdin, outputs predictions as JSON.
"""

import sys
import json
import pickle
import os
from pathlib import Path

def load_model():
    """Load the trained model."""
    model_path = Path(__file__).parent / "models" / "antihypertensive_model.pkl"
    metadata_path = Path(__file__).parent / "models" / "model_metadata.pkl"
    
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}")
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    metadata = {}
    if metadata_path.exists():
        with open(metadata_path, 'rb') as f:
            metadata = pickle.load(f)
    
    return model, metadata

def predict(patient_data: dict, model, metadata: dict) -> dict:
    """
    Make a prediction based on patient data.
    
    Args:
        patient_data: Dictionary of feature values
        model: Trained sklearn MultiOutputClassifier
        metadata: Model metadata with feature/target columns
    
    Returns:
        Dictionary with preferred and contraindicated drugs
    """
    import pandas as pd
    
    feature_cols = metadata.get("feature_cols", [])
    target_cols = metadata.get("target_cols", [])
    
    if not feature_cols or not target_cols:
        raise ValueError("Model metadata missing feature/target columns")
    
    # Convert input to DataFrame with correct columns
    df = pd.DataFrame([patient_data])
    
    # Ensure all features are present, fill missing with 0
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0
    
    # Select and reorder features
    df = df[feature_cols].astype(float).fillna(0)
    
    # Make prediction
    predictions = model.predict(df)[0]
    
    # Extract preferred and contraindicated drugs
    pref_drugs = sorted([
        col.replace("_pref", "") 
        for col, val in zip(target_cols, predictions)
        if col.endswith("_pref") and int(val) == 1
    ])
    
    contra_drugs = sorted([
        col.replace("_contra", "") 
        for col, val in zip(target_cols, predictions)
        if col.endswith("_contra") and int(val) == 1
    ])
    
    return {
        "preferred_drugs": pref_drugs,
        "contraindicated_drugs": contra_drugs,
        "success": True,
    }

def main():
    """Main entry point for subprocess calls."""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Load model
        model, metadata = load_model()
        
        # Make prediction
        result = predict(input_data, model, metadata)
        
        # Output result as JSON
        print(json.dumps(result))
        sys.exit(0)
        
    except FileNotFoundError as e:
        error_result = {
            "success": False,
            "error": "Model not found. Please train the model first.",
            "details": str(e),
        }
        print(json.dumps(error_result))
        sys.exit(1)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "type": type(e).__name__,
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
