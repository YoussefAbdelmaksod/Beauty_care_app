import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Database connection
const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/beauty_care";
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

// Export schema for external use
export * from "@shared/schema";

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// Initialize database with basic setup
export async function initializeDatabase() {
  try {
    console.log("Initializing database...");
    
    // Check if database is healthy
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      throw new Error("Database connection failed");
    }
    
    console.log("Database connection established successfully");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}
