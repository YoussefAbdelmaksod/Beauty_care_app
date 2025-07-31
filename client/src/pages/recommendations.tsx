import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  brand: string;
  category: string;
  price: string;
  skinTypes?: string[];
  concerns?: string[];
  ingredients?: string[];
  rating?: string;
  description?: string;
  descriptionAr?: string;
}

interface Analysis {
  skinTypes: string[];
  concerns: string[];
  budgetMax: number;
  skinTone: string;
  age: number;
}

export default function RecommendationsPage() {
  const [, setLocation] = useLocation();
  const userId = parseInt(localStorage.getItem("userId") || "0");
  const language = localStorage.getItem("userLanguage") || "ar";

  const { data: recommendationsData, isLoading } = useQuery({
    queryKey: ["/api/quiz/recommendations", userId],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {language === "ar" ? "جاري إنشاء توصياتك المخصصة..." : "Creating your personalized recommendations..."}
          </p>
        </div>
      </div>
    );
  }

  if (!recommendationsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">
              {language === "ar" ? "خطأ في التحميل" : "Loading Error"}
            </CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "لم نتمكن من إنشاء توصياتك. يرجى إكمال الاستبيان أولاً." 
                : "We couldn't create your recommendations. Please complete the quiz first."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation("/quiz")}
              className="w-full bg-gradient-to-r from-rose-500 to-amber-500"
            >
              {language === "ar" ? "إكمال الاستبيان" : "Complete Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { analysis, recommendations }: { analysis: Analysis; recommendations: Product[] } = recommendationsData || { analysis: { skinTypes: [], concerns: [], budgetMax: 0, skinTone: "", age: 0 }, recommendations: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === "ar" ? "توصياتك المخصصة" : "Your Personalized Recommendations"}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === "ar" 
              ? "بناءً على إجاباتك في الاستبيان، قمنا بتحديد أفضل المنتجات لبشرتك" 
              : "Based on your quiz responses, we've identified the best products for your skin"}
          </p>
        </div>

        {/* Analysis Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              {language === "ar" ? "تحليل بشرتك" : "Your Skin Analysis"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {language === "ar" ? "نوع البشرة" : "Skin Type"}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.skinTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {language === "ar" ? getArabicSkinType(type) : type}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {language === "ar" ? "الاهتمامات الرئيسية" : "Main Concerns"}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.concerns.slice(0, 3).map((concern) => (
                    <Badge key={concern} variant="outline">
                      {language === "ar" ? getArabicConcern(concern) : concern}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {language === "ar" ? "الميزانية المفضلة" : "Budget Range"}
                </h4>
                <Badge className="bg-green-100 text-green-800">
                  {language === "ar" ? `حتى ${analysis.budgetMax} جنيه` : `Up to ${analysis.budgetMax} EGP`}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((product) => (
            <Card key={product.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {language === "ar" ? product.nameAr || product.name : product.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                  </div>
                  {product.rating && (
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-rose-600">
                    {product.price} {language === "ar" ? "جنيه" : "EGP"}
                  </span>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="mb-4 text-right">
                  {language === "ar" ? product.descriptionAr || product.description : product.description}
                </CardDescription>
                
                {/* Suitable for */}
                {product.skinTypes && product.skinTypes.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      {language === "ar" ? "مناسب لـ:" : "Suitable for:"}
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {product.skinTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {language === "ar" ? getArabicSkinType(type) : type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target concerns */}
                {product.concerns && product.concerns.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      {language === "ar" ? "يعالج:" : "Targets:"}
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {product.concerns.slice(0, 3).map((concern) => (
                        <Badge key={concern} variant="secondary" className="text-xs">
                          {language === "ar" ? getArabicConcern(concern) : concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {language === "ar" ? "أضف للسلة" : "Add to Cart"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {recommendations.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {language === "ar" ? "لا توجد توصيات متاحة" : "No Recommendations Available"}
              </h3>
              <p className="text-gray-500 mb-6">
                {language === "ar" 
                  ? "نحن نعمل على إضافة المزيد من المنتجات المناسبة لبشرتك" 
                  : "We're working on adding more products suitable for your skin"}
              </p>
              <Button 
                onClick={() => setLocation("/quiz")}
                variant="outline"
              >
                {language === "ar" ? "إعادة إجراء الاستبيان" : "Retake Quiz"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            variant="outline"
            onClick={() => setLocation("/quiz")}
          >
            {language === "ar" ? "تعديل الإجابات" : "Edit Responses"}
          </Button>
          <Button 
            onClick={() => setLocation("/")}
            className="bg-gradient-to-r from-rose-500 to-amber-500"
          >
            {language === "ar" ? "الرئيسية" : "Home"}
          </Button>
        </div>
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

function getArabicConcern(concern: string): string {
  const translations: Record<string, string> = {
    "acne": "حب الشباب",
    "hyperpigmentation": "فرط التصبغ",
    "dryness": "الجفاف",
    "oil control": "التحكم في الزيوت",
    "anti-aging": "مكافحة الشيخوخة",
    "enlarged pores": "المسام الواسعة"
  };
  return translations[concern.toLowerCase()] || concern;
}