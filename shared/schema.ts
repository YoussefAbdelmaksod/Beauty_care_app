import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  preferredLanguage: text("preferred_language").default("ar"),
  budgetTier: text("budget_tier").default("basic"),
  skinType: text("skin_type"),
  skinConcerns: text("skin_concerns").array(),
  quizCompleted: boolean("quiz_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  ingredients: text("ingredients").array(),
  activeIngredients: text("active_ingredients").array(),
  skinTypes: text("skin_types").array(),
  concerns: text("concerns").array(),
  imageUrl: text("image_url"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  pharmacyLinks: jsonb("pharmacy_links"),
  effectiveness: integer("effectiveness").default(0),
  isEgyptian: boolean("is_egyptian").default(true),
});

export const skinAnalyses = pgTable("skin_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  imageUrl: text("image_url"),
  analysisType: text("analysis_type").notNull(), // 'photo' | 'text' | 'hybrid'
  concerns: text("concerns").array(),
  skinType: text("skin_type"),
  recommendations: jsonb("recommendations"),
  geminiAnalysis: jsonb("gemini_analysis"),
  progressScore: integer("progress_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  timeOfDay: text("time_of_day").notNull(), // 'morning' | 'evening'
  steps: jsonb("steps").notNull(),
  products: integer("products").array(),
  budgetTier: text("budget_tier").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  messageType: text("message_type").default("question"), // 'question' | 'product_inquiry' | 'comparison'
  context: jsonb("context"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  skinType: text("skin_type").notNull(),
  concerns: text("concerns").array(),
  answers: jsonb("answers").notNull(),
  score: jsonb("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pharmacies = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  location: jsonb("location"), // { lat, lng }
  workingHours: jsonb("working_hours"),
  hasDelivery: boolean("has_delivery").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  preferredLanguage: true,
  budgetTier: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertSkinAnalysisSchema = createInsertSchema(skinAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertRoutineSchema = createInsertSchema(routines).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertPharmacySchema = createInsertSchema(pharmacies).omit({
  id: true,
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertSkinAnalysis = z.infer<typeof insertSkinAnalysisSchema>;
export type SkinAnalysis = typeof skinAnalyses.$inferSelect;

export type InsertRoutine = z.infer<typeof insertRoutineSchema>;
export type Routine = typeof routines.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Pharmacy = typeof pharmacies.$inferSelect;

export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;
