import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Star, 
  Heart, 
  ShoppingCart, 
  SlidersHorizontal,
  Grid3X3,
  List,
  MapPin,
  Phone
} from "lucide-react";

interface Product {
  id: number;
  nameAr: string;
  nameEn: string;
  brand: string;
  category: string;
  price: string;
  skinTypes: string[];
  concerns: string[];
  rating?: string;
  effectiveness?: number;
  pharmacyLinks?: Array<{name: string; phone: string; delivery: boolean}>;
  imageUrl?: string;
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  
  const language = localStorage.getItem("userLanguage") || "ar";
  const isRTL = language === "ar";

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", { search: searchQuery }],
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

  const filteredProducts = products?.filter((product: Product) =>
    searchQuery === "" ||
    (language === "ar" ? product.nameAr : product.nameEn)
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className={`bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Search Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={language === "ar" ? "البحث عن المنتجات..." : "Search products..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-xl border-gray-200"
          />
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {language === "ar" ? "فلترة" : "Filter"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredProducts.length} {language === "ar" ? "منتج" : "products"}
          </div>
        </div>
      </div>

      {/* Quick Category Filters */}
      <div className="bg-white px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories?.map((category: string) => (
            <Badge key={category} variant="outline" className="whitespace-nowrap">
              {category === "serum" && (language === "ar" ? "سيروم" : "Serum")}
              {category === "moisturizer" && (language === "ar" ? "مرطب" : "Moisturizer")}
              {category === "cleanser" && (language === "ar" ? "غسول" : "Cleanser")}
              {category === "sunscreen" && (language === "ar" ? "واقي الشمس" : "Sunscreen")}
              {category === "mask" && (language === "ar" ? "ماسك" : "Mask")}
              {category === "toner" && (language === "ar" ? "تونر" : "Toner")}
            </Badge>
          ))}
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="px-4 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="animate-pulse">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3 mt-4" : "space-y-3 mt-4"}>
            {filteredProducts.map((product: Product) => (
              <Card 
                key={product.id} 
                className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
                  selectedProducts.includes(product.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <CardContent className={viewMode === "grid" ? "p-3" : "p-4"}>
                  {viewMode === "grid" ? (
                    /* Grid View */
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-gray-400" />
                        </div>
                        <button
                          onClick={() => toggleProductSelection(product.id)}
                          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"
                        >
                          <Heart className={`w-4 h-4 ${selectedProducts.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
                          {language === "ar" ? product.nameAr : product.nameEn}
                        </h3>
                        <p className="text-xs text-gray-600">{product.brand}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-600 text-sm">
                            {product.price} {language === "ar" ? "ج.م" : "EGP"}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">
                              {product.effectiveness ? (product.effectiveness / 20).toFixed(1) : "4.5"}
                            </span>
                          </div>
                        </div>

                        <Button size="sm" className="w-full text-xs">
                          {language === "ar" ? "عرض التفاصيل" : "View Details"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* List View */
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="w-6 h-6 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-sm text-gray-900 line-clamp-1">
                              {language === "ar" ? product.nameAr : product.nameEn}
                            </h3>
                            <p className="text-xs text-gray-600">{product.brand}</p>
                          </div>
                          <button
                            onClick={() => toggleProductSelection(product.id)}
                            className="w-8 h-8 flex items-center justify-center"
                          >
                            <Heart className={`w-4 h-4 ${selectedProducts.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-blue-600 text-sm">
                            {product.price} {language === "ar" ? "ج.م" : "EGP"}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">
                              {product.effectiveness ? (product.effectiveness / 20).toFixed(1) : "4.5"}
                            </span>
                          </div>
                        </div>

                        {product.pharmacyLinks && product.pharmacyLinks.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{product.pharmacyLinks[0].name}</span>
                            {product.pharmacyLinks[0].delivery && (
                              <Badge variant="secondary" className="text-xs">
                                {language === "ar" ? "توصيل" : "Delivery"}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">
              {language === "ar" ? "لم يتم العثور على منتجات" : "No products found"}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {language === "ar" ? "جرب البحث بكلمات مختلفة" : "Try searching with different keywords"}
            </p>
          </div>
        )}
      </div>

      {/* Compare Button - Fixed Bottom */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40">
          <Button className="w-full bg-blue-600 text-white py-3 rounded-xl shadow-lg">
            {language === "ar" 
              ? `مقارنة ${selectedProducts.length} منتجات` 
              : `Compare ${selectedProducts.length} products`
            }
          </Button>
        </div>
      )}
    </div>
  );
}