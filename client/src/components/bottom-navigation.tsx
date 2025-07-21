import { useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { Home, Search, ShoppingBag, MessageCircle, User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
}

const navigationItems: NavigationItem[] = [
  { path: "/", icon: Home, labelKey: "nav.home" },
  { path: "/quiz", icon: Heart, labelKey: "nav.quiz" },
  { path: "/products", icon: ShoppingBag, labelKey: "nav.products" },
  { path: "/chat", icon: MessageCircle, labelKey: "nav.chat" },
  { path: "/profile", icon: User, labelKey: "nav.profile" },
];

export function BottomNavigation() {
  const [location, navigate] = useLocation();
  const { t, isRTL } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-rose-pink/20 px-6 py-3 z-40 shadow-lg">
      <div className={cn(
        "flex items-center justify-between",
        isRTL ? "flex-row-reverse" : "flex-row"
      )}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center space-y-1 touch-button transition-all duration-300",
                isActive ? "text-rose-pink scale-110" : "text-gray-400 hover:text-rose-pink/70"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
