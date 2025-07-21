import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { Plus, Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  className?: string;
  variant?: "default" | "compact";
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onCompare, 
  className,
  variant = "default" 
}: ProductCardProps) {
  const { t, language } = useTranslation();
  const [isLiked, setIsLiked] = useState(false);

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionEn;

  const handleAddToCart = () => {
    onAddToCart?.(product);
  };

  const handleCompare = () => {
    onCompare?.(product);
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex-shrink-0 w-40 product-card", className)}>
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150"}
          alt={name}
          className="w-full h-24 object-cover rounded-lg mb-3"
        />
        <h4 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
          {name}
        </h4>
        <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold egyptian-gold">
            {product.price} {t('common.currency')}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddToCart}
            className="w-6 h-6 p-0 bg-egyptian-gold/10 hover:bg-egyptian-gold/20 rounded-full"
          >
            <Plus className="h-3 w-3 egyptian-gold" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("product-card", className)}>
      <div className="relative">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"}
          alt={name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        
        {/* Like Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleToggleLike}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 p-0 rounded-full bg-white/80 backdrop-blur-sm",
            isLiked ? "text-red-500" : "text-gray-400"
          )}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </Button>

        {/* Egyptian Badge */}
        {product.isEgyptian && (
          <Badge className="absolute top-2 left-2 bg-egyptian-gold text-white">
            مصري
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
            {name}
          </h3>
          <p className="text-sm text-gray-600">{product.brand}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Skin Types */}
        {product.skinTypes && product.skinTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.skinTypes.slice(0, 2).map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
            {product.skinTypes.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{product.skinTypes.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Rating & Effectiveness */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 mr-1">
              {(product.effectiveness || 0) / 20}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {t('products.effectiveness')}: {product.effectiveness}%
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-lg font-bold egyptian-gold">
              {product.price}
            </span>
            <span className="text-sm text-gray-500 mr-1">ج.م</span>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCompare}
              className="text-xs"
            >
              {t('products.compare')}
            </Button>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="bg-egyptian-gold hover:bg-egyptian-gold/90 text-white"
            >
              <Plus className="h-4 w-4 ml-1" />
              {t('products.addToCart')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
