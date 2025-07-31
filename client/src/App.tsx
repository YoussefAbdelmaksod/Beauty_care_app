import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import AuthPage from "./pages/auth";
import HomePage from "./pages/home";
import QuizPage from "./pages/quiz";
import RecommendationsPage from "./pages/recommendations";
import ChatPage from "./pages/chat";
import ProductsPage from "./pages/products";
import ComparePage from "./pages/compare";
import ProfilePage from "./pages/profile";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    
    if (token && userId) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <Switch>
          {!isAuthenticated ? (
            <>
              <Route path="/">
                <AuthPage onSuccess={handleAuthSuccess} />
              </Route>
              <Route path="/auth">
                <AuthPage onSuccess={handleAuthSuccess} />
              </Route>
            </>
          ) : (
            <>
              <Route path="/" component={HomePage} />
              <Route path="/home" component={HomePage} />
              <Route path="/quiz" component={QuizPage} />
              <Route path="/recommendations" component={RecommendationsPage} />
              <Route path="/chat" component={ChatPage} />
              <Route path="/products" component={ProductsPage} />
              <Route path="/compare" component={ComparePage} />
              <Route path="/profile" component={ProfilePage} />
            </>
          )}
          <Route>
            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - الصفحة غير موجودة</h1>
                <p className="text-gray-600">الصفحة التي تبحث عنها غير متاحة</p>
              </div>
            </div>
          </Route>
        </Switch>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
