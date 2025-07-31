import { Router } from "express";
import { storage } from "../storage";
import { insertQuizResponseSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get quiz responses for a user
router.get("/responses/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const responses = await storage.getQuizResponses(userId);
    res.json(responses);
  } catch (error) {
    console.error("Get quiz responses error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Save quiz response
router.post("/responses", async (req, res) => {
  try {
    const validatedData = insertQuizResponseSchema.parse(req.body);
    
    // Check if response already exists for this user and section
    const existingResponse = await storage.getQuizResponse(
      validatedData.userId,
      validatedData.sectionId
    );

    if (existingResponse) {
      // Update existing response
      const updated = await storage.updateQuizResponse(
        validatedData.userId,
        validatedData.sectionId,
        validatedData.responses
      );
      res.json(updated);
    } else {
      // Create new response
      const response = await storage.createQuizResponse(validatedData);
      res.status(201).json(response);
    }
  } catch (error) {
    console.error("Save quiz response error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input data", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Complete quiz
router.post("/complete", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Update user to mark quiz as completed
    const user = await storage.updateUser(userId, {
      hasCompletedQuiz: true,
      quizCompletedAt: new Date(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Quiz completed successfully", user });
  } catch (error) {
    console.error("Complete quiz error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Generate recommendations based on quiz responses
router.get("/recommendations/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Get user's quiz responses
    const responses = await storage.getQuizResponses(userId);
    const user = await storage.getUser(userId);

    if (!user || !user.hasCompletedQuiz) {
      return res.status(400).json({ message: "User has not completed the quiz" });
    }

    // Analyze responses to generate recommendations
    const analysisData = analyzeQuizResponses(responses);
    
    // Get products based on analysis
    const recommendations = await storage.getProducts({
      skinTypes: analysisData.skinTypes,
      concerns: analysisData.concerns,
      budgetMax: analysisData.budgetMax,
    });

    res.json({
      analysis: analysisData,
      recommendations: recommendations.slice(0, 10), // Limit to top 10
      user: {
        id: user.id,
        preferredLanguage: user.preferredLanguage,
      }
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

function analyzeQuizResponses(responses: any[]) {
  const analysis = {
    skinTypes: [] as string[],
    concerns: [] as string[],
    budgetMax: 1000,
    skinTone: "",
    age: 25,
    lifestyle: {} as any,
  };

  responses.forEach(response => {
    const data = response.responses;
    
    switch (response.sectionId) {
      case "demographics":
        if (data.skinTone) analysis.skinTone = data.skinTone;
        if (data.age) analysis.age = data.age;
        break;
        
      case "skinType":
        if (data.primarySkinType) {
          // Extract skin type from description
          const skinType = data.primarySkinType.toLowerCase();
          if (skinType.includes("oily")) analysis.skinTypes.push("oily");
          if (skinType.includes("dry")) analysis.skinTypes.push("dry");
          if (skinType.includes("combination")) analysis.skinTypes.push("combination");
          if (skinType.includes("normal")) analysis.skinTypes.push("normal");
          if (skinType.includes("sensitive")) analysis.skinTypes.push("sensitive");
        }
        break;
        
      case "concerns":
        if (data.topConcerns && Array.isArray(data.topConcerns)) {
          analysis.concerns.push(...data.topConcerns.map((concern: string) => {
            // Map concerns to product categories
            if (concern.includes("acne") || concern.includes("breakouts")) return "acne";
            if (concern.includes("dark spots") || concern.includes("hyperpigmentation")) return "hyperpigmentation";
            if (concern.includes("dryness") || concern.includes("dehydration")) return "dryness";
            if (concern.includes("oil") || concern.includes("shine")) return "oil control";
            if (concern.includes("fine lines") || concern.includes("wrinkles")) return "anti-aging";
            if (concern.includes("pores")) return "enlarged pores";
            return concern.toLowerCase();
          }));
        }
        break;
        
      case "preferences":
        if (data.budget) {
          const budget = data.budget;
          if (budget === "<500") analysis.budgetMax = 500;
          else if (budget === "500-1000") analysis.budgetMax = 1000;
          else if (budget === "1000–$2000") analysis.budgetMax = 2000;
          else if (budget === "2000+") analysis.budgetMax = 5000;
        }
        break;
        
      case "lifestyle":
        analysis.lifestyle = data;
        break;
    }
  });

  return analysis;
}

export default router;