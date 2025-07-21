import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeImage(imageData: string, prompt?: string): Promise<string> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    
    const defaultPrompt = `Analyze this skin/face photo and provide detailed information about:
    1. Skin type (dry, oily, combination, sensitive, normal)
    2. Visible concerns (acne, wrinkles, dark spots, redness, enlarged pores, etc.)
    3. Skin tone and any discoloration
    4. Overall skin health assessment
    5. Specific recommendations for skincare routine
    6. Severity level for each concern (1-10 scale)
    
    Focus on Egyptian skin characteristics and environmental factors like sun exposure.
    
    Respond in JSON format with this structure:
    {
      "skinType": "string",
      "concerns": ["string"],
      "concernSeverity": {"concern": number},
      "skinTone": "string",
      "recommendations": ["string"],
      "overallScore": number,
      "environmentalFactors": ["string"],
      "urgentConcerns": ["string"]
    }`;

    const analysisPrompt = prompt || defaultPrompt;

    const contents = [
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
      analysisPrompt
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            skinType: { type: "string" },
            concerns: { 
              type: "array",
              items: { type: "string" }
            },
            concernSeverity: {
              type: "object",
              additionalProperties: { type: "number" }
            },
            skinTone: { type: "string" },
            recommendations: {
              type: "array", 
              items: { type: "string" }
            },
            overallScore: { type: "number" },
            environmentalFactors: {
              type: "array",
              items: { type: "string" }
            },
            urgentConcerns: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["skinType", "concerns", "recommendations", "overallScore"]
        }
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error('Gemini image analysis error:', error);
    throw new Error(`Failed to analyze image: ${error}`);
  }
}

export async function analyzeHairImage(imageData: string): Promise<string> {
  try {
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    
    const prompt = `Analyze this hair photo and provide detailed information about:
    1. Hair type (straight, wavy, curly, coily)
    2. Hair texture (fine, medium, thick)
    3. Hair condition (dry, oily, normal, damaged)
    4. Visible concerns (dandruff, hair loss, breakage, dullness, etc.)
    5. Scalp condition
    6. Hair color and any chemical damage
    7. Recommendations for hair care routine
    8. Severity level for each concern (1-10 scale)
    
    Consider Egyptian climate and common hair concerns in the region.
    
    Respond in JSON format with this structure:
    {
      "hairType": "string",
      "hairTexture": "string",
      "hairCondition": "string",
      "concerns": ["string"],
      "concernSeverity": {"concern": number},
      "scalpCondition": "string",
      "recommendations": ["string"],
      "overallScore": number,
      "environmentalFactors": ["string"]
    }`;

    const contents = [
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
      prompt
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            hairType: { type: "string" },
            hairTexture: { type: "string" },
            hairCondition: { type: "string" },
            concerns: { 
              type: "array",
              items: { type: "string" }
            },
            concernSeverity: {
              type: "object",
              additionalProperties: { type: "number" }
            },
            scalpCondition: { type: "string" },
            recommendations: {
              type: "array", 
              items: { type: "string" }
            },
            overallScore: { type: "number" },
            environmentalFactors: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["hairType", "hairTexture", "hairCondition", "concerns", "recommendations", "overallScore"]
        }
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error('Gemini hair analysis error:', error);
    throw new Error(`Failed to analyze hair image: ${error}`);
  }
}

export interface Sentiment {
  rating: number;
  confidence: number;
}

export async function analyzeSentiment(text: string): Promise<Sentiment> {
  try {
    const systemPrompt = `You are a sentiment analysis expert specializing in beauty and skincare content. 
    Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1.
    Consider beauty-related context, concerns, and emotional tone.
    Respond with JSON in this format: 
    {'rating': number, 'confidence': number}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            rating: { type: "number" },
            confidence: { type: "number" },
          },
          required: ["rating", "confidence"],
        },
      },
      contents: text,
    });

    const rawJson = response.text;

    if (rawJson) {
      const data: Sentiment = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to analyze sentiment: ${error}`);
  }
}

