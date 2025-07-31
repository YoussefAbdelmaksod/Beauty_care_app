import { 
  users, products, skinAnalyses, routines, chatMessages, pharmacies, quizResponses,
  type User, type InsertUser, type Product, type InsertProduct,
  type SkinAnalysis, type InsertSkinAnalysis, type Routine, type InsertRoutine,
  type ChatMessage, type InsertChatMessage, type Pharmacy, type InsertPharmacy,
  type QuizResponse, type InsertQuizResponse
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Quiz Responses
  getQuizResponse(userId: number, sectionId: string): Promise<QuizResponse | undefined>;
  getQuizResponses(userId: number): Promise<QuizResponse[]>;
  createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse>;
  updateQuizResponse(userId: number, sectionId: string, responses: any): Promise<QuizResponse | undefined>;

  // Products
  getProducts(filters?: { category?: string; skinTypes?: string[]; concerns?: string[]; budgetMax?: number }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByIds(ids: number[]): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;

  // Skin Analyses
  getSkinAnalyses(userId: number): Promise<SkinAnalysis[]>;
  getSkinAnalysis(id: number): Promise<SkinAnalysis | undefined>;
  createSkinAnalysis(analysis: InsertSkinAnalysis): Promise<SkinAnalysis>;
  updateSkinAnalysis(id: number, updates: Partial<SkinAnalysis>): Promise<SkinAnalysis | undefined>;

  // Routines
  getUserRoutines(userId: number): Promise<Routine[]>;
  getRoutine(id: number): Promise<Routine | undefined>;
  createRoutine(routine: InsertRoutine): Promise<Routine>;
  updateRoutine(id: number, updates: Partial<Routine>): Promise<Routine | undefined>;
  deleteRoutine(id: number): Promise<boolean>;

  // Chat Messages
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Pharmacies
  getNearbyPharmacies(lat: number, lng: number, radius?: number): Promise<Pharmacy[]>;
  getPharmacies(): Promise<Pharmacy[]>;
  createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private products: Map<number, Product> = new Map();
  private skinAnalyses: Map<number, SkinAnalysis> = new Map();
  private routines: Map<number, Routine> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private pharmacies: Map<number, Pharmacy> = new Map();
  private quizResponses: Map<string, QuizResponse> = new Map();
  
  private currentUserId = 1;
  private currentProductId = 1;
  private currentSkinAnalysisId = 1;
  private currentRoutineId = 1;
  private currentChatMessageId = 1;
  private currentPharmacyId = 1;
  private currentQuizResponseId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed Egyptian products
    const egyptianProducts: InsertProduct[] = [
      {
        nameAr: "سيروم النياسيناميد من راشيل",
        nameEn: "Rachel Niacinamide Serum",
        brand: "راشيل - Rachel",
        category: "serum",
        price: "250.00",
        ingredients: ["niacinamide", "hyaluronic acid", "zinc", "water"],
        activeIngredients: ["niacinamide 10%", "zinc 1%"],
        skinTypes: ["oily", "combination", "acne-prone"],
        concerns: ["acne", "enlarged pores", "oil control"],
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
        descriptionAr: "سيروم النياسيناميد يساعد في تقليل حجم المسام وتنظيم إفراز الزهم",
        descriptionEn: "Niacinamide serum helps reduce pore size and regulate sebum production",
        pharmacyLinks: [
          { name: "صيدلية السلام", phone: "01234567890", delivery: true },
          { name: "العزبي فارم", phone: "01234567891", delivery: false }
        ],
        effectiveness: 85,
        isEgyptian: true
      },
      {
        nameAr: "كريم الترطيب من فيرا",
        nameEn: "Vera Moisturizing Cream",
        brand: "فيرا - Vera",
        category: "moisturizer",
        price: "180.00",
        ingredients: ["ceramides", "hyaluronic acid", "glycerin", "shea butter"],
        activeIngredients: ["ceramides 3%", "hyaluronic acid 2%"],
        skinTypes: ["dry", "sensitive", "normal"],
        concerns: ["dryness", "dehydration", "barrier repair"],
        imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
        descriptionAr: "كريم مرطب يحتوي على السيراميد لتقوية حاجز البشرة",
        descriptionEn: "Moisturizing cream with ceramides to strengthen skin barrier",
        pharmacyLinks: [
          { name: "صيدلية الدكتور", phone: "01234567892", delivery: true }
        ],
        effectiveness: 90,
        isEgyptian: true
      },
      {
        nameAr: "غسول الوجه المنظف من كيرفري",
        nameEn: "CareFree Gentle Face Cleanser",
        brand: "كيرفري - CareFree",
        category: "cleanser",
        price: "120.00",
        ingredients: ["salicylic acid", "tea tree oil", "aloe vera", "glycerin"],
        activeIngredients: ["salicylic acid 0.5%", "tea tree oil 2%"],
        skinTypes: ["oily", "acne-prone", "combination"],
        concerns: ["acne", "blackheads", "excess oil"],
        imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
        descriptionAr: "غسول لطيف للوجه يحتوي على حمض الساليسيليك لمحاربة الحبوب",
        descriptionEn: "Gentle face cleanser with salicylic acid to fight acne",
        pharmacyLinks: [
          { name: "صيدلية الشروق", phone: "01234567893", delivery: false }
        ],
        effectiveness: 78,
        isEgyptian: true
      }
    ];

    egyptianProducts.forEach(product => {
      this.createProduct(product);
    });

    // Seed pharmacies
    const egyptianPharmacies: InsertPharmacy[] = [
      {
        name: "صيدلية السلام",
        address: "شارع الجمهورية، المعادي، القاهرة",
        phone: "01234567890",
        location: { lat: 29.959567, lng: 31.263199 },
        workingHours: { open: "08:00", close: "22:00" },
        hasDelivery: true,
        rating: "4.5"
      },
      {
        name: "العزبي فارم",
        address: "شارع التحرير، وسط البلد، القاهرة",
        phone: "01234567891",
        location: { lat: 30.044420, lng: 31.235712 },
        workingHours: { open: "09:00", close: "21:00" },
        hasDelivery: false,
        rating: "4.2"
      },
      {
        name: "صيدلية الدكتور",
        address: "شارع مصر الجديدة، مصر الجديدة، القاهرة",
        phone: "01234567892",
        location: { lat: 30.088203, lng: 31.328735 },
        workingHours: { open: "08:30", close: "23:00" },
        hasDelivery: true,
        rating: "4.7"
      }
    ];

    egyptianPharmacies.forEach(pharmacy => {
      this.createPharmacy(pharmacy);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      preferredLanguage: insertUser.preferredLanguage ?? "ar",
      budgetTier: insertUser.budgetTier ?? "basic",
      hasCompletedQuiz: false,
      quizCompletedAt: null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Products
  async getProducts(filters?: { category?: string; skinTypes?: string[]; concerns?: string[]; budgetMax?: number }): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (filters) {
      if (filters.category) {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters.skinTypes) {
        products = products.filter(p => 
          p.skinTypes && filters.skinTypes!.some(type => p.skinTypes!.includes(type))
        );
      }
      if (filters.concerns) {
        products = products.filter(p =>
          p.concerns && filters.concerns!.some(concern => p.concerns!.includes(concern))
        );
      }
      if (filters.budgetMax) {
        products = products.filter(p => parseFloat(p.price) <= filters.budgetMax!);
      }
    }
    
    return products;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByIds(ids: number[]): Promise<Product[]> {
    return ids.map(id => this.products.get(id)).filter(Boolean) as Product[];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = {
      ...insertProduct,
      id,
      ingredients: insertProduct.ingredients ?? null,
      activeIngredients: insertProduct.activeIngredients ?? null,
      skinTypes: insertProduct.skinTypes ?? null,
      concerns: insertProduct.concerns ?? null,
      imageUrl: insertProduct.imageUrl ?? null,
      descriptionAr: insertProduct.descriptionAr ?? null,
      descriptionEn: insertProduct.descriptionEn ?? null,
      pharmacyLinks: insertProduct.pharmacyLinks ?? null,
      effectiveness: insertProduct.effectiveness ?? null,
      isEgyptian: insertProduct.isEgyptian ?? null
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(product =>
      product.nameAr.toLowerCase().includes(lowerQuery) ||
      product.nameEn.toLowerCase().includes(lowerQuery) ||
      product.brand.toLowerCase().includes(lowerQuery) ||
      (product.ingredients && product.ingredients.some(ing => ing.toLowerCase().includes(lowerQuery)))
    );
  }

  // Skin Analyses
  async getSkinAnalyses(userId: number): Promise<SkinAnalysis[]> {
    return Array.from(this.skinAnalyses.values()).filter(analysis => analysis.userId === userId);
  }

  async getSkinAnalysis(id: number): Promise<SkinAnalysis | undefined> {
    return this.skinAnalyses.get(id);
  }

  async createSkinAnalysis(insertAnalysis: InsertSkinAnalysis): Promise<SkinAnalysis> {
    const id = this.currentSkinAnalysisId++;
    const analysis: SkinAnalysis = {
      ...insertAnalysis,
      id,
      userId: insertAnalysis.userId ?? null,
      imageUrl: insertAnalysis.imageUrl ?? null,
      concerns: insertAnalysis.concerns ?? null,
      skinType: insertAnalysis.skinType ?? null,
      recommendations: insertAnalysis.recommendations ?? null,
      geminiAnalysis: insertAnalysis.geminiAnalysis ?? null,
      progressScore: insertAnalysis.progressScore ?? null,
      createdAt: new Date()
    };
    this.skinAnalyses.set(id, analysis);
    return analysis;
  }

  async updateSkinAnalysis(id: number, updates: Partial<SkinAnalysis>): Promise<SkinAnalysis | undefined> {
    const analysis = this.skinAnalyses.get(id);
    if (!analysis) return undefined;
    
    const updatedAnalysis = { ...analysis, ...updates };
    this.skinAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }

  // Routines
  async getUserRoutines(userId: number): Promise<Routine[]> {
    return Array.from(this.routines.values()).filter(routine => routine.userId === userId);
  }

  async getRoutine(id: number): Promise<Routine | undefined> {
    return this.routines.get(id);
  }

  async createRoutine(insertRoutine: InsertRoutine): Promise<Routine> {
    const id = this.currentRoutineId++;
    const routine: Routine = {
      ...insertRoutine,
      id,
      userId: insertRoutine.userId ?? null,
      products: insertRoutine.products ?? null,
      isActive: insertRoutine.isActive ?? null,
      createdAt: new Date()
    };
    this.routines.set(id, routine);
    return routine;
  }

  async updateRoutine(id: number, updates: Partial<Routine>): Promise<Routine | undefined> {
    const routine = this.routines.get(id);
    if (!routine) return undefined;
    
    const updatedRoutine = { ...routine, ...updates };
    this.routines.set(id, updatedRoutine);
    return updatedRoutine;
  }

  async deleteRoutine(id: number): Promise<boolean> {
    return this.routines.delete(id);
  }

  // Chat Messages
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(message => message.userId === userId);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      userId: insertMessage.userId ?? null,
      response: insertMessage.response ?? null,
      messageType: insertMessage.messageType ?? null,
      context: insertMessage.context ?? null,
      createdAt: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Pharmacies
  async getNearbyPharmacies(lat: number, lng: number, radius: number = 10): Promise<Pharmacy[]> {
    // Simple distance calculation - in production use proper geospatial queries
    return Array.from(this.pharmacies.values()).filter(pharmacy => {
      if (!pharmacy.location) return false;
      const location = pharmacy.location as { lat: number; lng: number };
      const distance = Math.sqrt(
        Math.pow(location.lat - lat, 2) + Math.pow(location.lng - lng, 2)
      );
      return distance <= radius;
    });
  }

  async getPharmacies(): Promise<Pharmacy[]> {
    return Array.from(this.pharmacies.values());
  }

  async createPharmacy(insertPharmacy: InsertPharmacy): Promise<Pharmacy> {
    const id = this.currentPharmacyId++;
    const pharmacy: Pharmacy = {
      ...insertPharmacy,
      id,
      phone: insertPharmacy.phone ?? null,
      location: insertPharmacy.location ?? null,
      workingHours: insertPharmacy.workingHours ?? null,
      hasDelivery: insertPharmacy.hasDelivery ?? null,
      rating: insertPharmacy.rating ?? null
    };
    this.pharmacies.set(id, pharmacy);
    return pharmacy;
  }

  // Quiz Responses
  async getQuizResponse(userId: number, sectionId: string): Promise<QuizResponse | undefined> {
    const key = `${userId}_${sectionId}`;
    return this.quizResponses.get(key);
  }

  async getQuizResponses(userId: number): Promise<QuizResponse[]> {
    return Array.from(this.quizResponses.values()).filter(response => response.userId === userId);
  }

  async createQuizResponse(insertResponse: InsertQuizResponse): Promise<QuizResponse> {
    const id = this.currentQuizResponseId++;
    const key = `${insertResponse.userId}_${insertResponse.sectionId}`;
    const response: QuizResponse = {
      ...insertResponse,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.quizResponses.set(key, response);
    return response;
  }

  async updateQuizResponse(userId: number, sectionId: string, responses: any): Promise<QuizResponse | undefined> {
    const key = `${userId}_${sectionId}`;
    const existing = this.quizResponses.get(key);
    if (!existing) return undefined;
    
    const updated: QuizResponse = {
      ...existing,
      responses,
      updatedAt: new Date()
    };
    this.quizResponses.set(key, updated);
    return updated;
  }
}

export const storage = new MemStorage();
