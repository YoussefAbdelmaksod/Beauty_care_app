import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNavigation } from "@/components/bottom-navigation";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Analysis from "@/pages/analysis";
import Products from "@/pages/products";
import Chat from "@/pages/chat";
import Profile from "@/pages/profile";

function Router() {
  return (
    <div className="mobile-container">
      <div className="status-bar"></div>
      
      <div className="pb-20">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/analysis" component={Analysis} />
          <Route path="/products" component={Products} />
          <Route path="/chat" component={Chat} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </div>
      
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
