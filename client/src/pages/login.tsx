import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart, Sparkles, Eye, EyeOff, 
  Mail, Lock, UserPlus, LogIn 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const authMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await apiRequest('POST', endpoint, data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome! 🌸",
        description: isLogin ? "Successfully logged in!" : "Account created successfully!",
      });
      // Redirect to quiz for new users, home for existing users
      navigate(isLogin ? "/" : "/quiz");
    },
    onError: (error: any) => {
      toast({
        title: "Oops!",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords don't match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const submitData = isLogin 
      ? { email: formData.email, password: formData.password }
      : { 
          username: formData.username, 
          email: formData.email, 
          password: formData.password 
        };

    authMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-pink via-lavender to-coral p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="text-rose-pink text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Beauty Care</h1>
          <p className="text-rose-100">Your skincare journey begins here</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-gray-800 flex items-center justify-center">
              {isLogin ? (
                <>
                  <LogIn className="mr-2 text-rose-pink" />
                  Welcome Back
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 text-rose-pink" />
                  Join Beauty Care
                </>
              )}
            </CardTitle>
            <p className="text-gray-600">
              {isLogin 
                ? "Sign in to continue your skincare journey" 
                : "Create your account and discover your skin type"
              }
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username (Sign up only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 font-medium flex items-center">
                    <Sparkles className="mr-2 text-rose-pink text-sm" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-pink focus:ring-rose-pink"
                    placeholder="Choose a beautiful username"
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center">
                  <Mail className="mr-2 text-rose-pink text-sm" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-pink focus:ring-rose-pink"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium flex items-center">
                  <Lock className="mr-2 text-rose-pink text-sm" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-rose-pink focus:ring-rose-pink"
                    placeholder="Create a secure password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-rose-pink"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign up only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium flex items-center">
                    <Lock className="mr-2 text-rose-pink text-sm" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-pink focus:ring-rose-pink"
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={authMutation.isPending}
                className="w-full bg-gradient-to-r from-rose-pink to-coral text-white py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {authMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {isLogin ? <LogIn className="mr-2" /> : <UserPlus className="mr-2" />}
                    {isLogin ? "Sign In" : "Create Account"}
                  </div>
                )}
              </Button>
            </form>

            {/* Toggle between login/signup */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "New to Beauty Care?" : "Already have an account?"}
              </p>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-rose-pink font-semibold hover:text-coral transition-colors mt-1"
              >
                {isLogin ? "Create your account" : "Sign in here"}
              </button>
            </div>

            {/* Skip for now */}
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/quiz")}
                className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                Skip for now and take the quiz
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Decorative elements */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-4 text-white/70">
            <Heart className="text-2xl" />
            <Sparkles className="text-2xl" />
            <Heart className="text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}