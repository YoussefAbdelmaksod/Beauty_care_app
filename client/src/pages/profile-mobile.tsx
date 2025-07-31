import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  Settings, 
  LogOut, 
  Heart, 
  Star, 
  Gift,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  Edit,
  Camera,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

export default function ProfilePage() {
  const language = localStorage.getItem("userLanguage") || "ar";
  const userId = parseInt(localStorage.getItem("userId") || "0");
  const isRTL = language === "ar";

  const { data: profile } = useQuery({
    queryKey: ["/api/auth/profile", userId],
  });

  const { data: favorites } = useQuery({
    queryKey: ["/api/favorites", userId],
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userLanguage");
    window.location.reload();
  };

  const profileActions = [
    {
      id: "favorites",
      title: language === "ar" ? "المفضلة" : "Favorites",
      subtitle: language === "ar" ? "المنتجات المحفوظة" : "Saved products",
      icon: Heart,
      color: "text-red-500",
      badge: favorites?.length || 0
    },
    {
      id: "orders",
      title: language === "ar" ? "طلباتي" : "My Orders",
      subtitle: language === "ar" ? "تتبع الطلبات" : "Track orders",
      icon: Gift,
      color: "text-green-500"
    },
    {
      id: "notifications",
      title: language === "ar" ? "الإشعارات" : "Notifications",
      subtitle: language === "ar" ? "إدارة التنبيهات" : "Manage alerts",
      icon: Bell,
      color: "text-blue-500"
    },
    {
      id: "privacy",
      title: language === "ar" ? "الخصوصية" : "Privacy",
      subtitle: language === "ar" ? "إعدادات الأمان" : "Security settings",
      icon: Shield,
      color: "text-purple-500"
    },
    {
      id: "help",
      title: language === "ar" ? "المساعدة" : "Help & Support",
      subtitle: language === "ar" ? "الأسئلة الشائعة" : "FAQ & Contact",
      icon: HelpCircle,
      color: "text-orange-500"
    }
  ];

  return (
    <div className={`bg-gray-50 pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Profile Header */}
      <div className="bg-white mx-4 mt-4 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-gray-100">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">
                {profile?.username || (language === "ar" ? "مستخدم" : "User")}
              </h1>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {profile?.email || (language === "ar" ? "البريد الإلكتروني" : "email@example.com")}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="secondary" className="text-xs">
                {language === "ar" ? "عضو مميز" : "Premium Member"}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">4.8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-gray-600">
                {language === "ar" ? "منتج مفضل" : "Favorites"}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">5</div>
              <div className="text-xs text-gray-600">
                {language === "ar" ? "طلب مكتمل" : "Orders"}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-xs text-gray-600">
                {language === "ar" ? "تقييم" : "Reviews"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {language === "ar" ? "إعدادات الحساب" : "Account Settings"}
        </h2>
        
        <div className="space-y-2">
          {profileActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${action.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {action.badge !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* App Settings */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {language === "ar" ? "إعدادات التطبيق" : "App Settings"}
        </h2>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  {language === "ar" ? "اللغة" : "Language"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newLang = language === "ar" ? "en" : "ar";
                  localStorage.setItem("userLanguage", newLang);
                  window.location.reload();
                }}
              >
                {language === "ar" ? "English" : "العربية"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logout Section */}
      <div className="px-4 mt-6 mb-6">
        <Card className="border-0 shadow-sm border-red-100">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">
                {language === "ar" ? "تسجيل الخروج" : "Logout"}
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* App Info */}
      <div className="px-4 text-center text-gray-500 text-xs">
        <p>{language === "ar" ? "بيوتي كير - الإصدار 1.0" : "Beauty Care - Version 1.0"}</p>
        <p className="mt-1">
          {language === "ar" ? "© 2024 جميع الحقوق محفوظة" : "© 2024 All rights reserved"}
        </p>
      </div>
    </div>
  );
}