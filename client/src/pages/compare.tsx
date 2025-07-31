import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Check, X, Star, ShoppingCart, Heart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  brand: string;
  category: string;
  price: string;
  skinTypes: string[];
  concerns: string[];
  ingredients?: string[];
  rating?: string;
  description?: string;
  descriptionAr?: string;
}

export default function ComparePage() {
  const [, setLocation] = useLocation();
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  
  const language = localStorage.getItem("userLanguage") || "ar";
  
  // Get product IDs from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productsParam = urlParams.get("products");
    if (productsParam) {
      const productIds = productsParam.split(",").map(Number);
      setSelectedProducts(productIds);
    }
  }, []);

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products/compare", selectedProducts],
    enabled: selectedProducts.length > 0,
  });

  const t = {
    ar: {
      title: "مقارنة المنتجات",
      back: "العودة",
      brand: "الماركة",
      price: "السعر", 
      category: "الفئة",
      skinTypes: "أنواع البشرة",
      concerns: "الاهتمامات",
      ingredients: "المكونات",
      rating: "التقييم",
      description: "الوصف",
      addToCart: "أضف للسلة",
      addToFavorites: "أضف للمفضلة",
      selectProducts: "اختر منتجين أو أكثر للمقارنة",
      goToProducts: "استكشف المنتجات"
    },
    en: {
      title: "Product Comparison",
      back: "Back",
      brand: "Brand",
      price: "Price",
      category: "Category", 
      skinTypes: "Skin Types",
      concerns: "Concerns",
      ingredients: "Ingredients",
      rating: "Rating",
      description: "Description",
      addToCart: "Add to Cart",
      addToFavorites: "Add to Favorites",
      selectProducts: "Select 2 or more products to compare",
      goToProducts: "Explore Products"
    }
  };

  const currentT = t[language as keyof typeof t];

  if (selectedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>{currentT.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">{currentT.selectProducts}</p>
            <Button 
              onClick={() => setLocation("/products")}
              className="bg-gradient-to-r from-rose-500 to-amber-500"
            >
              {currentT.goToProducts}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {language === "ar" ? "جاري تحميل المقارنة..." : "Loading comparison..."}
          </p>
        </div>
      </div>
    );
  }

  const comparisonFeatures = [
    { key: "brand", label: currentT.brand },
    { key: "price", label: currentT.price },
    { key: "category", label: currentT.category },
    { key: "skinTypes", label: currentT.skinTypes },
    { key: "concerns", label: currentT.concerns },
    { key: "rating", label: currentT.rating },
    { key: "description", label: currentT.description },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/products")}>
            <ArrowLeft className="w-4 h-4" />
            {currentT.back}
          </Button>
          <h1 className="text-xl font-bold text-gray-900">
            {currentT.title}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {products && products.length > 0 ? (
          <div className="space-y-6">
            {/* Product Headers */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
              <div></div>
              {products.map((product: Product) => (
                <Card key={product.id} className="text-center">
                  <CardHeader className="pb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-amber-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-rose-600" />
                    </div>
                    <CardTitle className="text-lg">
                      {language === "ar" ? product.nameAr || product.name : product.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                    <div className="text-xl font-bold text-rose-600">
                      {product.price} EGP
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" className="bg-gradient-to-r from-rose-500 to-amber-500">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {currentT.addToCart}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {comparisonFeatures.map((feature) => (
                    <div 
                      key={feature.key}
                      className="grid gap-4 p-4"
                      style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
                    >
                      <div className="font-medium text-gray-900 flex items-center">
                        {feature.label}
                      </div>
                      {products.map((product: Product) => (
                        <div key={product.id} className="flex items-center">
                          {feature.key === "skinTypes" || feature.key === "concerns" ? (
                            <div className="flex flex-wrap gap-1">
                              {(product[feature.key as keyof Product] as string[] || []).slice(0, 3).map((item: string) => (
                                <Badge key={item} variant="secondary" className="text-xs">
                                  {language === "ar" ? getArabicTranslation(item) : item}
                                </Badge>
                              ))}
                            </div>
                          ) : feature.key === "rating" ? (
                            product.rating ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-500 fill-current" />
                                <span>{product.rating}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )
                          ) : feature.key === "description" ? (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {language === "ar" 
                                ? product.descriptionAr || product.description 
                                : product.description}
                            </p>
                          ) : feature.key === "price" ? (
                            <span className="font-bold text-rose-600">
                              {product.price} EGP
                            </span>
                          ) : (
                            <span>{product[feature.key as keyof Product] as string}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline"
                onClick={() => setLocation("/products")}
              >
                {language === "ar" ? "أضف منتجات أخرى" : "Add More Products"}
              </Button>
              <Button 
                onClick={() => setLocation("/")}
                className="bg-gradient-to-r from-rose-500 to-amber-500"
              >
                {language === "ar" ? "الرئيسية" : "Home"}
              </Button>
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {language === "ar" ? "لا توجد منتجات للمقارنة" : "No products to compare"}
              </h3>
              <p className="text-gray-500 mb-6">
                {currentT.selectProducts}
              </p>
              <Button 
                onClick={() => setLocation("/products")}
                className="bg-gradient-to-r from-rose-500 to-amber-500"
              >
                {currentT.goToProducts}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getArabicTranslation(text: string): string {
  const translations: Record<string, string> = {
    "oily": "دهنية",
    "dry": "جافة",
    "combination": "مختلطة",
    "normal": "طبيعية", 
    "sensitive": "حساسة",
    "acne": "حب الشباب",
    "hyperpigmentation": "فرط التصبغ",
    "dryness": "الجفاف",
    "aging": "الشيخوخة",
    "pores": "المسام الواسعة"
  };
  return translations[text.toLowerCase()] || text;
}