export async function generateBeautyAdvice(query: string, context?: any): Promise<string> {
  try {
    const systemPrompt = `You are an expert beauty consultant specializing in Egyptian skincare and beauty products.
    You have deep knowledge of:
    - Egyptian beauty brands and their formulations
    - Skincare ingredients and their benefits
    - Climate-specific beauty concerns in Egypt
    - Cultural beauty practices and preferences
    - Halal and culturally appropriate beauty products
    
    Provide helpful, accurate, and culturally sensitive advice.
    Always consider the Egyptian market and local brands when making recommendations.
    Respond in Arabic if the question is in Arabic, English if in English.
    Keep responses informative but concise.`;

    const contextInfo = context ? `\n\nContext: ${JSON.stringify(context)}` : '';
    const fullPrompt = query + contextInfo;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      contents: fullPrompt,
    });

    return response.text || "عذراً، لم أتمكن من تقديم إجابة في الوقت الحالي. يرجى المحاولة مرة أخرى.";
  } catch (error) {
    console.error('Gemini beauty advice error:', error);
    throw new Error(`Failed to generate beauty advice: ${error}`);
  }
}

export async function compareProducts(product1: any, product2: any): Promise<string> {
  try {
    const prompt = `Compare these two Egyptian beauty/skincare products in detail:

    Product 1: ${product1.nameEn} (${product1.nameAr}) by ${product1.brand}
    Ingredients: ${product1.ingredients?.join(", ") || "Not specified"}
    Active Ingredients: ${product1.activeIngredients?.join(", ") || "Not specified"}
    Price: ${product1.price} EGP
    For skin types: ${product1.skinTypes?.join(", ") || "Not specified"}
    Addresses concerns: ${product1.concerns?.join(", ") || "Not specified"}
    Effectiveness rating: ${product1.effectiveness}%

    Product 2: ${product2.nameEn} (${product2.nameAr}) by ${product2.brand}
    Ingredients: ${product2.ingredients?.join(", ") || "Not specified"}
    Active Ingredients: ${product2.activeIngredients?.join(", ") || "Not specified"}
    Price: ${product2.price} EGP
    For skin types: ${product2.skinTypes?.join(", ") || "Not specified"}
    Addresses concerns: ${product2.concerns?.join(", ") || "Not specified"}
    Effectiveness rating: ${product2.effectiveness}%

    Provide a comprehensive comparison including:
    1. Key differences in formulation and ingredients
    2. Which product is better for specific skin concerns
    3. Value for money analysis
    4. Effectiveness comparison based on ingredients
    5. Recommendations for different skin types
    6. Potential side effects or considerations
    7. Overall winner and why

    Respond in JSON format:
    {
      "winner": "product name",
      "winnerReason": "detailed explanation",
      "comparison": {
        "ingredients": "analysis of ingredient differences",
        "effectiveness": "effectiveness comparison",
        "value": "value for money analysis",
        "suitability": "which product for which skin type/concern"
      },
      "pros1": ["advantages of product 1"],
      "cons1": ["disadvantages of product 1"],
      "pros2": ["advantages of product 2"],
      "cons2": ["disadvantages of product 2"],
      "recommendation": "final recommendation with reasoning"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            winner: { type: "string" },
            winnerReason: { type: "string" },
            comparison: {
              type: "object",
              properties: {
                ingredients: { type: "string" },
                effectiveness: { type: "string" },
                value: { type: "string" },
                suitability: { type: "string" }
              }
            },
            pros1: {
              type: "array",
              items: { type: "string" }
            },
            cons1: {
              type: "array",
              items: { type: "string" }
            },
            pros2: {
              type: "array",
              items: { type: "string" }
            },
            cons2: {
              type: "array",
              items: { type: "string" }
            },
            recommendation: { type: "string" }
          },
          required: ["winner", "comparison", "recommendation"]
        }
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error('Gemini product comparison error:', error);
    throw new Error(`Failed to compare products: ${error}`);
  }
}

export async function generateRoutine(skinType: string, concerns: string[], budgetTier: string, availableProducts: any[]): Promise<string> {
  try {
    const prompt = `Create a comprehensive skincare routine for someone with the following profile:

    Skin Type: ${skinType}
    Main Concerns: ${concerns.join(", ")}
    Budget Tier: ${budgetTier}
    
    Available Egyptian products to choose from:
    ${availableProducts.map(p => 
      `- ${p.nameEn} (${p.nameAr}) by ${p.brand} - ${p.price} EGP - Category: ${p.category} - For: ${p.skinTypes?.join(", ")} - Addresses: ${p.concerns?.join(", ")}`
    ).join("\n")}

    Consider:
    1. Egyptian climate and environmental factors
    2. Cultural preferences and practices
    3. Budget constraints for the specified tier
    4. Product availability and local brands
    5. Layering order and compatibility
    6. Morning vs evening routine differences
    7. Weekly treatments and special care

    Create detailed morning and evening routines with specific steps, products, and application instructions.
    Include weekly treatments if applicable.
    Provide timeline expectations for seeing results.

    Respond in JSON format:
    {
      "morningRoutine": [
        {
          "step": number,
          "product": "exact product name from available list",
          "productId": number,
          "instruction": "detailed application instruction",
          "waitTime": "time to wait before next step"
        }
      ],
      "eveningRoutine": [
        {
          "step": number,
          "product": "exact product name from available list", 
          "productId": number,
          "instruction": "detailed application instruction",
          "waitTime": "time to wait before next step"
        }
      ],
      "weeklyTreatments": [
        {
          "product": "product name",
          "productId": number,
          "frequency": "how often per week",
          "instruction": "how to use",
          "dayOfWeek": "recommended day"
        }
      ],
      "totalMonthlyCost": number,
      "expectedResults": "timeline for seeing improvements",
      "tips": ["additional care tips specific to Egyptian climate"],
      "warnings": ["any precautions or potential reactions to watch for"]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            morningRoutine: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "number" },
                  product: { type: "string" },
                  productId: { type: "number" },
                  instruction: { type: "string" },
                  waitTime: { type: "string" }
                }
              }
            },
            eveningRoutine: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "number" },
                  product: { type: "string" },
                  productId: { type: "number" },
                  instruction: { type: "string" },
                  waitTime: { type: "string" }
                }
              }
            },
            weeklyTreatments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string" },
                  productId: { type: "number" },
                  frequency: { type: "string" },
                  instruction: { type: "string" },
                  dayOfWeek: { type: "string" }
                }
              }
            },
            totalMonthlyCost: { type: "number" },
            expectedResults: { type: "string" },
            tips: {
              type: "array",
              items: { type: "string" }
            },
            warnings: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["morningRoutine", "eveningRoutine", "totalMonthlyCost", "expectedResults"]
        }
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error('Gemini routine generation error:', error);
    throw new Error(`Failed to generate routine: ${error}`);
  }
}

