#!/bin/bash

# Setup script for antihypertensive drug recommender deployment

set -e  # Exit on error

echo "🚀 Setting up Antihypertensive Drug Recommender Deployment"
echo "=========================================================="

# Check prerequisites
echo "\n✓ Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git."
    exit 1
fi

echo "✓ Docker and Git found"

# Create directories
echo "\n✓ Creating directories..."
mkdir -p ml_backend/models
mkdir -p data
mkdir -p .github/workflows

# Create environment files
echo "✓ Creating environment files..."
cp ml_backend/.env.example ml_backend/.env
echo "Created ml_backend/.env (update with your settings)"

# Download training data (optional)
echo "\n⚠️  Training data setup:"
echo "Place your CSV file at: ./data/antihypertensive_dataset_expanded.csv"
echo "Or update the path in ml_backend/.env"

# Check if training data exists
if [ -f "data/antihypertensive_dataset_expanded.csv" ]; then
    echo "✓ Training data found!"
    
    # Offer to train model
    read -p "Train model now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Training model..."
        python3 ml_backend/train.py --data ./data/antihypertensive_dataset_expanded.csv
        echo "✓ Model trained!"
    fi
else
    echo "⚠️  No training data found. Skipping model training."
    echo "You can train the model later with:"
    echo "  python3 ml_backend/train.py --data ./data/antihypertensive_dataset_expanded.csv"
fi

# Install Python dependencies for local dev
echo "\n✓ Installing Python dependencies..."
pip install -r ml_backend/requirements.txt

# Setup Git hooks (optional)
echo "\n✓ Setting up Git hooks..."
mkdir -p .git/hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook: ensure no secrets are committed
if grep -r "MONGODB_URI\|API_KEY\|SECRET" --include="*.py" --include="*.ts" --include="*.env" --exclude-dir=node_modules --exclude-dir=.venv .; then
    echo "❌ Potential secrets detected. Please remove before committing."
    exit 1
fi
EOF
chmod +x .git/hooks/pre-commit

# Display next steps
echo "\n✅ Setup Complete!"
echo "=========================================================="
echo "\nNext steps:"
echo ""
echo "1. Update Configuration:"
echo "   - Edit ml_backend/.env with your settings"
echo "   - Update MONGODB_URI in environment variables"
echo ""
echo "2. Start Development Environment:"
echo "   docker-compose up"
echo ""
echo "3. Test the API:"
echo "   curl -X GET http://localhost:8000/health"
echo ""
echo "4. View API Documentation:"
echo "   http://localhost:8000/docs"
echo ""
echo "5. Deploy to Production:"
echo "   - Follow instructions in DEPLOYMENT.md"
echo "   - Recommended: Use Railway (https://railway.app)"
echo ""
echo "=========================================================="
