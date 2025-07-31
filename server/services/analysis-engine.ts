import { GoogleGenAI } from "@google/genai";
import { storage } from "../storage";
import type { InsertSkinAnalysis } from "@shared/schema";

export interface ImageAnalysisRequest {
  imageData: string;
  userId: number;
  analysisType: 'skin' | 'hair';
  concerns?: string[];
  existingConditions?: string[];
}

export interface TextAnalysisRequest {
  description: string;
  userId: number;
  skinType?: string;
  concerns: string[];
  currentRoutine?: string;
  budgetTier: number;
}

export interface AnalysisResult {
  skinType: string;
  concerns: string[];
  concernSeverity: Record<string, number>;
  recommendations: string[];
  overallScore: number;
  detectedConditions?: string[];
  riskFactors?: string[];
  treatmentPriority?: string[];
}

export class AnalysisEngine {
  private ai: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeImage(request: ImageAnalysisRequest): Promise<AnalysisResult> {
    const prompt = this.createImageAnalysisPrompt(request);
    
    try {
      // Convert base64 to proper format
      const imageData = request.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const contents = [
        {
          inlineData: {
            data: imageData,
            mimeType: "image/jpeg",
          },
        },
        prompt
      ];

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: contents,
        config: {
          responseMimeType: "application/json",
        },
      });
      
      // Parse JSON response with error handling
      let analysisResult: AnalysisResult;
      try {
        analysisResult = JSON.parse(response.text || '{}');
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from text
        analysisResult = this.parseTextResponse(response.text || '', request.analysisType);
      }
      
      // Store analysis in database
      await this.storeAnalysis(request.userId, analysisResult, request.imageData, 'photo');
      
