import { GoogleGenAI } from "@google/genai";
import { storage } from "../storage";
import type { Product } from "@shared/schema";

export interface RecommendationRequest {
  userId: number;
  skinType: string;
  concerns: string[];
  budgetTier: number; // 1, 2, or 3
  currentRoutine?: string;
  skinAnalysisId?: number;
  preferences?: {
    preferredBrands?: string[];
    avoidIngredients?: string[];
    routineComplexity?: 'simple' | 'moderate' | 'comprehensive';
  };
}

export interface RoutineRecommendation {
  morning: RoutineStep[];
  evening: RoutineStep[];
  weekly?: RoutineStep[];
  monthlyBudget: number;
  totalProducts: number;
  explanation: string;
}

export interface RoutineStep {
  step: number;
  category: string;
  product: Product;
  instructions: string;
  frequency: string;
  importance: 'essential' | 'recommended' | 'optional';
  arabicInstructions?: string;
}

export interface ProductComparison {
  products: Product[];
  comparison: {
    effectiveness: Record<string, number>;
    value: Record<string, number>;
    suitability: Record<string, number>;
  };
  recommendation: string;
  winnerProductId: number;
}

export class RecommendationEngine {
  private ai: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generatePersonalizedRoutine(request: RecommendationRequest): Promise<RoutineRecommendation> {
    try {
      // Get suitable products based on filters
      const suitableProducts = await this.findSuitableProducts(request);
      
      if (suitableProducts.length === 0) {
        throw new Error('No suitable products found for the given criteria');
      }

      // Generate AI-powered routine using Gemini
      const routine = await this.generateAIRoutine(request, suitableProducts);
      
      // Store routine for user
      await this.storeRoutine(request.userId, routine, request.budgetTier);
      
      return routine;
    } catch (error) {
      console.error('Routine generation error:', error);
      throw new Error('Failed to generate personalized routine');
    }
  }

  private async findSuitableProducts(request: RecommendationRequest): Promise<Product[]> {
    const budgetLimits = {
      1: 500,   // Budget tier: 200-500 EGP
      2: 1000,  // Mid-range: 500-1000 EGP  
      3: 2000   // Premium: 1000+ EGP
    };

    const maxBudget = budgetLimits[request.budgetTier as keyof typeof budgetLimits];
    
    const products = await storage.getProducts({
      skinTypes: [request.skinType],
      concerns: request.concerns,
      budgetMax: maxBudget
    });

    // Enhanced filtering based on preferences
    return products.filter(product => {
      // Filter by preferred brands
      if (request.preferences?.preferredBrands?.length) {
        const isPreferredBrand = request.preferences.preferredBrands.some(brand => 
          product.brand.toLowerCase().includes(brand.toLowerCase())
        );
        if (!isPreferredBrand) return false;
      }

      // Filter out avoided ingredients
      if (request.preferences?.avoidIngredients?.length) {
        const hasAvoidedIngredient = request.preferences.avoidIngredients.some(ingredient =>
          product.ingredients?.some(ing => 
            ing.toLowerCase().includes(ingredient.toLowerCase())
          )
        );
        if (hasAvoidedIngredient) return false;
      }

      return true;
    });
  }

