import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductCard } from "@/components/product-card";
import { useTranslation } from "@/lib/i18n";
import { productsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Filter, ArrowLeft, ShoppingCart,
  Star, Heart, Share2, ChevronDown, SlidersHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

export default function Products() {
  const { t, isRTL } = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>([]);

  // Search products based on query
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['/api/products/search', searchQuery],
    queryFn: () => searchQuery ? productsApi.search(searchQuery) : [],
    enabled: !!searchQuery,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Get filtered products
  const { data: filteredProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products', selectedCategory, selectedSkinTypes, selectedConcerns, maxPrice],
    queryFn: () => productsApi.getAll({
      category: selectedCategory || undefined,
      skinTypes: selectedSkinTypes.length > 0 ? selectedSkinTypes : undefined,
      concerns: selectedConcerns.length > 0 ? selectedConcerns : undefined,
      budgetMax: maxPrice,
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const displayProducts = searchQuery ? searchResults : filteredProducts;

  const categories = [
    { value: 'cleanser', label: 'غسول' },
    { value: 'moisturizer', label: 'كريم مرطب' },
    { value: 'serum', label: 'سيروم' },
    { value: 'sunscreen', label: 'واقي الشمس' },
    { value: 'treatment', label: 'علاج' },
    { value: 'mask', label: 'قناع' }
  ];

  const skinTypes = [
    { value: 'dry', label: 'جافة' },
    { value: 'oily', label: 'دهنية' },
    { value: 'combination', label: 'مختلطة' },
    { value: 'sensitive', label: 'حساسة' },
    { value: 'normal', label: 'عادية' }
  ];

  const concerns = [
    { value: 'acne', label: 'حبوب' },
    { value: 'wrinkles', label: 'تجاعيد' },
    { value: 'dark_spots', label: 'تصبغات' },
    { value: 'dryness', label: 'جفاف' },
    { value: 'oil_control', label: 'تحكم في الدهون' },
    { value: 'enlarged_pores', label: 'مسام واسعة' },
    { value: 'redness', label: 'احمرار' }
  ];

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        toast({
          title: "منتج موجود",
          description: "هذا المنتج موجود بالفعل في السلة",
        });
        return prev;
      }
      
      toast({
        title: "تمت الإضافة للسلة",
        description: `تم إضافة ${product.nameAr} للسلة`,
      });
      
      return [...prev, product];
    });
  };

  const handleCompare = (product: Product) => {
    if (compareList.length >= 2) {
      toast({
        title: "الحد الأقصى للمقارنة",
        description: "يمكن مقارنة منتجين فقط في المرة الواحدة",
        variant: "destructive",
      });
      return;
    }

    setCompareList(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleRemoveFromCompare = (productId: number) => {
    setCompareList(prev => prev.filter(item => item.id !== productId));
  };

  const handleCompareProducts = async () => {
    if (compareList.length !== 2) return;
    
    try {
      const result = await productsApi.compare({
        productIds: compareList.map(p => p.id),
        userId: 1
      });
      
      // Show comparison result in modal or navigate to comparison page
      console.log('Comparison result:', result);
      toast({
        title: "مقارنة المنتجات",
        description: "تم إجراء المقارنة بنجاح",
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: "فشل في مقارنة المنتجات",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSkinTypes([]);
    setSelectedConcerns([]);
    setMaxPrice(undefined);
    setSearchQuery('');
  };

  const toggleSkinType = (skinType: string) => {
    setSelectedSkinTypes(prev => 
      prev.includes(skinType) 
        ? prev.filter(t => t !== skinType)
        : [...prev, skinType]
    );
  };

  const toggleConcern = (concern: string) => {
    setSelectedConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className={cn(
              "flex items-center space-x-2",
              isRTL ? "space-x-reverse" : ""
            )}
          >
            <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
            <span>الرئيسية</span>
          </Button>
          <h1 className="text-xl font-semibold">{t('products.searchProducts')}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/cart')}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItems.length > 0 && (
              <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-egyptian-gold">
                {cartItems.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className={cn(
              "absolute top-3 w-4 h-4 text-gray-400",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              placeholder="ابحث عن منتجات، ماركات، أو مكونات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10 pr-4",
                isRTL ? "pl-4 pr-10" : "pl-10 pr-4"
              )}
            />
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 space-x-reverse"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>فلاتر</span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              showFilters && "rotate-180"
            )} />
          </Button>

          <div className="flex items-center space-x-2 space-x-reverse">
            {(selectedCategory || selectedSkinTypes.length > 0 || selectedConcerns.length > 0 || maxPrice) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                مسح الفلاتر
              </Button>
            )}
            
            <span className="text-sm text-gray-500">
              {displayProducts.length} منتج
            </span>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                الفئة
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر فئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الفئات</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skin Types Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                نوع البشرة
              </label>
              <div className="flex flex-wrap gap-2">
                {skinTypes.map(type => (
                  <Button
                    key={type.value}
                    variant={selectedSkinTypes.includes(type.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSkinType(type.value)}
                    className={selectedSkinTypes.includes(type.value) ? "bg-egyptian-gold hover:bg-egyptian-gold/90" : ""}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Concerns Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                المشاكل
              </label>
              <div className="flex flex-wrap gap-2">
                {concerns.map(concern => (
                  <Button
                    key={concern.value}
                    variant={selectedConcerns.includes(concern.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleConcern(concern.value)}
                    className={selectedConcerns.includes(concern.value) ? "bg-deep-teal hover:bg-deep-teal/90 text-white" : ""}
                  >
                    {concern.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                السعر الأقصى (ج.م)
              </label>
              <Input
                type="number"
                placeholder="أدخل السعر الأقصى"
                value={maxPrice || ''}
                onChange={(e) => setMaxPrice(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Compare Bar */}
      {compareList.length > 0 && (
        <div className="bg-egyptian-gold text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-sm">مقارنة ({compareList.length}/2):</span>
              <div className="flex space-x-2 space-x-reverse">
                {compareList.map(product => (
                  <Badge
                    key={product.id}
                    variant="secondary"
                    className="bg-white text-black cursor-pointer"
                    onClick={() => handleRemoveFromCompare(product.id)}
                  >
                    {product.nameAr} ×
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCompareProducts}
              disabled={compareList.length !== 2}
              className="bg-white text-black hover:bg-gray-100"
            >
              قارن
            </Button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="px-6 py-6">
        {isLoadingProducts || isSearching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton h-48 w-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              لا توجد منتجات
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `لم نجد منتجات تحتوي على "${searchQuery}"`
                : "لم نجد منتجات تطابق الفلاتر المحددة"
              }
            </p>
            <Button onClick={clearFilters} variant="outline">
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onCompare={handleCompare}
                className={cn(
                  "fade-in",
                  compareList.find(p => p.id === product.id) && "ring-2 ring-egyptian-gold"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {displayProducts.length > 0 && displayProducts.length % 20 === 0 && (
        <div className="px-6 pb-6 text-center">
          <Button variant="outline" className="w-full">
            عرض المزيد
          </Button>
        </div>
      )}
    </div>
  );
}
