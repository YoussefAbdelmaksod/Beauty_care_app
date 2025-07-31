import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { 
  Search, 
  Filter, 
  Star, 
  Heart, 
  ShoppingCart, 
  ArrowLeft,
  BarChart3,
  MapPin
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  brand: string;
  category: string;
  price: string;
  skinTypes: string[];
  concerns: string[];
  rating?: string;
  description?: string;
  descriptionAr?: string;
  imageUrl?: string;
}

export default function ProductsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkinType, setSelectedSkinType] = useState("");
  const [selectedConcern, setSelectedConcern] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  
  const language = localStorage.getItem("userLanguage") || "ar";
  const userId = parseInt(localStorage.getItem("userId") || "0");

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", { 
      search: searchQuery, 
      category: selectedCategory,
      skinType: selectedSkinType,
      concern: selectedConcern,
      priceRange 
    }],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/products/categories"],
  });

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCompareProducts = () => {
    if (selectedProducts.length >= 2) {
      const productIds = selectedProducts.join(",");
      setLocation(`/compare?products=${productIds}`);
    }
  };

  const t = {
    ar: {
      title: "استكشف المنتجات",
      searchPlaceholder: "ابحث عن المنتجات...",
      filters: "الفلاتر",
      category: "الفئة",
      skinType: "نوع البشرة",
      concerns: "الاهتمامات",
      priceRange: "نطاق السعر",
      all: "الكل",
      compare: "مقارنة",
      addToFavorites: "أضف للمفضلة",
      addToCart: "أضف للسلة",
      back: "العودة",
      results: "نتيجة",
      selectToCompare: "اختر منتجين أو أكثر للمقارنة",
      compareSelected: "مقارنة المحددة",
      noResults: "لا توجد منتجات",
      tryDifferentFilters: "جرب فلاتر مختلفة"
    },
    en: {
      title: "Explore Products",
      searchPlaceholder: "Search products...",
      filters: "Filters",
      category: "Category",
      skinType: "Skin Type",
      concerns: "Concerns",
      priceRange: "Price Range",
      all: "All",
      compare: "Compare",
      addToFavorites: "Add to Favorites",
      addToCart: "Add to Cart",
      back: "Back",
      results: "results",
      selectToCompare: "Select 2 or more products to compare",
      compareSelected: "Compare Selected",
      noResults: "No products found",
      tryDifferentFilters: "Try different filters"
    }
  };

  const currentT = t[language as keyof typeof t];

  const skinTypes = [
    { value: "oily", label: language === "ar" ? "دهنية" : "Oily" },
    { value: "dry", label: language === "ar" ? "جافة" : "Dry" },
    { value: "combination", label: language === "ar" ? "مختلطة" : "Combination" },
    { value: "normal", label: language === "ar" ? "طبيعية" : "Normal" },
    { value: "sensitive", label: language === "ar" ? "حساسة" : "Sensitive" }
  ];

  const concerns = [
    { value: "acne", label: language === "ar" ? "حب الشباب" : "Acne" },
    { value: "hyperpigmentation", label: language === "ar" ? "فرط التصبغ" : "Hyperpigmentation" },
    { value: "dryness", label: language === "ar" ? "الجفاف" : "Dryness" },
    { value: "aging", label: language === "ar" ? "الشيخوخة" : "Anti-aging" },
    { value: "pores", label: language === "ar" ? "المسام الواسعة" : "Large Pores" }
  ];

  const priceRanges = [
    { value: "0-500", label: language === "ar" ? "أقل من 500 جنيه" : "Under 500 EGP" },
    { value: "500-1000", label: "500-1000 EGP" },
    { value: "1000-2000", label: "1000-2000 EGP" },
    { value: "2000+", label: language === "ar" ? "أكثر من 2000 جنيه" : "Over 2000 EGP" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4" />
            {currentT.back}
          </Button>
          <h1 className="text-xl font-bold text-gray-900 flex-1">
            {currentT.title}
          </h1>
          {selectedProducts.length >= 2 && (
            <Button 
              onClick={handleCompareProducts}
              className="bg-gradient-to-r from-purple-500 to-blue-600"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {currentT.compareSelected} ({selectedProducts.length})
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {currentT.filters}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={currentT.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-right"
                />
              </div>

              {/* Filter Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {currentT.category}
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={currentT.all} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{currentT.all}</SelectItem>
                      {categories?.map((category: string) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {currentT.skinType}
                  </label>
                  <Select value={selectedSkinType} onValueChange={setSelectedSkinType}>
                    <SelectTrigger>
                      <SelectValue placeholder={currentT.all} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{currentT.all}</SelectItem>
                      {skinTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {currentT.concerns}
                  </label>
                  <Select value={selectedConcern} onValueChange={setSelectedConcern}>
                    <SelectTrigger>
                      <SelectValue placeholder={currentT.all} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{currentT.all}</SelectItem>
                      {concerns.map((concern) => (
                        <SelectItem key={concern.value} value={concern.value}>
                          {concern.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {currentT.priceRange}
                  </label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder={currentT.all} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{currentT.all}</SelectItem>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compare Notice */}
        {selectedProducts.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-purple-800 text-sm">
              {selectedProducts.length === 1 
                ? currentT.selectToCompare
                : `${selectedProducts.length} ${language === "ar" ? "منتجات محددة" : "products selected"}`
              }
            </p>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              {products.length} {currentT.results}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: Product) => (
                <Card 
                  key={product.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedProducts.includes(product.id) 
                      ? "ring-2 ring-purple-500 bg-purple-50" 
                      : ""
                  }`}
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {language === "ar" ? product.nameAr || product.name : product.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      </div>
                      {product.rating && (
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span className="text-sm">{product.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-rose-600">
                        {product.price} EGP
                      </span>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="mb-4">
                      {language === "ar" ? product.descriptionAr || product.description : product.description}
                    </CardDescription>
                    
                    {/* Skin Types */}
                    {product.skinTypes && product.skinTypes.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {language === "ar" ? "مناسب لـ:" : "Suitable for:"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {product.skinTypes.slice(0, 3).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {language === "ar" ? getArabicSkinType(type) : type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart logic
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {currentT.addToCart}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to favorites logic
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // View pharmacy locations
                        }}
                      >
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {currentT.noResults}
              </h3>
              <p className="text-gray-500">
                {currentT.tryDifferentFilters}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getArabicSkinType(type: string): string {
  const translations: Record<string, string> = {
    "oily": "دهنية",
    "dry": "جافة",
    "combination": "مختلطة", 
    "normal": "طبيعية",
    "sensitive": "حساسة"
  };
  return translations[type.toLowerCase()] || type;
}