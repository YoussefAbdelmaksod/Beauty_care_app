import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeImage, analyzeSentiment } from "./services/gemini";
import { insertSkinAnalysisSchema, insertChatMessageSchema, insertRoutineSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Products endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const { category, skinTypes, concerns, budgetMax } = req.query;
      const filters = {
        category: category as string,
        skinTypes: skinTypes ? (skinTypes as string).split(",") : undefined,
        concerns: concerns ? (concerns as string).split(",") : undefined,
        budgetMax: budgetMax ? parseFloat(budgetMax as string) : undefined,
      };
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const products = await storage.searchProducts(q as string);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Skin analysis endpoints
  app.post("/api/analysis/image", async (req, res) => {
    try {
      const { imageData, userId, concerns } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }

      // Analyze image with Gemini
      const prompt = `Analyze this skin photo and provide detailed information about:
      1. Skin type (dry, oily, combination, sensitive, normal)
      2. Visible concerns (acne, wrinkles, dark spots, redness, etc.)
      3. Recommendations for skincare routine
      4. Severity level for each concern (1-10)
      
      Respond in JSON format with this structure:
      {
        "skinType": "string",
        "concerns": ["string"],
        "concernSeverity": {"concern": number},
        "recommendations": ["string"],
        "overallScore": number
      }`;

      const analysisResult = await analyzeImage(imageData, prompt);
      
      // Create analysis record
      const analysisData = insertSkinAnalysisSchema.parse({
        userId: userId || 1,
        imageUrl: "data:image/jpeg;base64," + imageData.split(",")[1],
        analysisType: "photo",
        concerns: concerns || [],
        geminiAnalysis: JSON.parse(analysisResult),
        progressScore: JSON.parse(analysisResult).overallScore || 0
      });

      const analysis = await storage.createSkinAnalysis(analysisData);
      
      // Get product recommendations based on analysis
      const skinType = JSON.parse(analysisResult).skinType;
      const identifiedConcerns = JSON.parse(analysisResult).concerns;
      
      const recommendedProducts = await storage.getProducts({
        skinTypes: [skinType],
        concerns: identifiedConcerns
      });

      res.json({
        analysis,
        recommendations: recommendedProducts.slice(0, 6)
      });
    } catch (error) {
      console.error("Image analysis error:", error);
      res.status(500).json({ message: "Image analysis failed" });
    }
  });

  app.post("/api/analysis/text", async (req, res) => {
    try {
      const { concerns, userId, skinType, description } = req.body;
      
      if (!concerns && !description) {
        return res.status(400).json({ message: "Concerns or description is required" });
      }

      // Generate recommendations based on text input
      const prompt = `Based on these skincare concerns: "${concerns || description}", provide:
      1. Likely skin type if not specified: ${skinType || "unknown"}
      2. Product recommendations
      3. Routine suggestions
      4. Ingredient recommendations
      
      Respond in JSON format:
      {
        "skinType": "string",
        "concerns": ["string"],
        "recommendations": ["string"],
        "ingredients": ["string"],
        "routineSteps": ["string"]
      }`;

      const analysisResult = await analyzeSentiment(prompt); // Using sentiment as general analysis
      
      const analysisData = insertSkinAnalysisSchema.parse({
        userId: userId || 1,
        analysisType: "text",
        concerns: Array.isArray(concerns) ? concerns : [concerns || description],
        skinType: skinType,
        geminiAnalysis: { textAnalysis: analysisResult },
        progressScore: 0
      });

      const analysis = await storage.createSkinAnalysis(analysisData);
      
      // Get product recommendations
      const recommendedProducts = await storage.getProducts({
        skinTypes: skinType ? [skinType] : undefined,
        concerns: Array.isArray(concerns) ? concerns : [concerns || description]
      });

      res.json({
        analysis,
        recommendations: recommendedProducts.slice(0, 6)
      });
    } catch (error) {
      console.error("Text analysis error:", error);
      res.status(500).json({ message: "Text analysis failed" });
    }
  });

  app.get("/api/analysis/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const analyses = await storage.getSkinAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analyses" });
    }
  });

  // Chat endpoints
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Generate response using Gemini
      const prompt = `As a skincare expert specializing in Egyptian beauty products, respond to: "${message}"
      
      Context: ${context ? JSON.stringify(context) : "General skincare question"}
      
      Provide helpful advice about:
      - Egyptian skincare brands and products
      - Ingredients and their benefits
      - Skincare routines
      - Product comparisons
      
      Respond in Arabic if the question is in Arabic, English if in English.
      Keep responses concise but informative.`;

      const response = await analyzeSentiment(prompt); // Using as general text generation
      
      const chatData = insertChatMessageSchema.parse({
        userId: userId || 1,
        message,
        response: JSON.stringify(response),
        context,
        messageType: "question"
      });

      const chatMessage = await storage.createChatMessage(chatData);
      res.json(chatMessage);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Chat response failed" });
    }
  });

  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Product comparison endpoint
  app.post("/api/products/compare", async (req, res) => {
    try {
      const { productIds, userId } = req.body;
      
      if (!productIds || productIds.length !== 2) {
        return res.status(400).json({ message: "Exactly 2 product IDs required for comparison" });
      }

      const products = await storage.getProductsByIds(productIds);
      
      if (products.length !== 2) {
        return res.status(404).json({ message: "One or both products not found" });
      }

      // Generate comparison using Gemini
      const prompt = `Compare these two skincare products:
      
      Product 1: ${products[0].nameEn} by ${products[0].brand}
      Ingredients: ${products[0].ingredients?.join(", ")}
      Price: ${products[0].price} EGP
      For: ${products[0].skinTypes?.join(", ")} skin
      Concerns: ${products[0].concerns?.join(", ")}
      
      Product 2: ${products[1].nameEn} by ${products[1].brand}
      Ingredients: ${products[1].ingredients?.join(", ")}
      Price: ${products[1].price} EGP
      For: ${products[1].skinTypes?.join(", ")} skin
      Concerns: ${products[1].concerns?.join(", ")}
      
      Provide a detailed comparison including:
      1. Key differences in ingredients
      2. Which is better for specific skin concerns
      3. Value for money analysis
      4. Recommendations for different skin types
      
      Format as JSON:
      {
        "winner": "product name",
        "comparison": {
          "ingredients": "analysis",
          "effectiveness": "analysis",
          "value": "analysis",
          "suitability": "analysis"
        },
        "recommendation": "detailed recommendation"
      }`;

      const comparisonResult = await analyzeSentiment(prompt);
      
      res.json({
        products,
        comparison: comparisonResult
      });
    } catch (error) {
      console.error("Product comparison error:", error);
      res.status(500).json({ message: "Product comparison failed" });
    }
  });

  // Routines endpoints
  app.post("/api/routines", async (req, res) => {
    try {
      const routineData = insertRoutineSchema.parse(req.body);
      const routine = await storage.createRoutine(routineData);
      res.json(routine);
    } catch (error) {
      res.status(500).json({ message: "Failed to create routine" });
    }
  });

  app.get("/api/routines/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const routines = await storage.getUserRoutines(userId);
      res.json(routines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routines" });
    }
  });

  // Pharmacies endpoints
  app.get("/api/pharmacies", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      
      if (lat && lng) {
        const pharmacies = await storage.getNearbyPharmacies(
          parseFloat(lat as string),
          parseFloat(lng as string),
          radius ? parseFloat(radius as string) : undefined
        );
        res.json(pharmacies);
      } else {
        const pharmacies = await storage.getPharmacies();
        res.json(pharmacies);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pharmacies" });
    }
  });

  // Routine generation endpoint
  app.post("/api/routines/generate", async (req, res) => {
    try {
      const { skinType, concerns, budgetTier, userId } = req.body;
      
      // Get suitable products based on criteria
      const budgetLimits = {
        basic: 1000,
        premium: 2000,
        luxury: 5000
      };
      
      const products = await storage.getProducts({
        skinTypes: [skinType],
        concerns: concerns,
        budgetMax: budgetLimits[budgetTier as keyof typeof budgetLimits]
      });

      // Generate routine using Gemini
      const prompt = `Create a comprehensive skincare routine for:
      - Skin Type: ${skinType}
      - Concerns: ${concerns?.join(", ")}
      - Budget Tier: ${budgetTier}
      
      Available products: ${products.map(p => `${p.nameEn} (${p.category}) - ${p.price} EGP`).join(", ")}
      
      Create morning and evening routines with specific steps, products, and application instructions.
      
      Format as JSON:
      {
        "morningRoutine": [
          {"step": number, "product": "name", "instruction": "how to apply"}
        ],
        "eveningRoutine": [
          {"step": number, "product": "name", "instruction": "how to apply"}
        ],
        "weeklyTreatments": [
          {"product": "name", "frequency": "how often", "instruction": "how to use"}
        ],
        "totalCost": number,
        "duration": "how long this routine should be followed"
      }`;

      const routineResult = await analyzeSentiment(prompt);
      
      res.json({
        routine: routineResult,
        recommendedProducts: products.slice(0, 8)
      });
    } catch (error) {
      console.error("Routine generation error:", error);
      res.status(500).json({ message: "Routine generation failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