export async function assessIngredientEffectiveness(ingredients: string[], skinType: string, concerns: string[]): Promise<string> {
  try {
    const prompt = `Assess the effectiveness of these skincare ingredients for the specified skin profile:

    Ingredients: ${ingredients.join(", ")}
    Skin Type: ${skinType}
    Concerns: ${concerns.join(", ")}

    Analyze each ingredient's:
    1. Effectiveness for the specific skin type
    2. Ability to address the mentioned concerns
    3. Scientific backing and research
    4. Potential interactions with other ingredients
    5. Recommended concentration ranges
    6. Possible side effects or precautions
    7. Best time of day to use (morning/evening)
    8. Compatibility with Egyptian climate

    Rate overall formulation effectiveness and provide recommendations.

    Respond in JSON format:
    {
      "overallEffectiveness": number,
      "ingredientAnalysis": {
        "ingredient_name": {
          "effectiveness": number,
          "benefits": ["list of benefits"],
          "concerns": ["any concerns or side effects"],
          "concentration": "recommended percentage",
          "timeOfUse": "morning/evening/both",
          "climateCompatibility": "good/moderate/poor with explanation"
        }
      },
      "interactions": ["potential ingredient interactions"],
      "recommendations": ["improvement suggestions"],
      "suitabilityScore": number
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3, // Lower temperature for more scientific accuracy
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error('Gemini ingredient assessment error:', error);
    throw new Error(`Failed to assess ingredient effectiveness: ${error}`);
  }
}
