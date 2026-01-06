#!/usr/bin/env python3
"""
Model Training Script
Trains and saves the MultiOutputClassifier model.
Run this locally before deployment.

Usage:
    python scripts/train_model.py --data path/to/dataset.csv
"""

import argparse
import sys
from pathlib import Path
import pickle
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import hamming_loss, jaccard_score, classification_report

def train_model(csv_path: str, output_dir: str = "scripts/models"):
    """
    Train the model from a CSV dataset.
    
    Args:
        csv_path: Path to training CSV
        output_dir: Directory to save model
    """
    print(f"Loading data from {csv_path}...")
    df = pd.read_csv(csv_path).fillna(0)
    
    # Split features and targets
    target_cols = [c for c in df.columns if c.endswith("_pref") or c.endswith("_contra")]
    feature_cols = [c for c in df.columns if c not in target_cols]
    
    X = df[feature_cols].astype(float)
    y = df[target_cols].astype(int)
    
    print(f"✓ Dataset: {X.shape[0]} samples, {X.shape[1]} features, {y.shape[1]} targets")
    
    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"✓ Train: {X_train.shape}, Test: {X_test.shape}")
    
    # Train
    print("Training model...")
    forest = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        n_jobs=-1,
        verbose=1,
    )
    model = MultiOutputClassifier(forest, n_jobs=-1)
    model.fit(X_train, y_train)
    
    # Evaluate
    print("\nEvaluating model...")
    y_pred = model.predict(X_test)
    h_loss = hamming_loss(y_test, y_pred)
    print(f"✓ Hamming Loss: {h_loss:.4f}")
    
    try:
        j_score = jaccard_score(y_test, y_pred, average='samples', zero_division=0)
        print(f"✓ Jaccard Score: {j_score:.4f}")
    except:
        j_score = None
    
    # Sample report
    for col in y_test.columns:
        if col.endswith("_pref"):
            idx = y_test.columns.get_loc(col)
            print(f"\nSample Report: {col}")
            print(classification_report(y_test.iloc[:, idx], y_pred[:, idx], zero_division=0))
            break
    
    # Save
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    model_path = Path(output_dir) / "antihypertensive_model.pkl"
    metadata_path = Path(output_dir) / "model_metadata.pkl"
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    metadata = {
        "feature_cols": feature_cols,
        "target_cols": target_cols,
        "hamming_loss": float(h_loss),
        "jaccard_score": float(j_score) if j_score else None,
    }
    
    with open(metadata_path, 'wb') as f:
        pickle.dump(metadata, f)
    
    print(f"\n✓ Model saved to {model_path}")
    print(f"✓ Metadata saved to {metadata_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ML model")
    parser.add_argument("--data", required=True, help="Path to training CSV")
    parser.add_argument("--output", default="scripts/models", help="Output directory")
    
    args = parser.parse_args()
    
    if not Path(args.data).exists():
        print(f"❌ Error: {args.data} not found")
        sys.exit(1)
    
    train_model(args.data, args.output)
    print("\n✅ Training complete!")
