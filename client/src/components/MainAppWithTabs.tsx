import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  MessageCircle, 
  ShoppingBag, 
  BarChart3, 
  User,
  Bell,
  Search,
  Menu
} from "lucide-react";
import HomePage from "../pages/home-mobile";
import ChatPage from "../pages/chat";
import ProductsPage from "../pages/products-mobile";
import ComparePage from "../pages/compare";
import ProfilePage from "../pages/profile-mobile";

export default function MainAppWithTabs() {
  const [activeTab, setActiveTab] = useState("home");
  const language = localStorage.getItem("userLanguage") || "ar";
  const isRTL = language === "ar";

  const tabs = [
    {
      id: "home",
      label: language === "ar" ? "الرئيسية" : "Home",
      icon: Home,
      component: HomePage
    },
    {
      id: "chat",
      label: language === "ar" ? "الدردشة" : "Chat", 
      icon: MessageCircle,
      component: ChatPage
    },
    {
      id: "products",
      label: language === "ar" ? "المنتجات" : "Products",
      icon: ShoppingBag,
      component: ProductsPage
    },
    {
      id: "compare",
      label: language === "ar" ? "المقارنة" : "Compare",
      icon: BarChart3,
      component: ComparePage
    },
    {
      id: "profile",
      label: language === "ar" ? "الملف الشخصي" : "Profile",
      icon: User,
      component: ProfilePage
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || HomePage;

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between p-4 pt-12">
          <div className="flex items-center gap-3">
            <Menu className="w-6 h-6" />
            <h1 className="text-lg font-semibold">
              {language === "ar" ? "بيوتي كير" : "Beauty Care"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6" />
            <Bell className="w-6 h-6" />
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-600"
              onClick={() => {
                const newLang = language === "ar" ? "en" : "ar";
                localStorage.setItem("userLanguage", newLang);
                window.location.reload();
              }}
            >
              {language === "ar" ? "EN" : "ع"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Mobile First */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <ActiveComponent />
      </div>

      {/* Bottom Navigation - Mobile Style */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6 mb-1" />
                  {tab.id === "chat" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-blue-600 rounded-full mt-1"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}