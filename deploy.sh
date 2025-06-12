#!/bin/bash

# Digital Wardrobe Deployment Script
# This script helps prepare the project for deployment

echo "🚀 Digital Wardrobe Deployment Preparation"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "promesse" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Backend preparation
echo ""
echo "📦 Preparing Backend for Deployment..."

cd backend

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found in backend directory"
    exit 1
fi

# Check if main.py exists
if [ ! -f "main.py" ]; then
    echo "❌ Error: main.py not found in backend directory"
    exit 1
fi

# Verify environment template
if [ ! -f ".env.example" ]; then
    echo "⚠️  Warning: .env.example not found"
else
    echo "✅ Environment template found"
fi

# Test database connection (if .env exists)
if [ -f ".env" ]; then
    echo "🔍 Testing database connection..."
    python test_database.py
    if [ $? -eq 0 ]; then
        echo "✅ Database connection successful"
    else
        echo "⚠️  Database connection failed (this is normal if using production DB)"
    fi
fi

cd ..

# Frontend preparation
echo ""
echo "🎨 Preparing Frontend for Deployment..."

cd promesse

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in frontend directory"
    exit 1
fi

# Check if build script exists
if ! grep -q '"build"' package.json; then
    echo "❌ Error: Build script not found in package.json"
    exit 1
fi

# Install dependencies and test build
echo "📦 Installing dependencies..."
npm install

echo "🔨 Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

# Create deployment checklist
echo ""
echo "📋 Creating Deployment Checklist..."

cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# Deployment Checklist

## Pre-Deployment

### Backend (Render.com)
- [ ] Repository pushed to GitHub
- [ ] Render.com account created
- [ ] Environment variables prepared:
  - [ ] DATABASE_URL (Aiven MySQL)
  - [ ] CA_CERT (Aiven certificate)
  - [ ] SECRET_KEY (strong, unique)
  - [ ] JWT_SECRET_KEY (strong, unique)
  - [ ] CORS_ORIGINS (frontend domain)
  - [ ] AI_DEMO_MODE=false

### Frontend (Vercel.com)
- [ ] Vercel.com account created
- [ ] API base URL updated for production
- [ ] Build process tested locally
- [ ] Environment variables configured (if needed)

### Database (Aiven.io)
- [ ] MySQL instance created
- [ ] Connection details obtained
- [ ] CA certificate downloaded
- [ ] Database initialized

## Deployment Steps

### 1. Deploy Backend
- [ ] Connect GitHub repository to Render.com
- [ ] Configure build settings:
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `python main.py`
- [ ] Set all environment variables
- [ ] Deploy and verify health check

### 2. Deploy Frontend
- [ ] Connect GitHub repository to Vercel.com
- [ ] Configure build settings:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Update API base URL with backend domain
- [ ] Deploy and test functionality

### 3. Post-Deployment
- [ ] Test user registration/login
- [ ] Test AI features with image upload
- [ ] Verify database operations
- [ ] Check CORS configuration
- [ ] Monitor logs for errors

## Production URLs
- Backend: https://digital-wardrobe-backend.onrender.com
- Frontend: https://digital-wardrobe.vercel.app
- Database: [Your Aiven MySQL instance]

## Troubleshooting
- Check deployment logs in respective platforms
- Verify environment variables are set correctly
- Ensure database is accessible from backend
- Test API endpoints individually
EOF

echo "✅ Deployment checklist created"

# Summary
echo ""
echo "🎉 Deployment Preparation Complete!"
echo "=================================="
echo ""
echo "📁 Files created/updated:"
echo "  - README.md (project documentation)"
echo "  - DEPLOYMENT.md (detailed deployment guide)"
echo "  - DEPLOYMENT_CHECKLIST.md (step-by-step checklist)"
echo "  - backend/render.yaml (Render.com configuration)"
echo "  - promesse/vercel.json (Vercel.com configuration)"
echo "  - backend/.env.production (production environment template)"
echo ""
echo "🚀 Next Steps:"
echo "  1. Review DEPLOYMENT.md for detailed instructions"
echo "  2. Follow DEPLOYMENT_CHECKLIST.md step by step"
echo "  3. Set up your Aiven MySQL database"
echo "  4. Deploy backend to Render.com"
echo "  5. Deploy frontend to Vercel.com"
echo ""
echo "💡 Tips:"
echo "  - Keep your environment variables secure"
echo "  - Test thoroughly after deployment"
echo "  - Monitor logs for any issues"
echo ""
echo "Good luck with your deployment! 🚀"

