#!/usr/bin/env python3
"""
Pre-compute predictions at build time.
Generates predictions for all possible patient profiles and stores them.

Run during CI/CD or build step:
  python scripts/generate_predictions.py --output ./public/predictions.json
"""

import argparse
import json
import sys
from pathlib import Path
import pickle
import pandas as pd
from itertools import product
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_model_and_metadata():
    """Load trained model and metadata."""
    model_path = Path("scripts/models/antihypertensive_model.pkl")
    metadata_path = Path("scripts/models/model_metadata.pkl")
    
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}")
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    with open(metadata_path, 'rb') as f:
        metadata = pickle.load(f)
    
    return model, metadata


def generate_patient_profiles(feature_cols):
    """
    Generate realistic patient profiles.
    
    Instead of all possible combinations (too many), we generate
    common/realistic profiles to reduce computation.
    """
    
    profiles = []
    
    # Define realistic ranges for each feature
    feature_ranges = {
        'category_Young_Adults_18_40': [0, 1],
        'category_Older_Adults_60': [0, 1],
        'category_Very_Old_85_Frail': [0, 1],
        'category_Pregnancy': [0, 1],
        'category_Postpartum_Women': [0, 1],
        'category_Breastfeeding_Mothers': [0, 1],
        'init_sbp': [120, 140, 160, 180],
        'init_dbp': [80, 90, 100],
        'target_sbp': [120, 130, 140],
        'target_dbp': [70, 80, 90],
        'frailty_index': [0, 0.3, 0.6],
        'adherence_score': [0, 5, 10],
        'risk_hmod': [0, 1],
        'pregnancy_trimester': [0, 1, 2, 3],
        'lactation_status': [0, 1],
        'requires_abpm': [0, 1],
        'orthostatic_risk': [0, 1],
        'electrolyte_monitoring': [0, 1],
        'postpartum_followup': [0, 1],
        'diabetes': [0, 1],
        'chronic_kidney_disease': [0, 1],
        'heart_failure': [0, 1],
        'coronary_artery_disease': [0, 1],
        'stroke_history': [0, 1],
        'obesity': [0, 1],
        'smoking': [0, 1],
        'alcohol_use': [0, 1],
        'dyslipidemia': [0, 1],
        'family_history_htn': [0, 1],
    }
    
    # Generate key combinations
    # 1. Age groups (only one per person)
    age_categories = [
        {'category_Young_Adults_18_40': 1, 'category_Older_Adults_60': 0, 'category_Very_Old_85_Frail': 0},
        {'category_Young_Adults_18_40': 0, 'category_Older_Adults_60': 1, 'category_Very_Old_85_Frail': 0},
        {'category_Young_Adults_18_40': 0, 'category_Older_Adults_60': 0, 'category_Very_Old_85_Frail': 1},
    ]
    
    # 2. Blood pressure levels
    bp_levels = [
        {'init_sbp': 120, 'init_dbp': 80},
        {'init_sbp': 140, 'init_dbp': 90},
        {'init_sbp': 160, 'init_dbp': 100},
        {'init_sbp': 180, 'init_dbp': 110},
    ]
    
    # 3. Comorbidities
    comorbidities = [
        {'diabetes': 0, 'chronic_kidney_disease': 0, 'heart_failure': 0},
        {'diabetes': 1, 'chronic_kidney_disease': 0, 'heart_failure': 0},
        {'diabetes': 0, 'chronic_kidney_disease': 1, 'heart_failure': 0},
        {'diabetes': 0, 'chronic_kidney_disease': 0, 'heart_failure': 1},
        {'diabetes': 1, 'chronic_kidney_disease': 1, 'heart_failure': 0},
    ]
    
    # Generate combinations (limited to ~100-200 realistic profiles)
    for age in age_categories:
        for bp in bp_levels:
            for comorbid in comorbidities:
                profile = {
                    'target_sbp': 130,
                    'target_dbp': 80,
                    'frailty_index': 0,
                    'adherence_score': 5,
                    'risk_hmod': 0,
                    'pregnancy_trimester': 0,
                    'lactation_status': 0,
                    'requires_abpm': 0,
                    'orthostatic_risk': 0,
                    'electrolyte_monitoring': 0,
                    'postpartum_followup': 0,
                    'coronary_artery_disease': 0,
                    'stroke_history': 0,
                    'obesity': 0,
                    'smoking': 0,
                    'alcohol_use': 0,
                    'dyslipidemia': 0,
                    'family_history_htn': 0,
                    'category_Pregnancy': 0,
                    'category_Postpartum_Women': 0,
                    'category_Breastfeeding_Mothers': 0,
                }
                profile.update(age)
                profile.update(bp)
                profile.update(comorbid)
                profiles.append(profile)
    
    return profiles


def predict_for_profiles(model, metadata, profiles):
    """Make predictions for all profiles."""
    feature_cols = metadata['feature_cols']
    target_cols = metadata['target_cols']
    
    results = []
    
    for i, profile in enumerate(profiles):
        # Convert to DataFrame
        df = pd.DataFrame([profile])
        
        # Ensure all features present
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0
        
        df = df[feature_cols].astype(float).fillna(0)
        
        # Predict
        pred = model.predict(df)[0]
        
        # Extract drugs
        pref = [col.replace('_pref', '') for col, v in zip(target_cols, pred)
                if col.endswith('_pref') and int(v) == 1]
        contra = [col.replace('_contra', '') for col, v in zip(target_cols, pred)
                  if col.endswith('_contra') and int(v) == 1]
        
        results.append({
            'profile': profile,
            'preferred_drugs': sorted(pref),
            'contraindicated_drugs': sorted(contra),
        })
    
    return results


def save_predictions(predictions, output_path):
    """Save predictions to JSON file."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(predictions, f, indent=2)
    
    logger.info(f"Saved {len(predictions)} predictions to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate predictions at build time")
    parser.add_argument("--output", default="public/predictions.json",
                        help="Output file for predictions")
    parser.add_argument("--model-path", default="scripts/models",
                        help="Path to model directory")
    
    args = parser.parse_args()
    
    try:
        logger.info("Loading model...")
        model, metadata = load_model_and_metadata()
        
        logger.info(f"Generating {metadata['feature_cols'].__len__()} feature profiles...")
        profiles = generate_patient_profiles(metadata['feature_cols'])
        logger.info(f"Generated {len(profiles)} patient profiles")
        
        logger.info("Computing predictions...")
        predictions = predict_for_profiles(model, metadata, profiles)
        
        logger.info(f"Saving to {args.output}...")
        save_predictions(predictions, args.output)
        
        logger.info(f"✅ Success! {len(predictions)} predictions ready for Vercel")
        
    except FileNotFoundError as e:
        logger.error(f"❌ Model not found: {e}")
        logger.error("Run: python scripts/train_model.py --data ./data/...")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
