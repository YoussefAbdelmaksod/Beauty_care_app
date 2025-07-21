# Beauty Care - Egyptian Skincare App

## Overview

This is a modern web application for Egyptian skincare and beauty recommendations, built as a mobile-first Progressive Web App (PWA). The application provides AI-powered skin analysis, personalized product recommendations, chat functionality, and routine management with a focus on Egyptian beauty products and skin types.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom Egyptian-themed color palette
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Mobile-First Design**: Responsive design optimized for mobile devices with bottom navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints under `/api` namespace
- **Development Setup**: Vite middleware integration for hot reloading
- **Error Handling**: Centralized error middleware with structured responses

### Database & ORM
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migrations**: Drizzle Kit for database migrations
- **Shared Schema**: Type-safe schema definitions shared between client and server

## Key Components

### AI-Powered Analysis
- **Image Analysis**: Google Gemini AI integration for photo-based skin analysis
- **Text Analysis**: Natural language processing for skin concern descriptions
- **Sentiment Analysis**: Chat message sentiment analysis using Gemini
- **Structured Responses**: JSON-formatted AI responses with predefined schemas

### Product Management
- **Multi-language Support**: Arabic and English product names and descriptions
- **Filtering System**: Category, skin type, concerns, and budget-based filtering
- **Search Functionality**: Full-text search across product database
- **Egyptian Focus**: Emphasis on locally available Egyptian beauty products

### Chat System
- **Real-time Messaging**: User-AI chat interface for skincare consultations
- **Context-Aware**: Chat responses consider user's skin analysis history
- **Multi-modal**: Support for text and image-based queries

### Progressive Web App Features
- **Service Worker**: Caching strategy for offline functionality
- **App Manifest**: Native app-like installation experience
- **Responsive Design**: Mobile-optimized interface with touch-friendly interactions

## Data Flow

### Skin Analysis Workflow
1. User uploads photo or describes skin concerns
2. Data sent to Gemini AI service for analysis
3. Structured analysis results stored in database
4. Product recommendations generated based on analysis
5. Results displayed with actionable skincare routine suggestions

### Product Discovery Flow
1. Users filter products by category, skin type, or concerns
2. Search queries processed through product search API
3. Results displayed with Egyptian pharmacy availability
4. Users can compare products and add to routines

### Chat Interaction Flow
1. User messages processed through Gemini AI
2. Context from previous analyses and user profile included
3. AI responses provide personalized skincare advice
4. Chat history maintained for continuity

## External Dependencies

### AI Services
- **Google Gemini AI**: Image analysis, text processing, and chat responses
- **API Integration**: Direct integration with Google GenAI SDK

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Pooling**: Connection management through @neondatabase/serverless

### Development Tools
- **Replit Integration**: Special handling for Replit development environment
- **Vite Plugins**: Runtime error overlay and cartographer for enhanced DX

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Comprehensive icon library
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Development Mode
- Vite dev server with HMR for frontend
- Express server with TypeScript compilation via tsx
- Hot reloading for both client and server code
- Replit-specific optimizations when deployed on Replit

### Production Build
- Client: Vite build process generating optimized bundle
- Server: esbuild compilation to ESM format
- Static assets served from Express with proper caching
- Database migrations applied via Drizzle Kit

### Environment Configuration
- Database URL required for PostgreSQL connection
- Gemini API key required for AI functionality
- Environment-specific build optimizations
- Service worker registration for PWA features

The application follows a modern full-stack architecture with strong TypeScript integration, mobile-first design principles, and AI-powered personalization features specifically tailored for the Egyptian beauty market.