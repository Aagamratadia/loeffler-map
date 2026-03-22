# ML Model Deployment Guide

## Overview

This guide covers deploying your antihypertensive drug recommender ML model alongside your Next.js application.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js Frontend (Port 3000)          │
│  - React Components (DrugDosingTool, etc.)             │
│  - API Routes (/api/predictions)                       │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP Calls
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   FastAPI Backend (Port 8000)           │
│  - ML Model Inference                                  │
│  - Drug Predictions                                    │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   MongoDB (Port 27017)                  │
│  - Prediction Logs                                     │
│  - Patient Records                                     │
└─────────────────────────────────────────────────────────┘
```

## Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- Your training dataset CSV

### 1. Setup

```bash
cd loeffler-map

# Copy environment file
cp ml_backend/.env.example ml_backend/.env

# Get your training dataset
# Place antihypertensive_dataset_expanded.csv in ./data/

# Train the model locally (optional, can skip if you have pre-trained model)
python ml_backend/train.py --data ./data/antihypertensive_dataset_expanded.csv
```

### 2. Run with Docker Compose

```bash
# Start all services
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### 3. Test the ML Endpoint

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "init_sbp": 160,
    "init_dbp": 100,
    "target_sbp": 130,
    "target_dbp": 80,
    "diabetes": 1,
    "chronic_kidney_disease": 0
  }'
```

## Deployment Options

### Option 1: Railway (Recommended - Simplest)

Railway automatically detects and deploys Docker services.

#### Setup

1. **Create a Railway account** at https://railway.app

2. **Connect your GitHub repo**:
   ```bash
   git push origin main
   ```

3. **Create services in Railway**:
   - New Project → GitHub repo
   - Add services: Next.js, Python Backend, MongoDB

4. **Configure Environment Variables**:
   ```
   # For ML Backend
   MODEL_PATH=/app/models/antihypertensive_model.pkl
   PORT=8000
   
   # For Next.js
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   MONGODB_URI=mongodb+srv://...
   ```

5. **Deploy**:
   ```bash
   # Railway auto-deploys on git push
   git add .
   git commit -m "Deploy ML model"
   git push origin main
   ```

---

### Option 2: Vercel (Frontend Only) + Railway (Backend)

Vercel excels at Next.js, but can't run Python easily.

#### Setup

1. **Deploy Frontend to Vercel**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Deploy Backend to Railway**:
   - Use Option 1 instructions for the `ml_backend/` directory only

3. **Update Frontend Environment**:
   - In Vercel dashboard → Settings → Environment Variables
   - Set `NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app`

---

### Option 3: Azure (Enterprise)

#### Create Resource Group

```bash
az group create --name loeffler-rg --location eastus
```

#### Deploy Backend (Container Instances)

```bash
# Build and push image
az acr build --registry myregistry \
  --image antihypertensive-api:latest \
  ./ml_backend/

# Deploy
az container create \
  --resource-group loeffler-rg \
  --name ml-backend \
  --image myregistry.azurecr.io/antihypertensive-api:latest \
  --ports 8000 \
  --environment-variables MODEL_PATH=/app/models/antihypertensive_model.pkl \
  --registry-login-server myregistry.azurecr.io \
  --registry-username <username> \
  --registry-password <password>
```

#### Deploy Frontend (App Service)

```bash
az appservice plan create \
  --name myappplan \
  --resource-group loeffler-rg \
  --sku B1 \
  --is-linux

az webapp create \
  --name loeffler-frontend \
  --resource-group loeffler-rg \
  --plan myappplan \
  --runtime "node|18-lts"

# Configure environment
az webapp config appsettings set \
  --resource-group loeffler-rg \
  --name loeffler-frontend \
  --settings NEXT_PUBLIC_API_URL=https://ml-backend-url.azurecontainers.io
