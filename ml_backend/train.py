#!/usr/bin/env python3
"""
Training script for antihypertensive drug recommender model.
Run this locally or in a CI/CD pipeline to train and save the model.
"""

import argparse
import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import hamming_loss, jaccard_score, classification_report
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def train_model(csv_path: str, output_dir: str = "models"):
    """
    Train the MultiOutputClassifier model from a CSV dataset.
    
    Args:
        csv_path: Path to the training dataset CSV
        output_dir: Directory to save the trained model
    """
    # Load and prepare data
    logger.info(f"Loading data from {csv_path}...")
    df = pd.read_csv(csv_path).fillna(0)
    
    # Split features and targets
    target_cols = [c for c in df.columns if c.endswith("_pref") or c.endswith("_contra")]
    feature_cols = [c for c in df.columns if c not in target_cols]
    
    X = df[feature_cols].astype(float)
    y = df[target_cols].astype(int)
    
    logger.info(f"Dataset shape: X={X.shape}, y={y.shape}")
    logger.info(f"Features: {len(feature_cols)}, Targets: {len(target_cols)}")
    
    # Split into train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    logger.info(f"Train set: {X_train.shape}, Test set: {X_test.shape}")
    
    # Train model
    logger.info("Training RandomForestClassifier with MultiOutputClassifier...")
    forest = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        n_jobs=-1,
        verbose=1,
    )
    model = MultiOutputClassifier(forest, n_jobs=-1)
    model.fit(X_train, y_train)
    
    # Evaluate
    logger.info("Evaluating model...")
    y_pred = model.predict(X_test)
    h_loss = hamming_loss(y_test, y_pred)
    try:
        j_score = jaccard_score(y_test, y_pred, average='samples', zero_division=0)
    except:
        j_score = None
    
    logger.info(f"Hamming Loss: {h_loss:.4f}")
    if j_score:
        logger.info(f"Jaccard Score: {j_score:.4f}")
    
    # Show sample report
    example_label = None
    for c in y_test.columns:
        if c.endswith("_pref"):
            example_label = c
            break
    
    if example_label:
        idx = y_test.columns.get_loc(example_label)
        logger.info(f"\nDetailed Report for '{example_label}':")
        print(classification_report(y_test.iloc[:, idx], y_pred[:, idx], zero_division=0))
    
    # Save model and metadata
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "antihypertensive_model.pkl")
    metadata_path = os.path.join(output_dir, "model_metadata.pkl")
    
    joblib.dump(model, model_path)
    joblib.dump({
        "feature_cols": feature_cols,
        "target_cols": target_cols,
        "hamming_loss": h_loss,
        "jaccard_score": j_score,
    }, metadata_path)
    
    logger.info(f"Model saved to {model_path}")
    logger.info(f"Metadata saved to {metadata_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train antihypertensive drug recommender model")
    parser.add_argument("--data", default="antihypertensive_dataset_expanded.csv",
                        help="Path to training dataset CSV")
    parser.add_argument("--output", default="models",
                        help="Directory to save trained model")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.data):
        raise FileNotFoundError(f"Dataset not found at {args.data}")
    
    train_model(args.data, args.output)
