import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, User, Globe, Bell, Moon, Sun,
  Settings, HelpCircle, LogOut, Edit,
  TrendingUp, Calendar, Award, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function Profile() {
  const { t, language, changeLanguage, isRTL } = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Mock user data - in real app this would come from API
  const [userProfile, setUserProfile] = useState({
    name: 'سارة محمد',
    email: 'sara.mohamed@example.com',
    phone: '+20 123 456 7890',
    skinType: 'combination',
    concerns: ['acne', 'dark_spots'],
    budgetTier: 'premium',
    joinDate: '2024-01-15'
  });

  // Mock statistics
  const userStats = {
    analysesCount: 12,
    routinesCreated: 3,
    progressScore: 78,
    daysActive: 45
  };

  const handleProfileUpdate = () => {
    setIsEditing(false);
    toast({
      title: "تم التحديث",
      description: "تم تحديث ملفك الشخصي بنجاح",
    });
  };

  const handleLanguageChange = (newLang: 'ar' | 'en') => {
    changeLanguage(newLang);
    toast({
      title: language === 'ar' ? "Language Changed" : "تم تغيير اللغة",
      description: language === 'ar' ? "Language has been changed to English" : "تم تغيير اللغة إلى العربية",
    });
  };

  const handleLogout = () => {
    toast({
      title: "تم تسجيل الخروج",
      description: "نراك قريباً!",
    });
    // In real app, clear auth tokens and navigate to login
    navigate('/');
  };

  const skinTypeLabels = {
    dry: 'بشرة جافة',
    oily: 'بشرة دهنية',
    combination: 'بشرة مختلطة',
    sensitive: 'بشرة حساسة',
    normal: 'بشرة عادية'
  };

  const concernLabels = {
    acne: 'حبوب',
    dark_spots: 'تصبغات',
    wrinkles: 'تجاعيد',
    dryness: 'جفاف',
    oil_control: 'تحكم في الدهون'
  };

  const budgetTierLabels = {
    basic: 'أساسية',
    premium: 'متوسطة',
    luxury: 'عالية'
  };

  return (
    <div className="min-h-screen bg-warm-white pb-6">
      {/* Header */}
      <header className="bg-gradient-egyptian text-white px-6 py-6">
        <div className={cn(
          "flex items-center justify-between mb-4",
          isRTL ? "flex-row-reverse" : ""
        )}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className={cn(
              "text-white hover:bg-white/20 flex items-center space-x-2",
              isRTL ? "space-x-reverse" : ""
            )}
          >
            <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
            <span>الرئيسية</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-white hover:bg-white/20"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="h-10 w-10" />
          </div>
          <h1 className="text-xl font-bold mb-1">{userProfile.name}</h1>
          <p className="text-sm opacity-90">{userProfile.email}</p>
          <Badge className="mt-2 bg-white text-gray-800">
            عضوة منذ {new Date(userProfile.joinDate).getFullYear()}
          </Badge>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="px-6 -mt-8 relative z-10 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 egyptian-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{userStats.progressScore}%</div>
              <div className="text-xs text-gray-500">نسبة التحسن</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 deep-teal mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{userStats.analysesCount}</div>
              <div className="text-xs text-gray-500">تحليل</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Information */}
      <div className="px-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الشخصية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div className="flex space-x-2 space-x-reverse pt-4">
                  <Button
                    onClick={handleProfileUpdate}
                    className="flex-1 bg-egyptian-gold hover:bg-egyptian-gold/90"
                  >
                    حفظ التغييرات
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">الاسم:</span>
                  <span className="font-medium">{userProfile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">البريد الإلكتروني:</span>
                  <span className="font-medium">{userProfile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الهاتف:</span>
                  <span className="font-medium">{userProfile.phone}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skin Profile */}
        <Card>
          <CardHeader>
            <CardTitle>ملف البشرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>نوع البشرة</Label>
                {isEditing ? (
                  <Select 
                    value={userProfile.skinType} 
                    onValueChange={(value) => setUserProfile({...userProfile, skinType: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(skinTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className="mt-1 bg-egyptian-gold text-white">
                    {skinTypeLabels[userProfile.skinType as keyof typeof skinTypeLabels]}
                  </Badge>
                )}
              </div>

              <div>
                <Label>المشاكل الحالية</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {userProfile.concerns.map(concern => (
                    <Badge key={concern} variant="outline">
                      {concernLabels[concern as keyof typeof concernLabels]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>فئة الميزانية</Label>
                <div className="mt-1">
                  <Badge className="bg-deep-teal text-white">
                    {budgetTierLabels[userProfile.budgetTier as keyof typeof budgetTierLabels]}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle>إعدادات التطبيق</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Globe className="h-5 w-5 text-gray-500" />
                <span>اللغة</span>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Bell className="h-5 w-5 text-gray-500" />
                <span>الإشعارات</span>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                {isDarkMode ? <Moon className="h-5 w-5 text-gray-500" /> : <Sun className="h-5 w-5 text-gray-500" />}
                <span>الوضع الليلي</span>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/analysis')}
            >
              <TrendingUp className="h-5 w-5 mr-3" />
              عرض تقدم البشرة
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/products')}
            >
              <Award className="h-5 w-5 mr-3" />
              المنتجات المفضلة
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <HelpCircle className="h-5 w-5 mr-3" />
              المساعدة والدعم
            </Button>
            
            <Separator />
            
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              تسجيل الخروج
            </Button>
          </CardContent>
        </Card>

        {/* Achievement Badge */}
        <Card className="bg-gradient-to-r from-egyptian-gold to-amber-400 text-white">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">محبة العناية بالبشرة</h3>
            <p className="text-sm opacity-90">
              أكملت {userStats.daysActive} يوم من العناية المستمرة!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
