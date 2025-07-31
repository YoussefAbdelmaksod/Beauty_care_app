import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Lock, Globe } from "lucide-react";
import { useLocation } from "wouter";

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  preferredLanguage: z.enum(["ar", "en"]),
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignUpData = z.infer<typeof signUpSchema>;
type SignInData = z.infer<typeof signInSchema>;

interface AuthPageProps {
  onSuccess?: () => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState("signin");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      preferredLanguage: "ar",
    },
  });

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign up failed");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك في تطبيق العناية بالبشرة",
      });
      setActiveTab("signin");
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في إنشاء الحساب",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignInData) => {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign in failed");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "أهلاً وسهلاً بك",
      });
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userId", data.user.id.toString());
      localStorage.setItem("userLanguage", data.user.preferredLanguage);
      
      if (onSuccess) {
        onSuccess();
      } else {
        setLocation("/quiz");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSignUp = (data: SignUpData) => {
    signUpMutation.mutate(data);
  };

  const onSignIn = (data: SignInData) => {
    signInMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full mx-auto flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
            العناية بالبشرة المصرية
          </CardTitle>
          <CardDescription>
            اكتشفي روتين العناية المثالي لبشرتك
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    {...signInForm.register("email")}
                    placeholder="ادخلي بريدك الإلكتروني"
                    className="text-right"
                  />
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{signInForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    كلمة المرور
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    {...signInForm.register("password")}
                    placeholder="ادخلي كلمة المرور"
                    className="text-right"
                  />
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-red-600">{signInForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    "تسجيل الدخول"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    اسم المستخدم
                  </Label>
                  <Input
                    id="signup-username"
                    {...signUpForm.register("username")}
                    placeholder="اختاري اسم مستخدم"
                    className="text-right"
                  />
                  {signUpForm.formState.errors.username && (
                    <p className="text-sm text-red-600">{signUpForm.formState.errors.username.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    {...signUpForm.register("email")}
                    placeholder="ادخلي بريدك الإلكتروني"
                    className="text-right"
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    كلمة المرور
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    {...signUpForm.register("password")}
                    placeholder="اختاري كلمة مرور قوية"
                    className="text-right"
                  />
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-red-600">{signUpForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    اللغة المفضلة
                  </Label>
                  <Select
                    value={signUpForm.watch("preferredLanguage")}
                    onValueChange={(value: "ar" | "en") => signUpForm.setValue("preferredLanguage", value)}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                  disabled={signUpMutation.isPending}
                >
                  {signUpMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    "إنشاء حساب"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}