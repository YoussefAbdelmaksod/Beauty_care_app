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
  Heart,
  Sparkles,
  Search,
  Filter
} from "lucide-react";
import HomePage from "../pages/home";
import ChatPage from "../pages/chat";
import ProductsPage from "../pages/products";
import ComparePage from "../pages/compare";
import ProfilePage from "../pages/profile";

export default function MainAppWithTabs() {
  const [activeTab, setActiveTab] = useState("home");
  const language = localStorage.getItem("userLanguage") || "ar";

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
    <div className="min-h-screen flex flex-col">
      {/* Header with App Title */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {language === "ar" ? "بيوتي كير" : "Beauty Care"}
              </h1>
              <p className="text-sm text-gray-500">
                {language === "ar" ? "العناية بالبشرة المصرية" : "Egyptian Skincare"}
              </p>
            </div>
          </div>
          
          {/* Language Toggle */}
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
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-rose-500 text-rose-600 bg-rose-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.id === "chat" && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      AI
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <ActiveComponent />
      </div>

      {/* Mobile Bottom Navigation (shown on small screens) */}
      <div className="md:hidden bg-white border-t fixed bottom-0 left-0 right-0 z-50">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 ${
                  isActive
                    ? "text-rose-600"
                    : "text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-rose-600 rounded-full mt-1"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16"></div>
    </div>
  );
}