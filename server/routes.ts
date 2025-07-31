import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import quizRoutes from "./routes/quiz";
import chatRoutes from "./routes/chat";
import productRoutes from "./routes/products";
import { analyzeImage, analyzeSentiment } from "./services/gemini";
import { AnalysisEngine } from "./services/analysis-engine";
import { RecommendationEngine } from "./services/recommendation-engine";
import { ChatSupportEngine } from "./services/chat-engine";
import { ProgressTrackingEngine } from "./services/progress-tracking";
import { insertSkinAnalysisSchema, insertChatMessageSchema, insertRoutineSchema } from "@shared/schema";
import { z } from "zod";

// Initialize service engines
const apiKey = process.env.GEMINI_API_KEY || "";
const analysisEngine = new AnalysisEngine(apiKey);
const recommendationEngine = new RecommendationEngine(apiKey);
const chatEngine = new ChatSupportEngine(apiKey);
const progressEngine = new ProgressTrackingEngine();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.use("/api/auth", authRoutes);
  
  // Quiz routes
  app.use("/api/quiz", quizRoutes);

  // Chat routes
  app.use("/api/chat", chatRoutes);

  // Product routes  
  app.use("/api/products", productRoutes);
  
  // Products endpoints - moved after the route mounting to prevent conflicts
  // (These will be accessible through the productRoutes instead)

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

  // Enhanced Skin Analysis endpoints using new Analysis Engine
  app.post("/api/analysis/image", async (req, res) => {
    try {
      const { imageData, userId, concerns, analysisType, existingConditions } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }

      const analysisRequest = {
        imageData,
        userId: userId || 1,
        analysisType: analysisType || 'skin',
        concerns: concerns || [],
        existingConditions: existingConditions || []
      };

      const analysisResult = await analysisEngine.analyzeImage(analysisRequest);
      
      // Get product recommendations based on analysis
      const recommendationRequest = {
        userId: analysisRequest.userId,
        skinType: analysisResult.skinType,
        concerns: analysisResult.concerns,
        budgetTier: req.body.budgetTier || 2,
        preferences: req.body.preferences
      };

      const recommendations = await recommendationEngine.generatePersonalizedRoutine(recommendationRequest);

      res.json({
        analysis: analysisResult,
        routine: recommendations,
        progressTracking: {
          canTrack: (await storage.getSkinAnalyses(analysisRequest.userId)).length > 0,
          previousAnalysisCount: (await storage.getSkinAnalyses(analysisRequest.userId)).length
        }
      });
    } catch (error) {
      console.error("Enhanced image analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Image analysis failed", error: errorMessage });
    }
  });

  // Enhanced Text Analysis endpoint
  app.post("/api/analysis/text", async (req, res) => {
    try {
      const { description, userId, skinType, concerns, currentRoutine, budgetTier } = req.body;
      
      if (!description && !concerns) {
        return res.status(400).json({ message: "Description or concerns are required" });
      }

      const analysisRequest = {
        description: description || concerns.join(', '),
        userId: userId || 1,
        skinType,
        concerns: Array.isArray(concerns) ? concerns : [concerns],
        currentRoutine,
        budgetTier: budgetTier || 2
      };

      const analysisResult = await analysisEngine.analyzeText(analysisRequest);
      
      // Get personalized routine recommendations
      const recommendationRequest = {
        userId: analysisRequest.userId,
        skinType: analysisResult.skinType,
        concerns: analysisResult.concerns,
        budgetTier: analysisRequest.budgetTier,
        currentRoutine: analysisRequest.currentRoutine,
        preferences: req.body.preferences
      };

      const recommendations = await recommendationEngine.generatePersonalizedRoutine(recommendationRequest);

      res.json({
        analysis: analysisResult,
        routine: recommendations,
        additionalInsights: {
          ingredientAnalysis: analysisResult.concerns.length > 0 ? 
            await recommendationEngine.getIngredientAnalysis(analysisResult.concerns) : null
        }
      });
    } catch (error) {
      console.error("Enhanced text analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Text analysis failed", error: errorMessage });
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

  // Enhanced Chat endpoints using new Chat Engine
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId, language, context, messageType } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const chatRequest = {
        message,
        userId: userId || 1,
        language,
        context,
        messageType: messageType || 'question'
      };

      const chatResponse = await chatEngine.processMessage(chatRequest);
      
      res.json(chatResponse);
    } catch (error) {
      console.error("Enhanced chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Chat response failed", error: errorMessage });
    }
  });

  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 20;
      const messages = await chatEngine.getChatHistory(userId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Chat insights and analytics
  app.get("/api/chat/:userId/sentiment", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sentiment = await chatEngine.analyzeChatSentiment(userId);
      res.json(sentiment);
    } catch (error) {
      console.error("Chat sentiment analysis error:", error);
      res.status(500).json({ message: "Failed to analyze chat sentiment" });
    }
  });

  app.get("/api/chat/popular-questions", async (req, res) => {
    try {
      const questions = await chatEngine.getPopularQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Popular questions error:", error);
      res.status(500).json({ message: "Failed to fetch popular questions" });
    }
  });

  app.get("/api/chat/:userId/personalized-tips", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const tips = await chatEngine.generatePersonalizedTips(userId);
      res.json({ tips });
    } catch (error) {
      console.error("Personalized tips error:", error);
      res.status(500).json({ message: "Failed to generate personalized tips" });
    }
  });

  // Enhanced Product comparison endpoint
  app.post("/api/products/compare", async (req, res) => {
    try {
      const { productIds, userId } = req.body;
      
      if (!productIds || productIds.length !== 2) {
        return res.status(400).json({ message: "Exactly 2 product IDs required for comparison" });
      }

      const comparison = await recommendationEngine.compareProducts(productIds, userId || 1);
      res.json(comparison);
    } catch (error) {
      console.error("Enhanced product comparison error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Product comparison failed", error: errorMessage });
    }
  });

  // New Enhanced Recommendation endpoints
  app.post("/api/recommendations/routine", async (req, res) => {
    try {
      const recommendationRequest = {
        userId: req.body.userId || 1,
        skinType: req.body.skinType,
        concerns: req.body.concerns || [],
        budgetTier: req.body.budgetTier || 2,
        currentRoutine: req.body.currentRoutine,
        skinAnalysisId: req.body.skinAnalysisId,
        preferences: req.body.preferences
      };

      const routine = await recommendationEngine.generatePersonalizedRoutine(recommendationRequest);
      res.json(routine);
    } catch (error) {
      console.error("Routine recommendation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to generate routine", error: errorMessage });
    }
  });

  app.post("/api/recommendations/ingredients", async (req, res) => {
    try {
      const { ingredients } = req.body;
      
      if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ message: "Ingredients array is required" });
      }

      const analysis = await recommendationEngine.getIngredientAnalysis(ingredients);
      res.json(analysis);
    } catch (error) {
      console.error("Ingredient analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to analyze ingredients", error: errorMessage });
    }
  });

  // New Progress Tracking endpoints
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const metrics = await progressEngine.getProgressMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error("Progress metrics error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to get progress metrics", error: errorMessage });
    }
  });

  app.get("/api/progress/:userId/timeline", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const timeline = await progressEngine.getProgressTimeline(userId);
      res.json(timeline);
    } catch (error) {
      console.error("Progress timeline error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to get progress timeline", error: errorMessage });
    }
  });

  app.get("/api/progress/:userId/report", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const report = await progressEngine.generateProgressReport(userId);
      res.json(report);
    } catch (error) {
      console.error("Progress report error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to generate progress report", error: errorMessage });
    }
  });

  app.post("/api/progress/compare", async (req, res) => {
    try {
      const { userId, analysisId1, analysisId2 } = req.body;
      
      if (!analysisId1 || !analysisId2) {
        return res.status(400).json({ message: "Both analysis IDs are required" });
      }

      const comparison = await progressEngine.compareAnalyses(userId || 1, analysisId1, analysisId2);
      res.json(comparison);
    } catch (error) {
      console.error("Progress comparison error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to compare analyses", error: errorMessage });
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