```

---

### Option 4: AWS ECS (Advanced)

#### Build and Push to ECR

```bash
# Backend image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker build -t antihypertensive-api:latest ml_backend/
docker tag antihypertensive-api:latest <account>.dkr.ecr.us-east-1.amazonaws.com/antihypertensive-api:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/antihypertensive-api:latest
```

#### Deploy with ECS

```bash
# Create task definition
aws ecs register-task-definition \
  --family antihypertensive-api \
  --container-definitions '[...]' \
  --requires-compatibilities FARGATE \
  --network-mode awsvpc \
  --cpu "256" \
  --memory "512"

# Create service
aws ecs create-service \
  --cluster my-cluster \
  --service-name antihypertensive-api \
  --task-definition antihypertensive-api:1 \
  --desired-count 2 \
  --load-balancers targetGroupArn=...,containerName=antihypertensive-api,containerPort=8000
```

---

## Update Next.js to Call Python Backend

### Update API Route

Edit [src/app/api/predictions/route.ts](src/app/api/predictions/route.ts):

```typescript
import { NextResponse } from "next/server";

const ML_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward to Python backend
    const response = await fetch(`${ML_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`ML API error: ${response.statusText}`);
    }
    
    const prediction = await response.json();
    
    // Log to MongoDB (optional)
    // await logPredictionToMongo(body, prediction);
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { error: "Failed to get prediction" },
      { status: 500 }
    );
  }
}
```

### Update Frontend Components

In your React components:

```typescript
async function getPrediction(patientData: PatientFeatures) {
  const response = await fetch("/api/predictions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patientData),
  });
  
  if (!response.ok) throw new Error("Prediction failed");
  return response.json();
}
```

---

## Model Training & Updates

### Local Training

```bash
python ml_backend/train.py \
  --data ./data/antihypertensive_dataset_expanded.csv \
  --output ./ml_backend/models
```

### Production Training (CI/CD)

Create `.github/workflows/train-model.yml`:

```yaml
name: Train ML Model

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r ml_backend/requirements.txt
      
      - name: Download training data
        run: |
          # Download from Google Drive or your data source
          # gdown '<file-id>' -O ./data/antihypertensive_dataset_expanded.csv
      
      - name: Train model
        run: |
          python ml_backend/train.py --data ./data/antihypertensive_dataset_expanded.csv
      
      - name: Commit and push
        run: |
          git add ml_backend/models/
          git commit -m "Update ML model weights"
          git push origin main
```

---

## Monitoring & Logging

### Health Checks

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "feature_count": 29
}
```

### View Logs

```bash
# Local (Docker Compose)
docker-compose logs backend

# Railway
railway logs

# Azure
az container logs --resource-group loeffler-rg --name ml-backend
```

### Performance Metrics

Add monitoring to your API:

```python
from prometheus_client import Counter, Histogram

prediction_counter = Counter('predictions_total', 'Total predictions')
prediction_latency = Histogram('prediction_latency_seconds', 'Prediction latency')

@app.post("/predict")
@prediction_latency.time()
async def predict(patient: PatientFeatures):
    prediction_counter.inc()
    # ... prediction logic
```

---

## Troubleshooting

### Model Not Loaded

```bash
# Train model
python ml_backend/train.py --data ./data/antihypertensive_dataset_expanded.csv

# Verify
curl http://localhost:8000/health
```

### CORS Errors

Update `ml_backend/app.py`:

```python
origins = [
    "http://localhost:3000",
    "https://yourdomain.com",
    "https://*.railway.app",
]
```

### Out of Memory

Increase resources or reduce batch size:

```python
model = MultiOutputClassifier(
    RandomForestClassifier(n_estimators=50),  # Reduced from 100
    n_jobs=2  # Reduced from -1 (all cores)
)
```

---

## Recommended: Start with Railway

Railway is the easiest path:

1. Push your code to GitHub
2. Connect Railway to your repo
3. Railway auto-detects services from `docker-compose.yml`
4. Deploy with one click

**Total time: ~15 minutes**

[Railway Docs](https://docs.railway.app)
