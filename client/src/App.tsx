import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import AuthPage from "./pages/auth";
import QuizPage from "./pages/quiz";
import RecommendationsPage from "./pages/recommendations";

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
              <Route path="/" component={QuizPage} />
              <Route path="/quiz" component={QuizPage} />
              <Route path="/recommendations" component={RecommendationsPage} />
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
