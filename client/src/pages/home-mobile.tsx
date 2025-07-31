import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  MessageCircle, 
  ShoppingBag, 
  Star, 
  User, 
  BarChart3, 
  Heart, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  Gift
} from "lucide-react";

export default function HomePage() {
  const language = localStorage.getItem("userLanguage") || "ar";
  const userId = parseInt(localStorage.getItem("userId") || "0");
  const isRTL = language === "ar";

  const { data: profile } = useQuery({
    queryKey: ["/api/auth/profile", userId],
  });

  const { data: recentChats } = useQuery({
    queryKey: ["/api/chat/recent", userId],
  });

  const { data: recommendedProducts } = useQuery({
    queryKey: ["/api/products/recommended", userId],
  });

  const quickActions = [
    {
      id: "chat",
      title: language === "ar" ? "استشارة خبير" : "Expert Chat",
      subtitle: language === "ar" ? "تحدث مع خبير العناية" : "Chat with skincare expert",
      icon: MessageCircle,
      color: "from-blue-500 to-blue-600",
      badge: "AI"
    },
    {
      id: "products",
      title: language === "ar" ? "المنتجات" : "Products",
      subtitle: language === "ar" ? "اكتشف منتجات جديدة" : "Discover new products",
      icon: ShoppingBag,
      color: "from-green-500 to-green-600"
    },
    {
      id: "compare",
      title: language === "ar" ? "مقارنة" : "Compare",
      subtitle: language === "ar" ? "قارن بين المنتجات" : "Compare products",
      icon: BarChart3,
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "profile",
      title: language === "ar" ? "ملفي الشخصي" : "My Profile",
      subtitle: language === "ar" ? "إدارة حسابك" : "Manage your account",
      icon: User,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className={`bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Welcome Card */}
      <div className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {language === "ar" ? `مرحباً ${profile?.username || ""}` : `Hello ${profile?.username || ""}!`}
              </h1>
              <p className="text-sm text-gray-600">
                {language === "ar" ? "كيف يمكنني مساعدتك اليوم؟" : "How can I help you today?"}
              </p>
            </div>
          </div>
          <Gift className="w-6 h-6 text-blue-500" />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center relative`}>
                      <Icon className="w-6 h-6 text-white" />
                      {action.badge && (
                        <Badge className="absolute -top-2 -right-2 text-xs bg-red-500 text-white px-1.5 py-0.5">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{action.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{action.subtitle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === "ar" ? "النشاط الأخير" : "Recent Activity"}
          </h2>
          <Button variant="ghost" size="sm" className="text-blue-600">
            {language === "ar" ? "عرض الكل" : "See All"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            {recentChats && recentChats.length > 0 ? (
              <div className="space-y-3">
                {recentChats.slice(0, 3).map((chat: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chat.message || (language === "ar" ? "محادثة مع الخبير" : "Chat with expert")}
                      </p>
                      <p className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {language === "ar" ? "منذ ساعتين" : "2 hours ago"}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm">
                  {language === "ar" ? "لا توجد محادثات سابقة" : "No recent chats"}
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  {language === "ar" ? "ابدأ محادثة" : "Start Chat"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Products */}
      <div className="px-4 mt-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === "ar" ? "منتجات موصى بها" : "Recommended Products"}
          </h2>
          <Button variant="ghost" size="sm" className="text-blue-600">
            {language === "ar" ? "عرض الكل" : "See All"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {recommendedProducts && recommendedProducts.length > 0 ? (
            recommendedProducts.slice(0, 5).map((product: any) => (
              <Card key={product.id} className="border-0 shadow-sm min-w-[160px] flex-shrink-0">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {language === "ar" ? product.nameAr : product.nameEn}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">{product.brand}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-blue-600">
                          {product.price} {language === "ar" ? "ج.م" : "EGP"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">4.5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 w-full">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-sm">
                {language === "ar" ? "لا توجد منتجات موصى بها" : "No recommended products"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}