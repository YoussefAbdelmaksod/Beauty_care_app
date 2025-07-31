import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  MessageCircle, 
  ShoppingCart, 
  Star, 
  User, 
  BarChart3, 
  Heart, 
  Search,
  LogOut,
  Sparkles
} from "lucide-react";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState(localStorage.getItem("userLanguage") || "ar");
  const userId = parseInt(localStorage.getItem("userId") || "0");

  const { data: userProfile } = useQuery({
    queryKey: ["/api/auth/profile", userId],
    enabled: !!userId,
  });

  const { data: recentChats } = useQuery({
    queryKey: ["/api/chat/recent", userId],
    enabled: !!userId,
  });

  const { data: recommendedProducts } = useQuery({
    queryKey: ["/api/products/recommended", userId],
    enabled: !!userId,
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userLanguage");
    window.location.reload();
  };

  const toggleLanguage = () => {
    const newLang = language === "ar" ? "en" : "ar";
    setLanguage(newLang);
    localStorage.setItem("userLanguage", newLang);
  };

  const t = {
    ar: {
      welcome: "مرحباً",
      subtitle: "كيف يمكنني مساعدتك اليوم؟",
      chatWithAI: "تحدث مع خبير العناية",
      exploreProducts: "استكشف المنتجات",
      compareProducts: "قارن المنتجات",
      myProfile: "ملفي الشخصي",
      recentChats: "المحادثات الأخيرة",
      recommendedForYou: "موصى لك",
      viewAll: "عرض الكل",
      noChats: "لا توجد محادثات سابقة",
      startFirstChat: "ابدأ محادثتك الأولى",
      logout: "تسجيل الخروج",
      language: "English",
      retakeQuiz: "إعادة إجراء الاستبيان",
      skinAnalysis: "تحليل البشرة"
    },
    en: {
      welcome: "Welcome",
      subtitle: "How can I help you today?",
      chatWithAI: "Chat with AI Expert",
      exploreProducts: "Explore Products",
      compareProducts: "Compare Products", 
      myProfile: "My Profile",
      recentChats: "Recent Chats",
      recommendedForYou: "Recommended for You",
      viewAll: "View All",
      noChats: "No previous chats",
      startFirstChat: "Start your first chat",
      logout: "Logout",
      language: "العربية",
      retakeQuiz: "Retake Quiz",
      skinAnalysis: "Skin Analysis"
    }
  };

  const currentT = t[language as keyof typeof t];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentT.welcome} {userProfile?.username || ""}! 
            </h1>
            <p className="text-gray-600 mt-1">{currentT.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleLanguage}>
              {currentT.language}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              {currentT.logout}
            </Button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0"
            onClick={() => setLocation("/chat")}
          >
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">{currentT.chatWithAI}</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-green-500 to-teal-600 text-white border-0"
            onClick={() => setLocation("/products")}
          >
            <CardContent className="p-4 text-center">
              <Search className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">{currentT.exploreProducts}</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-500 to-red-600 text-white border-0"
            onClick={() => setLocation("/compare")}
          >
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">{currentT.compareProducts}</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-rose-500 to-pink-600 text-white border-0"
            onClick={() => setLocation("/profile")}
          >
            <CardContent className="p-4 text-center">
              <User className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">{currentT.myProfile}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Chats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                {currentT.recentChats}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentChats && recentChats.length > 0 ? (
                <div className="space-y-3">
                  {recentChats.slice(0, 3).map((chat: any) => (
                    <div 
                      key={chat.id}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setLocation("/chat")}
                    >
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {chat.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(chat.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                      </p>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setLocation("/chat")}
                  >
                    {currentT.viewAll}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-3">{currentT.noChats}</p>
                  <Button 
                    onClick={() => setLocation("/chat")}
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    {currentT.startFirstChat}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                {currentT.recommendedForYou}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendedProducts && recommendedProducts.length > 0 ? (
                <div className="space-y-3">
                  {recommendedProducts.slice(0, 3).map((product: any) => (
                    <div 
                      key={product.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setLocation(`/products/${product.id}`)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-amber-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {language === "ar" ? product.nameAr || product.name : product.name}
                        </h4>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-rose-600">
                            {product.price} EGP
                          </span>
                          {product.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500 fill-current" />
                              <span className="text-xs text-gray-600">{product.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setLocation("/products")}
                  >
                    {currentT.viewAll}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-3">
                    {language === "ar" 
                      ? "أكمل الاستبيان أولاً للحصول على توصيات مخصصة" 
                      : "Complete the quiz first to get personalized recommendations"}
                  </p>
                  <Button 
                    onClick={() => setLocation("/quiz")}
                    className="bg-gradient-to-r from-rose-500 to-amber-500"
                  >
                    {currentT.retakeQuiz}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => setLocation("/analysis")}
          >
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <span className="text-sm">{currentT.skinAnalysis}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => setLocation("/favorites")}
          >
            <Heart className="w-6 h-6 text-red-500" />
            <span className="text-sm">
              {language === "ar" ? "المفضلة" : "Favorites"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}