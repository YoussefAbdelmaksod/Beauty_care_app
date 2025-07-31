import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Sign up route
router.post("/signup", async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const existingUsername = await storage.getUserByUsername(validatedData.username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await storage.createUser({
      ...validatedData,
      password: hashedPassword,
    });

    res.status(201).json({ 
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input data", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Sign in route
router.post("/signin", async (req, res) => {
  try {
    const validatedData = signInSchema.parse(req.body);

    // Find user
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Sign in successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        hasCompletedQuiz: user.hasCompletedQuiz,
      }
    });
  } catch (error) {
    console.error("Signin error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input data", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user
router.get("/user", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
      hasCompletedQuiz: user.hasCompletedQuiz,
    });
  } catch (error) {
    console.error("Auth user error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;