      return analysisResult;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error('Failed to analyze image');
    }
  }

  async analyzeText(request: TextAnalysisRequest): Promise<AnalysisResult> {
    const prompt = this.createTextAnalysisPrompt(request);
    
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [prompt],
        config: {
          responseMimeType: "application/json",
        },
      });
      
      let analysisResult: AnalysisResult;
      try {
        analysisResult = JSON.parse(response.text || '{}');
      } catch (parseError) {
        analysisResult = this.parseTextResponse(response.text || '', 'skin');
      }
      
      // Store analysis in database
      await this.storeAnalysis(request.userId, analysisResult, undefined, 'text');
      
      return analysisResult;
    } catch (error) {
      console.error('Text analysis error:', error);
      throw new Error('Failed to analyze text input');
    }
  }

  private createImageAnalysisPrompt(request: ImageAnalysisRequest): string {
    const analysisType = request.analysisType === 'skin' ? 'skin' : 'hair and scalp';
    
    return `As an expert dermatologist specializing in Egyptian skincare, analyze this ${analysisType} photo with medical precision.

ANALYSIS REQUIREMENTS:
1. **${analysisType.toUpperCase()} TYPE ASSESSMENT**:
   ${request.analysisType === 'skin' ? 
     '- Determine skin type: dry, oily, combination, sensitive, normal' :
     '- Assess hair type: fine, thick, curly, straight, damaged, healthy'
   }

2. **CONDITION IDENTIFICATION**:
   - Primary concerns visible in the image
   - Secondary issues that may need attention
   - Severity rating (1-10) for each condition
   - Medical conditions if any (acne grades, dermatitis, etc.)

3. **EGYPTIAN MARKET FOCUS**:
   - Consider local climate (dry, hot conditions)
   - Recommend Egyptian brands when possible
   - Account for local water quality issues

4. **SAFETY & INTERACTIONS**:
   - Identify potential contraindications
   - Note if medical consultation is needed
   - Risk factors based on visible conditions

User Context:
- Existing concerns: ${request.concerns?.join(', ') || 'None specified'}
- Medical conditions: ${request.existingConditions?.join(', ') || 'None specified'}

RESPOND IN STRICT JSON FORMAT:
{
  "skinType": "string (primary type)",
  "concerns": ["array of identified concerns"],
  "concernSeverity": {"concern_name": severity_number},
  "recommendations": ["immediate action items"],
  "overallScore": "number (0-100, higher is healthier)",
  "detectedConditions": ["medical conditions if any"],
  "riskFactors": ["potential risk factors"],
  "treatmentPriority": ["ordered list of treatment priorities"]
}`;
  }

  private createTextAnalysisPrompt(request: TextAnalysisRequest): string {
    return `As an expert dermatologist, analyze this skincare consultation for Egyptian market solutions.

USER INPUT: "${request.description}"

CONTEXT:
- Current skin type: ${request.skinType || 'Unknown'}
- Primary concerns: ${request.concerns.join(', ')}
- Current routine: ${request.currentRoutine || 'None specified'}
- Budget tier: ${request.budgetTier} (1=Budget, 2=Mid-range, 3=Premium)

ANALYSIS REQUIREMENTS:
1. **SKIN ASSESSMENT**:
   - Confirm or determine skin type
   - Identify primary and secondary concerns
   - Assess routine effectiveness

2. **EGYPTIAN MARKET RECOMMENDATIONS**:
   - Focus on locally available brands
   - Consider Egyptian climate factors
   - Suggest pharmacy-available products

3. **BUDGET-APPROPRIATE SOLUTIONS**:
   - Tier 1 (200-500 EGP/month): Essential products only
   - Tier 2 (500-1000 EGP/month): Comprehensive routine
   - Tier 3 (1000+ EGP/month): Premium treatment options

4. **SAFETY CONSIDERATIONS**:
   - Ingredient interactions
   - Gradual introduction recommendations
   - When to seek medical consultation

RESPOND IN STRICT JSON FORMAT:
{
  "skinType": "confirmed or corrected skin type",
  "concerns": ["prioritized list of concerns"],
  "concernSeverity": {"concern": severity_1_to_10},
  "recommendations": ["specific actionable recommendations"],
  "overallScore": "current_routine_effectiveness_0_to_100",
  "detectedConditions": ["potential medical conditions"],
  "riskFactors": ["identified risk factors"],
  "treatmentPriority": ["step-by-step treatment order"]
}`;
  }

  private parseTextResponse(text: string, type: 'skin' | 'hair'): AnalysisResult {
    // Fallback parser if JSON parsing fails
    return {
      skinType: type === 'skin' ? 'combination' : 'normal',
      concerns: ['general care needed'],
      concernSeverity: { 'general': 5 },
      recommendations: ['Consult with a dermatologist for detailed analysis'],
      overallScore: 50,
      detectedConditions: [],
      riskFactors: [],
      treatmentPriority: ['professional consultation']
    };
  }

  private async storeAnalysis(
    userId: number, 
    result: AnalysisResult, 
    imageUrl?: string, 
    type: 'photo' | 'text' = 'photo'
  ): Promise<void> {
    const analysisData: InsertSkinAnalysis = {
      userId,
      imageUrl,
      analysisType: type,
      concerns: result.concerns,
      skinType: result.skinType,
      geminiAnalysis: result,
      progressScore: result.overallScore,
      recommendations: {
        immediate: result.recommendations,
        priority: result.treatmentPriority,
        riskFactors: result.riskFactors
      }
    };

    await storage.createSkinAnalysis(analysisData);
  }

  async getAnalysisHistory(userId: number): Promise<any[]> {
    return await storage.getSkinAnalyses(userId);
  }

  async compareProgress(userId: number, analysisId1: number, analysisId2: number): Promise<any> {
    const analysis1 = await storage.getSkinAnalysis(analysisId1);
    const analysis2 = await storage.getSkinAnalysis(analysisId2);
    
    if (!analysis1 || !analysis2 || analysis1.userId !== userId || analysis2.userId !== userId) {
      throw new Error('Invalid analysis IDs or unauthorized access');
    }

    return {
      timeline: {
        start: analysis1.createdAt,
        end: analysis2.createdAt,
        duration: this.calculateDuration(analysis1.createdAt!, analysis2.createdAt!)
      },
      scoreChange: {
        before: analysis1.progressScore,
        after: analysis2.progressScore,
        improvement: (analysis2.progressScore || 0) - (analysis1.progressScore || 0)
      },
      concernsEvolution: {
        resolved: analysis1.concerns?.filter(c => !analysis2.concerns?.includes(c)) || [],
        persisting: analysis1.concerns?.filter(c => analysis2.concerns?.includes(c)) || [],
        new: analysis2.concerns?.filter(c => !analysis1.concerns?.includes(c)) || []
      },
      recommendations: this.generateProgressRecommendations(analysis1, analysis2)
    };
  }

  private calculateDuration(start: Date, end: Date): string {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  }

  private generateProgressRecommendations(before: any, after: any): string[] {
    const recommendations = [];
    
    const improvementScore = (after.progressScore || 0) - (before.progressScore || 0);
    
    if (improvementScore > 10) {
      recommendations.push("Excellent progress! Continue current routine.");
    } else if (improvementScore > 0) {
      recommendations.push("Good improvement. Consider adding targeted treatments.");
    } else if (improvementScore < -5) {
      recommendations.push("Regression detected. Review routine and consider dermatologist consultation.");
    } else {
      recommendations.push("Minimal change. May need routine adjustment or more time.");
    }

    return recommendations;
  }
}
