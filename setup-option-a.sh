#!/bin/bash

# Quick Setup for Option A: Embedded ML Model
# Run this to get started with local development

set -e

echo "🚀 Setting up Loeffler with Embedded ML Model (Option A)"
echo "=========================================================="

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required. Please install Python 3.9+"
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Create directories
echo "\n✓ Creating directories..."
mkdir -p scripts/models
mkdir -p data

# Install Python dependencies
echo "\n✓ Installing Python dependencies..."
pip install -r ml_backend/requirements.txt

# Check for training data
echo "\n⚠️  Next: Train your ML model"
echo ""
echo "If you have the training dataset, run:"
echo "  python scripts/train_model.py --data ./data/antihypertensive_dataset_expanded.csv"
echo ""
echo "Then start development:"
echo "  docker-compose up"
echo "  or"
echo "  npm run dev"
echo ""
echo "==============================================================="
echo "For deployment options, see: OPTION_A_DEPLOYMENT.md"
echo "==============================================================="
