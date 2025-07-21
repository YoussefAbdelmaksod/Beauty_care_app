import { apiRequest } from "./queryClient";
import type { Product, SkinAnalysis, ChatMessage, Routine, Pharmacy } from "@shared/schema";

export interface AnalysisRequest {
  imageData?: string;
  userId?: number;
  concerns?: string[];
  skinType?: string;
  description?: string;
}

export interface AnalysisResponse {
  analysis: SkinAnalysis;
  recommendations: Product[];
}

export interface ChatRequest {
  message: string;
  userId?: number;
  context?: any;
}

export interface ProductFilters {
  category?: string;
  skinTypes?: string[];
  concerns?: string[];
  budgetMax?: number;
}

export interface RoutineGenerationRequest {
  skinType: string;
  concerns: string[];
  budgetTier: 'basic' | 'premium' | 'luxury';
  userId?: number;
}

export interface ComparisonRequest {
  productIds: number[];
  userId?: number;
}

// Products API
export const productsApi = {
  getAll: (filters?: ProductFilters): Promise<Product[]> =>
    fetch(`/api/products?${new URLSearchParams(filters as any).toString()}`).then(res => res.json()),
  
  search: (query: string): Promise<Product[]> =>
    fetch(`/api/products/search?q=${encodeURIComponent(query)}`).then(res => res.json()),
  
  getById: (id: number): Promise<Product> =>
    fetch(`/api/products/${id}`).then(res => res.json()),
  
  compare: (request: ComparisonRequest): Promise<any> =>
    apiRequest('POST', '/api/products/compare', request).then(res => res.json()),
};

// Analysis API
export const analysisApi = {
  analyzeImage: (request: AnalysisRequest): Promise<AnalysisResponse> =>
    apiRequest('POST', '/api/analysis/image', request).then(res => res.json()),
  
  analyzeText: (request: AnalysisRequest): Promise<AnalysisResponse> =>
    apiRequest('POST', '/api/analysis/text', request).then(res => res.json()),
  
  getUserAnalyses: (userId: number): Promise<SkinAnalysis[]> =>
    fetch(`/api/analysis/${userId}`).then(res => res.json()),
};

// Chat API
export const chatApi = {
  sendMessage: (request: ChatRequest): Promise<ChatMessage> =>
    apiRequest('POST', '/api/chat', request).then(res => res.json()),
  
  getChatHistory: (userId: number): Promise<ChatMessage[]> =>
    fetch(`/api/chat/${userId}`).then(res => res.json()),
};

// Routines API
export const routinesApi = {
  create: (routine: any): Promise<Routine> =>
    apiRequest('POST', '/api/routines', routine).then(res => res.json()),
  
  getUserRoutines: (userId: number): Promise<Routine[]> =>
    fetch(`/api/routines/${userId}`).then(res => res.json()),
  
  generateRoutine: (request: RoutineGenerationRequest): Promise<any> =>
    apiRequest('POST', '/api/routines/generate', request).then(res => res.json()),
};

// Pharmacies API
export const pharmaciesApi = {
  getNearby: (lat: number, lng: number, radius?: number): Promise<Pharmacy[]> =>
    fetch(`/api/pharmacies?lat=${lat}&lng=${lng}${radius ? `&radius=${radius}` : ''}`).then(res => res.json()),
  
  getAll: (): Promise<Pharmacy[]> =>
    fetch('/api/pharmacies').then(res => res.json()),
};

// Utility function for image data conversion
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Utility function for location services
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};
