# Digital Wardrobe - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Digital Wardrobe application with:
- **Backend**: FastAPI application deployed on Render.com
- **Frontend**: React TypeScript application deployed on Vercel.com
- **Database**: MySQL hosted on Aiven.io

## Prerequisites

Before deployment, ensure you have:
1. A Render.com account
2. A Vercel.com account
3. An Aiven.io MySQL database instance
4. GitHub repository with the latest code

## Backend Deployment (Render.com)

### 1. Prepare Backend for Deployment

The backend is already configured for deployment with the following files:
- `requirements.txt` - Python dependencies
- `main.py` - FastAPI application entry point
- `.env.example` - Environment variables template

### 2. Environment Variables for Production

Set the following environment variables in Render.com:

```bash
# Database Configuration
DATABASE_URL=mysql+pymysql://username:password@hostname:port/database_name
CA_CERT=-----BEGIN CERTIFICATE-----
[Your Aiven MySQL CA Certificate content]
-----END CERTIFICATE-----

# Security
SECRET_KEY=your-super-secure-secret-key-for-production
JWT_SECRET_KEY=your-jwt-secret-key-for-production

# API Keys (Optional)
OPENWEATHERMAP_API_KEY=your-openweathermap-api-key

# AI Configuration
AI_DEMO_MODE=false

# CORS Configuration
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
```

### 3. Render.com Deployment Steps

1. **Connect Repository**:
   - Go to Render.com dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend code

2. **Configure Service**:
   - **Name**: `digital-wardrobe-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`
   - **Instance Type**: `Free` (or higher for production)

3. **Set Environment Variables**:
   - Add all the environment variables listed above
   - Ensure `DATABASE_URL` points to your Aiven MySQL instance
   - Add the CA certificate content to `CA_CERT`

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://digital-wardrobe-backend.onrender.com`)

## Frontend Deployment (Vercel.com)

### 1. Prepare Frontend for Deployment

The frontend is a React TypeScript application with:
- Vite build system
- Tailwind CSS for styling
- TypeScript for type safety

### 2. Update API Base URL

Before deployment, update the API base URL in the frontend to point to your deployed backend:

```typescript
// In your API configuration file or components
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://digital-wardrobe-backend.onrender.com'
  : 'http://localhost:8000';
```

### 3. Vercel Deployment Steps

1. **Connect Repository**:
   - Go to Vercel.com dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Select the frontend directory (`promesse`)

2. **Configure Build Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `promesse`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables** (if needed):
   ```bash
   VITE_API_BASE_URL=https://digital-wardrobe-backend.onrender.com
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the deployment URL (e.g., `https://digital-wardrobe.vercel.app`)

## Database Setup (Aiven.io)

### 1. Create MySQL Instance

1. Sign up for Aiven.io free tier
2. Create a new MySQL service
3. Note the connection details:
   - Host
   - Port
   - Username
   - Password
   - Database name
   - CA Certificate

### 2. Database Initialization

The application will automatically create tables on first run. To manually initialize:

```bash
# Run the database test script
python backend/test_database.py
```

## Post-Deployment Configuration

### 1. Update CORS Settings

Ensure your backend CORS settings include your frontend domain:

```python
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### 2. Test the Deployment

1. **Backend Health Check**:
   ```bash
   curl https://digital-wardrobe-backend.onrender.com/
   ```

2. **Frontend Access**:
   - Visit your Vercel deployment URL
   - Test user registration and login
   - Test AI features with image uploads

### 3. SSL and Security

Both Render.com and Vercel.com provide SSL certificates automatically. Ensure:
- All API calls use HTTPS
- Environment variables are properly secured
- Database connections use SSL

## Monitoring and Maintenance

### 1. Logs

- **Render.com**: Check logs in the Render dashboard
- **Vercel.com**: Check function logs in the Vercel dashboard
- **Aiven.io**: Monitor database performance and connections

### 2. Updates

To update the deployment:
1. Push changes to your GitHub repository
2. Render.com and Vercel.com will automatically redeploy
3. Monitor logs for any deployment issues

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify DATABASE_URL format
   - Check CA certificate content
   - Ensure database is accessible

2. **CORS Errors**:
   - Update CORS_ORIGINS environment variable
   - Include both production and development URLs

3. **Build Failures**:
   - Check requirements.txt for backend
   - Verify package.json for frontend
   - Review build logs for specific errors

### Support

For deployment issues:
- Check Render.com documentation
- Review Vercel.com deployment guides
- Consult Aiven.io MySQL setup guides

## Security Considerations

1. **Environment Variables**:
   - Never commit sensitive data to repository
   - Use strong, unique secrets for production
   - Rotate keys regularly

2. **Database Security**:
   - Use SSL connections
   - Implement proper user permissions
   - Regular backups

3. **API Security**:
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS only

## Performance Optimization

1. **Backend**:
   - Enable database connection pooling
   - Implement caching for AI results
   - Optimize image processing

2. **Frontend**:
   - Enable code splitting
   - Optimize images and assets
   - Use CDN for static files

3. **Database**:
   - Add appropriate indexes
   - Monitor query performance
   - Regular maintenance

