import { GoogleGenAI } from "@google/genai";
import { storage } from "../storage";
import type { InsertChatMessage } from "@shared/schema";

export interface ChatRequest {
  message: string;
  userId: number;
  language?: 'en' | 'ar';
  context?: {
    skinType?: string;
    concerns?: string[];
    currentProducts?: string[];
    previousAnalysis?: any;
  };
  messageType?: 'question' | 'product_inquiry' | 'comparison' | 'routine_help';
}

export interface ChatResponse {
  response: string;
  arabicResponse?: string;
  recommendations?: string[];
  suggestedProducts?: number[];
  followUpQuestions?: string[];
  confidence: number;
}

export class ChatSupportEngine {
  private ai: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const prompt = this.createChatPrompt(request);
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [prompt],
        config: {
          responseMimeType: "application/json",
        },
      });

      let chatResponse: ChatResponse;
      try {
        chatResponse = JSON.parse(response.text || '{}');
      } catch (parseError) {
        // Fallback response
        chatResponse = {
          response: "I'm here to help with your skincare questions. Could you please rephrase your question?",
          arabicResponse: "أنا هنا لمساعدتك في أسئلة العناية بالبشرة. هل يمكنك إعادة صياغة سؤالك؟",
          confidence: 0.5
        };
      }

      // Store chat message
      await this.storeChatMessage(request, chatResponse);

      return chatResponse;
    } catch (error) {
      console.error('Chat processing error:', error);
      throw new Error('Failed to process chat message');
    }
  }

  private createChatPrompt(request: ChatRequest): string {
    const isArabic = this.detectArabic(request.message) || request.language === 'ar';
    
    return `You are Dr. Nour, an expert Egyptian dermatologist specializing in skincare for Middle Eastern skin in hot, dry climates. You have deep knowledge of Egyptian beauty brands and local market products.

USER MESSAGE: "${request.message}"
DETECTED LANGUAGE: ${isArabic ? 'Arabic' : 'English'}
MESSAGE TYPE: ${request.messageType || 'question'}

USER CONTEXT:
${request.context ? `
- Skin Type: ${request.context.skinType || 'Unknown'}
- Current Concerns: ${request.context.concerns?.join(', ') || 'None specified'}
- Current Products: ${request.context.currentProducts?.join(', ') || 'None specified'}
` : '- No previous context available'}

RESPONSE GUIDELINES:
1. **Language**: Respond in ${isArabic ? 'Arabic primarily with English product names' : 'English with Arabic translations for key terms'}
2. **Expertise**: Provide medical-grade advice while being approachable
3. **Local Focus**: Prioritize Egyptian brands and locally available products
4. **Cultural Sensitivity**: Consider Egyptian beauty standards and practices
5. **Climate Awareness**: Account for hot, dry Egyptian climate
6. **Safety First**: Always recommend professional consultation for serious conditions

RESPONSE TYPES:
- **General Questions**: Provide educational information
- **Product Inquiries**: Recommend specific Egyptian products with availability info
- **Routine Help**: Create step-by-step routines
- **Comparisons**: Detailed product/ingredient comparisons
- **Concerns**: Address specific skin issues with treatment options

RESPOND IN JSON FORMAT:
{
  "response": "${isArabic ? 'Arabic response' : 'English response'}",
  ${isArabic ? '"englishResponse": "English translation",' : '"arabicResponse": "Arabic translation",'}
  "recommendations": ["actionable recommendations"],
  "suggestedProducts": [product_ids_if_available],
  "followUpQuestions": ["relevant follow-up questions"],
  "confidence": confidence_score_0_to_1,
  "requiresProfessionalConsultation": boolean,
  "urgencyLevel": "low/medium/high"
}

Remember: You're representing Egyptian dermatological expertise. Be professional, caring, and culturally aware.`;
  }

  private detectArabic(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  }

  async getChatHistory(userId: number, limit: number = 20): Promise<any[]> {
    const messages = await storage.getChatMessages(userId);
    return messages.slice(-limit).map(msg => ({
      id: msg.id,
      message: msg.message,
      response: msg.response,
      timestamp: msg.createdAt,
      context: msg.context
    }));
  }

  async getPopularQuestions(): Promise<string[]> {
    return [
      "What's the best routine for oily skin in Egyptian weather?",
      "ما هي أفضل منتجات العناية للبشرة الجافة؟",
      "How to treat acne scars with Egyptian products?",
      "كيف أحمي بشرتي من أشعة الشمس القوية؟",
      "What's the difference between retinol and retinoids?",
      "أفضل كريم مرطب للبشرة الحساسة متوفر في مصر",
      "How to build a budget-friendly skincare routine?",
      "علاج البقع الداكنة والتصبغات طبيعياً"
    ];
  }

  async analyzeChatSentiment(userId: number): Promise<any> {
    const recentMessages = await this.getChatHistory(userId, 10);
    
    const prompt = `Analyze the sentiment and satisfaction level from these recent chat messages:

MESSAGES:
${recentMessages.map(msg => `User: ${msg.message}\nResponse: ${msg.response}`).join('\n\n')}

Provide analysis:
1. Overall user satisfaction (1-10)
2. Common concerns/topics
3. Response effectiveness
4. Recommended improvements

Respond in JSON format:
{
  "satisfactionScore": number,
  "commonTopics": ["topic1", "topic2"],
  "sentiment": "positive/neutral/negative",
  "improvementSuggestions": ["suggestion1"],
  "userEngagement": "high/medium/low"
}`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [prompt],
        config: {
          responseMimeType: "application/json",
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        satisfactionScore: 7,
        commonTopics: ["general skincare"],
        sentiment: "neutral",
        improvementSuggestions: ["Continue providing helpful responses"],
        userEngagement: "medium"
      };
    }
  }

  async generatePersonalizedTips(userId: number): Promise<string[]> {
    try {
      // Get user's analysis history and chat context
      const analyses = await storage.getSkinAnalyses(userId);
      const chatHistory = await this.getChatHistory(userId, 5);
      
      const userProfile = this.buildUserProfile(analyses, chatHistory);
      
      const prompt = `Generate 5 personalized skincare tips for this user based on their history:

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

Generate tips that are:
1. Specific to their skin type and concerns
2. Actionable and practical
3. Culturally appropriate for Egyptian users
4. Budget-conscious
5. Climate-aware (hot, dry weather)

Respond in JSON format:
{
  "tips": [
    "tip1 in preferred language",
    "tip2 in preferred language",
    "tip3 in preferred language",
    "tip4 in preferred language",
    "tip5 in preferred language"
  ],
  "category": "routine/products/lifestyle/prevention"
}`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [prompt],
        config: {
          responseMimeType: "application/json",
        },
      });

      const result = JSON.parse(response.text || '{}');
      return result.tips || [
        "Drink plenty of water to keep your skin hydrated",
        "Use sunscreen daily, even indoors",
        "Cleanse gently twice daily",
        "Don't skip moisturizer, even with oily skin",
        "Be patient - skincare results take 4-6 weeks"
      ];
    } catch (error) {
      console.error('Personalized tips error:', error);
      return [
        "Maintain a consistent skincare routine",
        "Always patch test new products",
        "Consider your skin's needs based on Egyptian climate",
        "Consult a dermatologist for persistent issues",
        "Take progress photos to track improvements"
      ];
    }
  }

  private buildUserProfile(analyses: any[], chatHistory: any[]): any {
    const latestAnalysis = analyses[0];
    const commonTopics = chatHistory.map(msg => msg.message).join(' ');
    
    return {
      skinType: latestAnalysis?.skinType || 'unknown',
      primaryConcerns: latestAnalysis?.concerns || [],
      progressScore: latestAnalysis?.progressScore || 0,
      commonQuestions: this.extractTopics(commonTopics),
      preferredLanguage: this.detectArabic(commonTopics) ? 'ar' : 'en',
      analysisCount: analyses.length,
      engagementLevel: chatHistory.length > 10 ? 'high' : 'medium'
    };
  }

  private extractTopics(text: string): string[] {
    const topics = [];
    const topicKeywords = {
      'acne': ['acne', 'pimples', 'breakouts', 'حب الشباب'],
      'aging': ['wrinkles', 'anti-aging', 'fine lines', 'التجاعيد'],
      'pigmentation': ['dark spots', 'pigmentation', 'التصبغات'],
      'dryness': ['dry skin', 'hydration', 'moisturizer', 'البشرة الجافة'],
      'oiliness': ['oily skin', 'oil control', 'البشرة الدهنية'],
      'sensitivity': ['sensitive skin', 'irritation', 'البشرة الحساسة']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private async storeChatMessage(request: ChatRequest, response: ChatResponse): Promise<void> {
    const chatData: InsertChatMessage = {
      userId: request.userId,
      message: request.message,
      response: JSON.stringify(response),
      messageType: request.messageType || 'question',
      context: request.context
    };

    await storage.createChatMessage(chatData);
  }
}
