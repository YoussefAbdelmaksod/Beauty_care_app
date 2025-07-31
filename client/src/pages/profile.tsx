import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  User, 
  Edit, 
  Save, 
  X, 
  Star,
  Calendar,
  Mail,
  Globe,
  Settings
} from "lucide-react";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    preferredLanguage: "ar"
  });
  
  const { toast } = useToast();
  const language = localStorage.getItem("userLanguage") || "ar";
  const userId = parseInt(localStorage.getItem("userId") || "0");

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["/api/auth/profile", userId],
    enabled: !!userId,
  });

  const { data: quizStatus } = useQuery({
    queryKey: ["/api/quiz/status", userId],
    enabled: !!userId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof editForm) => {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/profile"] });
      setIsEditing(false);
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: language === "ar" ? "تم تحديث ملفك الشخصي بنجاح" : "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: language === "ar" ? "خطأ في التحديث" : "Update Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (userProfile) {
      setEditForm({
        username: userProfile.username || "",
        email: userProfile.email || "",
        preferredLanguage: userProfile.preferredLanguage || "ar"
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      username: "",
      email: "",
      preferredLanguage: "ar"
    });
  };

  const t = {
    ar: {
      title: "ملفي الشخصي",
      back: "العودة",
      edit: "تعديل",
      save: "حفظ",
      cancel: "إلغاء",
      username: "اسم المستخدم",
      email: "البريد الإلكتروني",
      language: "اللغة المفضلة",
      quizStatus: "حالة الاستبيان",
      completed: "مكتمل",
      notCompleted: "غير مكتمل",
      retakeQuiz: "إعادة إجراء الاستبيان",
      memberSince: "عضو منذ",
      accountSettings: "إعدادات الحساب",
      quizResults: "نتائج الاستبيان",
      skinType: "نوع البشرة",
      concerns: "الاهتمامات",
      viewRecommendations: "عرض التوصيات"
    },
    en: {
      title: "My Profile",
      back: "Back",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      username: "Username",
      email: "Email",
      language: "Preferred Language",
      quizStatus: "Quiz Status",
      completed: "Completed",
      notCompleted: "Not Completed",
      retakeQuiz: "Retake Quiz",
      memberSince: "Member since",
      accountSettings: "Account Settings",
      quizResults: "Quiz Results",
      skinType: "Skin Type",
      concerns: "Concerns",
      viewRecommendations: "View Recommendations"
    }
  };

  const currentT = t[language as keyof typeof t];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {language === "ar" ? "جاري تحميل الملف الشخصي..." : "Loading profile..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4" />
            {currentT.back}
          </Button>
          <h1 className="text-xl font-bold text-gray-900 flex-1">
            {currentT.title}
          </h1>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              {currentT.edit}
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">
                  {userProfile?.username || "User"}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {currentT.memberSince} {new Date(userProfile?.createdAt || new Date()).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">{currentT.username}</Label>
                  <Input
                    id="username"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="email">{currentT.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="language">{currentT.language}</Label>
                  <select
                    id="language"
                    value={editForm.preferredLanguage}
                    onChange={(e) => setEditForm(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                    className="w-full p-2 border rounded-md text-right"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="bg-gradient-to-r from-rose-500 to-amber-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {currentT.save}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    {currentT.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">{currentT.email}:</span>
                    <span className="font-medium">{userProfile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">{currentT.language}:</span>
                    <span className="font-medium">
                      {userProfile?.preferredLanguage === "ar" ? "العربية" : "English"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {currentT.quizStatus}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge 
                  variant={quizStatus?.completed ? "default" : "secondary"}
                  className={quizStatus?.completed ? "bg-green-500" : ""}
                >
                  {quizStatus?.completed ? currentT.completed : currentT.notCompleted}
                </Badge>
                {quizStatus?.completedAt && (
                  <span className="text-sm text-gray-500">
                    {new Date(quizStatus.completedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setLocation("/quiz")}
                >
                  {currentT.retakeQuiz}
                </Button>
                {quizStatus?.completed && (
                  <Button 
                    onClick={() => setLocation("/recommendations")}
                    className="bg-gradient-to-r from-rose-500 to-amber-500"
                  >
                    {currentT.viewRecommendations}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Results Summary */}
        {quizStatus?.completed && quizStatus?.results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                {currentT.quizResults}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{currentT.skinType}</h4>
                  <div className="flex flex-wrap gap-1">
                    {quizStatus.results.skinTypes?.map((type: string) => (
                      <Badge key={type} variant="secondary">
                        {language === "ar" ? getArabicSkinType(type) : type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{currentT.concerns}</h4>
                  <div className="flex flex-wrap gap-1">
                    {quizStatus.results.concerns?.slice(0, 3).map((concern: string) => (
                      <Badge key={concern} variant="outline">
                        {language === "ar" ? getArabicConcern(concern) : concern}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getArabicSkinType(type: string): string {
  const translations: Record<string, string> = {
    "oily": "دهنية",
    "dry": "جافة",
    "combination": "مختلطة",
    "normal": "طبيعية",
    "sensitive": "حساسة"
  };
  return translations[type.toLowerCase()] || type;
}

function getArabicConcern(concern: string): string {
  const translations: Record<string, string> = {
    "acne": "حب الشباب",
    "hyperpigmentation": "فرط التصبغ",
    "dryness": "الجفاف",
    "aging": "الشيخوخة",
    "pores": "المسام الواسعة"
  };
  return translations[concern.toLowerCase()] || concern;
}