  private async generateAIRoutine(
    request: RecommendationRequest, 
    products: Product[]
  ): Promise<RoutineRecommendation> {
    const prompt = this.createRoutinePrompt(request, products);
    
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [prompt],
        config: {
          responseMimeType: "application/json",
        },
      });
      
      let routineData;
      try {
        routineData = JSON.parse(response.text || '{}');
      } catch (parseError) {
        // Fallback to structured parsing
        routineData = await this.createFallbackRoutine(request, products);
      }

      return this.formatRoutineResponse(routineData, products);
    } catch (error) {
      console.error('AI routine generation error:', error);
      return await this.createFallbackRoutine(request, products);
    }
  }

  private createRoutinePrompt(request: RecommendationRequest, products: Product[]): string {
    const budgetInfo = {
      1: "Budget-conscious (200-500 EGP/month) - Focus on essentials",
      2: "Moderate budget (500-1000 EGP/month) - Comprehensive routine", 
      3: "Premium budget (1000+ EGP/month) - Advanced treatments"
    };

    const productList = products.map(p => 
      `${p.id}: ${p.nameEn} by ${p.brand} - ${p.price} EGP (${p.category}) [${p.concerns?.join(', ')}]`
    ).join('\n');

    return `Create a personalized skincare routine as an expert Egyptian dermatologist.

USER PROFILE:
- Skin Type: ${request.skinType}
- Primary Concerns: ${request.concerns.join(', ')}
- Budget Tier: ${request.budgetTier} (${budgetInfo[request.budgetTier as keyof typeof budgetInfo]})
- Current Routine: ${request.currentRoutine || 'None specified'}
- Complexity Preference: ${request.preferences?.routineComplexity || 'moderate'}

AVAILABLE PRODUCTS:
${productList}

REQUIREMENTS:
1. **ROUTINE STRUCTURE**:
   - Morning routine (3-6 steps max)
   - Evening routine (4-8 steps max)
   - Weekly treatments (optional)

2. **BUDGET COMPLIANCE**:
   - Stay within monthly budget limits
   - Prioritize essential products first
   - Include price justification

3. **EGYPTIAN CLIMATE CONSIDERATIONS**:
   - Account for hot, dry climate
   - UV protection emphasis
   - Hydration focus

4. **ROUTINE COMPLEXITY**:
   - Simple: 3-4 products total
   - Moderate: 5-7 products total
   - Comprehensive: 8+ products total

5. **SAFETY & EFFICACY**:
   - Proper order of application
   - Frequency recommendations
   - Interaction warnings

RESPOND IN STRICT JSON FORMAT:
{
  "morning": [
    {
      "step": 1,
      "category": "cleanser",
      "productId": product_id_number,
      "instructions": "detailed usage instructions",
      "arabicInstructions": "تعليمات باللغة العربية",
      "frequency": "daily/twice daily/etc",
      "importance": "essential/recommended/optional"
    }
  ],
  "evening": [similar structure],
  "weekly": [optional weekly treatments],
  "monthlyBudget": total_cost_number,
  "explanation": "detailed explanation of routine choices and expected benefits",
  "arabicExplanation": "شرح مفصل باللغة العربية"
}`;
  }

  private async createFallbackRoutine(
    request: RecommendationRequest, 
    products: Product[]
  ): Promise<RoutineRecommendation> {
    // Create a basic routine when AI generation fails
    const essentialCategories = ['cleanser', 'moisturizer', 'sunscreen'];
    const routineProducts: RoutineStep[] = [];
    
    let step = 1;
    for (const category of essentialCategories) {
      const categoryProduct = products.find(p => p.category === category);
      if (categoryProduct) {
        routineProducts.push({
          step: step++,
          category,
          product: categoryProduct,
          instructions: `Apply ${categoryProduct.nameEn} as directed`,
          frequency: 'daily',
          importance: 'essential'
        });
      }
    }

    const totalCost = routineProducts.reduce((sum, step) => 
      sum + parseFloat(step.product.price), 0
    );

    return {
      morning: routineProducts.filter(p => p.category !== 'treatment'),
      evening: routineProducts.filter(p => p.category !== 'sunscreen'),
      monthlyBudget: totalCost,
      totalProducts: routineProducts.length,
      explanation: 'Basic routine focusing on essential skincare steps'
    };
  }

  private formatRoutineResponse(routineData: any, products: Product[]): RoutineRecommendation {
    const getProductById = (id: number) => products.find(p => p.id === id);
    
    const formatSteps = (steps: any[]): RoutineStep[] => {
      return steps.map(step => ({
        ...step,
        product: getProductById(step.productId) || products[0] // Fallback to first product
      })).filter(step => step.product); // Remove steps without valid products
    };

    return {
      morning: formatSteps(routineData.morning || []),
      evening: formatSteps(routineData.evening || []),
      weekly: routineData.weekly ? formatSteps(routineData.weekly) : undefined,
      monthlyBudget: routineData.monthlyBudget || 0,
      totalProducts: (routineData.morning?.length || 0) + (routineData.evening?.length || 0),
      explanation: routineData.explanation || 'Personalized routine generated based on your needs'
    };
  }

  async compareProducts(productIds: number[], userId: number): Promise<ProductComparison> {
    if (productIds.length !== 2) {
      throw new Error('Exactly 2 products required for comparison');
    }

    const products = await storage.getProductsByIds(productIds);
    if (products.length !== 2) {
      throw new Error('One or both products not found');
    }

    const comparison = await this.generateProductComparison(products);
    return comparison;
  }

  private async generateProductComparison(products: Product[]): Promise<ProductComparison> {
    const prompt = `Compare these two Egyptian skincare products as an expert dermatologist:

PRODUCT A: ${products[0].nameEn}
- Brand: ${products[0].brand}
- Price: ${products[0].price} EGP
- Category: ${products[0].category}
- Ingredients: ${products[0].ingredients?.join(', ')}
- Skin Types: ${products[0].skinTypes?.join(', ')}
- Concerns: ${products[0].concerns?.join(', ')}

PRODUCT B: ${products[1].nameEn}
- Brand: ${products[1].brand}
- Price: ${products[1].price} EGP
- Category: ${products[1].category}
- Ingredients: ${products[1].ingredients?.join(', ')}
- Skin Types: ${products[1].skinTypes?.join(', ')}
- Concerns: ${products[1].concerns?.join(', ')}

COMPARISON CRITERIA:
1. **Effectiveness** (1-10): Ingredient quality and concentration
2. **Value** (1-10): Price vs. effectiveness ratio
3. **Suitability** (1-10): Versatility for different skin types

RESPOND IN JSON FORMAT:
{
  "effectiveness": {"productA": score, "productB": score},
  "value": {"productA": score, "productB": score},
  "suitability": {"productA": score, "productB": score},
  "recommendation": "detailed comparison and recommendation",
  "winnerProductId": winning_product_id_number,
  "arabicRecommendation": "التوصية باللغة العربية"
}`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [prompt],
        config: {
          responseMimeType: "application/json",
        },
      });
      
      const comparisonData = JSON.parse(response.text || '{}');
      
      return {
        products,
        comparison: comparisonData,
        recommendation: comparisonData.recommendation,
        winnerProductId: comparisonData.winnerProductId
      };
    } catch (error) {
      console.error('Product comparison error:', error);
      
      // Fallback comparison
      return {
        products,
        comparison: {
          effectiveness: { [products[0].id]: 7, [products[1].id]: 7 },
          value: { [products[0].id]: 7, [products[1].id]: 7 },
          suitability: { [products[0].id]: 7, [products[1].id]: 7 }
        },
        recommendation: 'Both products are suitable. Consider your specific needs and budget.',
        winnerProductId: products[0].id
      };
    }
  }

  private async storeRoutine(userId: number, routine: RoutineRecommendation, budgetTier: number): Promise<void> {
    const routineData = {
      userId,
      name: `Personalized Routine - Tier ${budgetTier}`,
      timeOfDay: 'both',
      steps: {
        morning: routine.morning,
        evening: routine.evening,
        weekly: routine.weekly
      },
      products: [
        ...routine.morning.map(s => s.product.id),
        ...routine.evening.map(s => s.product.id)
      ],
      budgetTier: `tier${budgetTier}`,
      isActive: true
    };

    await storage.createRoutine(routineData);
  }

  async getIngredientAnalysis(ingredients: string[]): Promise<any> {
    const prompt = `Analyze these skincare ingredients for Egyptian users:

INGREDIENTS: ${ingredients.join(', ')}

Provide analysis for:
1. **Function**: What each ingredient does
2. **Benefits**: Specific skin benefits
3. **Interactions**: Potential ingredient interactions
4. **Safety**: Considerations for Middle Eastern/Egyptian skin
5. **Climate Suitability**: How ingredients perform in hot, dry climate

Format as JSON:
{
  "ingredientAnalysis": {
    "ingredient_name": {
      "function": "primary function",
      "benefits": ["benefit1", "benefit2"],
      "interactions": ["interaction1"],
      "safetyNotes": "safety information",
      "climateSuitability": "good/moderate/poor"
    }
  },
  "overallAssessment": "summary of ingredient combination",
  "recommendations": ["usage recommendations"]
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
      console.error('Ingredient analysis error:', error);
      throw new Error('Failed to analyze ingredients');
    }
  }
}
