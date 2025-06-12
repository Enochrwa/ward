# Digital Wardrobe - Project README

## Overview

Digital Wardrobe is an AI-powered fashion management system that helps users organize their clothing, create outfits, and get personalized style recommendations. The application features advanced AI capabilities for outfit analysis, color harmony detection, and occasion-appropriate styling suggestions.

## Features

### Core Features
- **Digital Wardrobe Management**: Upload and organize clothing items with detailed metadata
- **AI-Powered Outfit Analysis**: Advanced image analysis for style detection and color extraction
- **Smart Recommendations**: Personalized outfit suggestions based on occasion, weather, and personal style
- **Color Harmony Analysis**: Sophisticated color theory implementation for outfit coordination
- **Occasion Matching**: AI-driven recommendations for specific events and settings
- **Style History Tracking**: Monitor and analyze wearing patterns and preferences

### AI & Machine Learning Features
- **Image Recognition**: Automatic clothing item identification and categorization
- **Style Detection**: Advanced pattern recognition for fashion style classification
- **Color Analysis**: Dominant color extraction and harmony scoring
- **Semantic Matching**: Natural language processing for occasion-based recommendations
- **Trend Analysis**: Fashion trend detection and integration

### Technical Features
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Real-time Updates**: Live data synchronization across devices
- **Secure Authentication**: JWT-based user authentication and authorization
- **Cloud Storage**: Scalable image storage and processing
- **Database Integration**: Robust MySQL database with optimized queries

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MySQL (Aiven.io cloud hosting)
- **AI/ML Libraries**: 
  - TensorFlow/Keras for image processing
  - Sentence Transformers for semantic analysis
  - Scikit-learn for machine learning algorithms
  - PIL/Pillow for image manipulation
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Documentation**: Automatic OpenAPI/Swagger documentation

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui component library
- **Icons**: Lucide React icon library
- **State Management**: React hooks and context API

### Deployment & Infrastructure
- **Backend Hosting**: Render.com with automatic deployments
- **Frontend Hosting**: Vercel.com with edge optimization
- **Database**: Aiven.io MySQL with SSL encryption
- **CI/CD**: GitHub Actions for automated testing and deployment

## Project Structure

```
digital-wardrobe/
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Business logic and AI services
│   │   ├── db/            # Database models and configuration
│   │   └── security.py    # Authentication and security
│   ├── main.py            # Application entry point
│   ├── requirements.txt   # Python dependencies
│   └── .env.example      # Environment variables template
├── promesse/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
│   ├── package.json      # Node.js dependencies
│   └── vite.config.ts    # Vite configuration
├── docs/                 # Documentation
└── DEPLOYMENT.md         # Deployment instructions
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL database (local or cloud)

### Local Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Enochrwa/digital-wardrobe.git
   cd digital-wardrobe
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your database credentials
   python main.py
   ```

3. **Frontend Setup**:
   ```bash
   cd promesse
   npm install
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Database Setup

The application supports both SQLite (development) and MySQL (production):

1. **SQLite (Development)**:
   ```bash
   DATABASE_URL=sqlite:///./digital_wardrobe.db
   ```

2. **MySQL (Production)**:
   ```bash
   DATABASE_URL=mysql+pymysql://username:password@hostname:port/database_name
   ```

## AI Features Implementation

### Style Detection
The AI style detection system uses a combination of:
- Color analysis algorithms
- Pattern recognition techniques
- Rule-based style classification
- Machine learning models for trend analysis

### Color Harmony Analysis
Advanced color theory implementation including:
- HSV color space analysis
- Complementary color detection
- Analogous color schemes
- Triadic color relationships
- Neutral palette recognition

### Occasion Matching
Semantic analysis for occasion-appropriate recommendations:
- Natural language processing
- Context-aware suggestions
- Event-specific styling rules
- Cultural and seasonal considerations

## API Documentation

The backend provides comprehensive API documentation available at `/docs` when running the server. Key endpoints include:

- **Authentication**: `/auth/login`, `/auth/register`
- **Wardrobe Management**: `/wardrobe/items`, `/wardrobe/outfits`
- **AI Analysis**: `/ai/analyze-outfit`, `/ai/recommendations`
- **User Management**: `/users/profile`, `/users/preferences`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- Render.com (Backend)
- Vercel.com (Frontend)
- Aiven.io (Database)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the API documentation at `/docs` endpoint

## Acknowledgments

- TensorFlow team for machine learning frameworks
- Hugging Face for transformer models
- Tailwind CSS for the design system
- FastAPI for the excellent Python web framework
- React team for the frontend framework

