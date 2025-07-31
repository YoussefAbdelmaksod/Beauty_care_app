import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Get products with filtering
router.get('/', async (req, res) => {
  try {
    const { search, category, skinType, concern, priceRange } = req.query;
    
    const filters = {
      search: search as string,
      category: category as string,
      skinType: skinType as string,
      concern: concern as string,
      priceRange: priceRange as string
    };

    const products = await storage.getProducts(filters);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get product categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await storage.getProductCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get recommended products for a user
router.get('/recommended/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const products = await storage.getRecommendedProducts(userId);
    res.json(products);
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    res.status(500).json({ message: 'Failed to fetch recommended products' });
  }
});

// Get products for comparison by query params (for URL sharing)
router.get('/compare', async (req, res) => {
  try {
    const productIds = req.query.products as string;
    if (!productIds) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }

    const ids = productIds.split(',').map(Number);
    const products = await storage.getProductsByIds(ids);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products for comparison:', error);
    res.status(500).json({ message: 'Failed to fetch products for comparison' });
  }
});

// Add product to favorites
router.post('/favorites', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: 'User ID and Product ID are required' });
    }

    const favorite = await storage.addToFavorites(userId, productId);
    res.json(favorite);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Failed to add to favorites' });
  }
});

// Get user favorites
router.get('/favorites/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const favorites = await storage.getUserFavorites(userId);
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

export default router;