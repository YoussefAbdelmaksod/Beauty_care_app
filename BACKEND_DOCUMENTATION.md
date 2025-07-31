# Beauty Care Backend API Documentation

## Overview

This is a comprehensive backend system for the Beauty Care Egyptian Skincare & Hair Care Recommendation platform. It integrates advanced AI analysis, personalized recommendations, progress tracking, and bilingual chat support.

## Architecture

### Service Layer Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React App)                 │
├─────────────────────────────────────────────────────────────┤
│                    Express.js API Layer                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │   Analysis   │ │Recommendation│ │Chat Support  │       │
│  │   Engine     │ │   Engine     │ │   Engine     │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │   Progress   │ │    Gemini    │ │   Storage    │       │
│  │   Tracking   │ │  AI Service  │ │    Layer     │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                    Database Layer                          │
└─────────────────────────────────────────────────────────────┘
```

## Service Modules

### 1. Analysis Engine (`/services/analysis-engine.ts`)

**Purpose**: AI-powered skin and hair analysis using Google Gemini 2.5 Pro

**Features**:
- **Image Analysis**: Advanced photo analysis with medical-grade precision
- **Text Analysis**: Natural language processing for user descriptions
- **Medical Condition Detection**: Identifies potential skin conditions
- **Risk Assessment**: Evaluates potential risk factors
- **Egyptian Climate Consideration**: Accounts for hot, dry climate conditions

**Key Methods**:
```typescript
analyzeImage(request: ImageAnalysisRequest): Promise<AnalysisResult>
analyzeText(request: TextAnalysisRequest): Promise<AnalysisResult>
getAnalysisHistory(userId: number): Promise<any[]>
compareProgress(userId: number, analysisId1: number, analysisId2: number): Promise<any>
```

### 2. Recommendation Engine (`/services/recommendation-engine.ts`)

**Purpose**: RAG-based personalized skincare routine generation

**Features**:
- **Multi-Tier Budget System**: 3 budget tiers (200-500, 500-1000, 1000+ EGP)
- **Egyptian Brand Focus**: Prioritizes locally available products
- **Routine Complexity Options**: Simple, moderate, or comprehensive routines
- **Ingredient Analysis**: Deep analysis of skincare ingredients
- **Product Comparison**: AI-powered product comparisons

**Key Methods**:
```typescript
generatePersonalizedRoutine(request: RecommendationRequest): Promise<RoutineRecommendation>
compareProducts(productIds: number[], userId: number): Promise<ProductComparison>
getIngredientAnalysis(ingredients: string[]): Promise<any>
```

### 3. Chat Support Engine (`/services/chat-engine.ts`)

**Purpose**: Bilingual AI chat support with Egyptian market expertise

**Features**:
- **Bilingual Support**: Arabic/English automatic detection and response
- **Context Awareness**: Maintains user context across conversations
- **Egyptian Expertise**: Specialized knowledge of local brands and climate
- **Sentiment Analysis**: Tracks user satisfaction and engagement
- **Personalized Tips**: Generates custom skincare tips based on user history

**Key Methods**:
```typescript
processMessage(request: ChatRequest): Promise<ChatResponse>
getChatHistory(userId: number, limit?: number): Promise<any[]>
analyzeChatSentiment(userId: number): Promise<any>
generatePersonalizedTips(userId: number): Promise<string[]>
```

### 4. Progress Tracking Engine (`/services/progress-tracking.ts`)

**Purpose**: Comprehensive progress monitoring and comparison

**Features**:
- **Timeline Visualization**: Track improvements over time
- **Before/After Comparisons**: Detailed analysis comparisons
- **Milestone Detection**: Identify significant progress points
- **Recommendation Updates**: Adjust recommendations based on progress
- **Report Generation**: Comprehensive progress reports

**Key Methods**:
```typescript
getProgressMetrics(userId: number): Promise<ProgressMetrics>
compareAnalyses(userId: number, analysisId1: number, analysisId2: number): Promise<ComparisonResult>
getProgressTimeline(userId: number): Promise<any[]>
generateProgressReport(userId: number): Promise<any>
```

## API Endpoints

### Authentication & Users
- `GET /api/users/:id` - Get user profile
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user profile

### Products
- `GET /api/products` - Get products with filters
- `GET /api/products/search` - Search products
- `GET /api/products/:id` - Get specific product
- `POST /api/products/compare` - Compare two products

### Analysis
- `POST /api/analysis/image` - Analyze skin/hair photo
- `POST /api/analysis/text` - Analyze text description
- `GET /api/analysis/:userId` - Get user's analysis history

### Recommendations
- `POST /api/recommendations/routine` - Generate personalized routine
- `POST /api/recommendations/ingredients` - Analyze ingredients

### Progress Tracking
- `GET /api/progress/:userId` - Get progress metrics
- `GET /api/progress/:userId/timeline` - Get progress timeline
- `GET /api/progress/:userId/report` - Generate progress report
- `POST /api/progress/compare` - Compare two analyses

### Chat Support
- `POST /api/chat` - Send chat message
- `GET /api/chat/:userId` - Get chat history
- `GET /api/chat/:userId/sentiment` - Analyze chat sentiment
- `GET /api/chat/popular-questions` - Get popular questions
- `GET /api/chat/:userId/personalized-tips` - Get personalized tips

## Data Models

### User Profile
```typescript
{
  id: number;
  username: string;
  email: string;
  preferredLanguage: 'ar' | 'en';
  budgetTier: 'basic' | 'premium' | 'luxury';
  skinType?: string;
  concerns?: string[];
}
```

### Product
```typescript
{
  id: number;
  nameAr: string;
  nameEn: string;
  brand: string;
  category: string;
  price: decimal;
  ingredients: string[];
  skinTypes: string[];
  concerns: string[];
  isEgyptian: boolean;
}
```

### Analysis Result
```typescript
{
  skinType: string;
  concerns: string[];
  concernSeverity: Record<string, number>;
  recommendations: string[];
  overallScore: number;
  detectedConditions?: string[];
  riskFactors?: string[];
  treatmentPriority?: string[];
}
```

### Routine Recommendation
```typescript
{
  morning: RoutineStep[];
  evening: RoutineStep[];
  weekly?: RoutineStep[];
  monthlyBudget: number;
  totalProducts: number;
  explanation: string;
}
```

## Features Integration

### 1. Image Analysis Workflow
1. **Upload**: User uploads skin/hair photo
2. **AI Analysis**: Gemini 2.5 Pro analyzes image
3. **Medical Assessment**: Identifies conditions and severity
4. **Recommendations**: Generates personalized routine
5. **Storage**: Saves analysis for progress tracking

### 2. Text Analysis Workflow
1. **Input**: User describes concerns or routine
2. **NLP Processing**: Gemini analyzes text content
3. **Context Building**: Considers user history and preferences
4. **Routine Generation**: Creates personalized recommendations
5. **Follow-up**: Suggests additional steps or consultations

### 3. Recommendation Workflow
1. **Profile Analysis**: Considers skin type, concerns, budget
2. **Product Filtering**: Filters Egyptian market products
3. **AI Optimization**: Uses Gemini for routine optimization
4. **Budget Compliance**: Ensures recommendations fit budget tier
5. **Climate Adjustment**: Accounts for Egyptian climate

### 4. Progress Tracking Workflow
1. **Baseline**: Establishes initial skin assessment
2. **Regular Monitoring**: Tracks changes over time
3. **Comparison Analysis**: Compares before/after states
4. **Milestone Detection**: Identifies significant improvements
5. **Recommendation Updates**: Adjusts routine based on progress

### 5. Chat Support Workflow
1. **Language Detection**: Automatically detects Arabic/English
2. **Context Building**: Considers user history and current concerns
3. **Expert Response**: Provides dermatologist-level advice
4. **Cultural Sensitivity**: Accounts for Egyptian beauty practices
5. **Follow-up**: Suggests actionable next steps

## Environment Setup

### Required Environment Variables
```bash
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_database_connection_string
NODE_ENV=development|production
PORT=5000
```

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Integration with Existing Streamlit App

The backend is designed to complement and eventually replace the existing Streamlit application functionality:

### Data Migration Path
1. **Product Data**: Import existing Egyptian products CSV data
2. **User Preferences**: Migrate user session data to persistent storage
3. **Analysis History**: Convert Streamlit session analysis to database records

### Feature Parity
- ✅ **Image Analysis**: Enhanced with medical-grade precision
- ✅ **Text Input Processing**: Improved with better NLP
- ✅ **Product Recommendations**: RAG-based with budget optimization
- ✅ **Progress Tracking**: Advanced timeline and comparison features
- ✅ **Chat Support**: Bilingual with Egyptian market expertise
- ✅ **Egyptian Brand Focus**: Maintained and enhanced

### Performance Optimizations
- **Caching**: Analysis results and recommendations cached
- **Background Processing**: Long-running analysis tasks queued
- **Rate Limiting**: API rate limiting to prevent abuse
- **Error Handling**: Comprehensive error handling and fallbacks

## Security Considerations

### API Security
- **Input Validation**: All inputs validated using Zod schemas
- **Rate Limiting**: Prevents API abuse
- **Authentication**: JWT-based user authentication
- **Data Privacy**: GDPR-compliant data handling

### AI Safety
- **Prompt Injection Protection**: Sanitized AI prompts
- **Response Validation**: AI responses validated for safety
- **Medical Disclaimers**: Clear disclaimers for medical advice
- **Fallback Responses**: Safe fallbacks when AI fails

## Future Enhancements

### Phase 2 Features
1. **Pharmacy Integration**: Real-time product availability
2. **Telemedicine**: Video consultations with dermatologists
3. **AR Skin Analysis**: Augmented reality skin scanning
4. **Community Features**: User reviews and tips sharing
5. **Subscription Plans**: Premium features and consultations

### Technical Improvements
1. **Machine Learning**: Custom ML models for Egyptian skin types
2. **Real-time Updates**: WebSocket for real-time chat
3. **Mobile App**: React Native mobile application
4. **Offline Support**: Offline mode for basic features
5. **Multi-language**: Support for additional languages

## Monitoring & Analytics

### Health Checks
- `/api/health` - System health status
- `/api/metrics` - Performance metrics
- `/api/status` - Service status dashboard

### Logging
- **Structured Logging**: JSON-formatted logs
- **Error Tracking**: Comprehensive error monitoring
- **Performance Monitoring**: API response time tracking
- **User Analytics**: Usage patterns and engagement metrics

This backend provides a robust, scalable foundation for the Beauty Care platform, integrating advanced AI capabilities with Egyptian market expertise and comprehensive user support.
