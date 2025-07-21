import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { CameraModal } from "@/components/camera-modal";
import { useTranslation } from "@/lib/i18n";
import { analysisApi, productsApi, pharmaciesApi, getCurrentLocation } from "@/lib/api";
import { 
  Camera, Edit, Globe, User, Heart,
  Waves, Calendar, TrendingUp, MessageCircle,
  MapPin, Phone, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function Home() {
  const { t, language, changeLanguage, isRTL } = useTranslation();
  const [, navigate] = useLocation();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<string>('basic');

  // Fetch recommended products
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent analyses for user (mock user ID = 1)
  const { data: recentAnalyses = [] } = useQuery({
    queryKey: ['/api/analysis', 1],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch nearby pharmacies
  const { data: nearbyPharmacies = [] } = useQuery({
    queryKey: ['/api/pharmacies'],
    queryFn: async () => {
      try {
        const location = await getCurrentLocation();
        return pharmaciesApi.getNearby(location.lat, location.lng, 10);
      } catch {
        // Fallback to all pharmacies if location fails
        return pharmaciesApi.getAll();
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const budgetTiers = [
    { 
      key: 'basic', 
      nameKey: 'budget.basic', 
      rangeKey: 'budget.basicRange' 
    },
    { 
      key: 'premium', 
      nameKey: 'budget.premium', 
      rangeKey: 'budget.premiumRange' 
    },
    { 
      key: 'luxury', 
      nameKey: 'budget.luxury', 
      rangeKey: 'budget.luxuryRange' 
    }
  ];

  const handleCameraCapture = async (imageData: string) => {
    try {
      const result = await analysisApi.analyzeImage({
        imageData,
        userId: 1
      });
      
      // Navigate to analysis results
      navigate(`/analysis?result=${result.analysis.id}`);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleTextAnalysis = () => {
    navigate('/analysis?mode=text');
  };

  const handlePharmacyCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handlePharmacyDirections = (pharmacy: any) => {
    if (pharmacy.location) {
      const { lat, lng } = pharmacy.location;
      window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header Section */}
      <header className="gradient-egyptian text-white px-6 py-4 relative">
        <div className={cn(
          "flex items-center justify-between mb-4",
          isRTL ? "flex-row-reverse" : ""
        )}>
          <div className={cn(
            "flex items-center space-x-3",
            isRTL ? "space-x-reverse" : ""
          )}>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Waves className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t('app.title')}</h1>
              <p className="text-sm opacity-90">{t('app.subtitle')}</p>
            </div>
          </div>
          <div className={cn(
            "flex items-center space-x-2",
            isRTL ? "space-x-reverse" : ""
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full p-0 text-white hover:bg-white/30"
            >
              <Globe className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full p-0 text-white hover:bg-white/30"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {t('home.welcome')}، <span>سارة</span>
          </h2>
          <p className="text-sm opacity-90">{t('home.subtitle')}</p>
        </div>
      </header>

      {/* Skin Quiz Call-to-Action */}
      <div className="px-6 -mt-8 relative z-10 mb-4">
        <Card className="bg-gradient-to-r from-rose-pink to-coral border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  <Heart className="mr-2 text-xl" />
                  Discover Your Skin Type
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  Take our personalized quiz to find the perfect skincare routine for you!
                </p>
                <Button 
                  onClick={() => navigate('/quiz')}
                  className="bg-white text-rose-pink hover:bg-gray-50 font-semibold px-6 py-2 rounded-xl"
                >
                  Take Quiz Now ✨
                </Button>
              </div>
              <div className="ml-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="text-2xl text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Analysis Card */}
      <div className="px-6 -mt-6 relative z-10">
        <Card className="border-egyptian-gold border-opacity-20">
          <CardContent className="p-6">
            <div className={cn(
              "flex items-center justify-between mb-4",
              isRTL ? "flex-row-reverse" : ""
            )}>
              <h3 className="text-lg font-semibold text-gray-800">
                {t('home.quickAnalysis')}
              </h3>
              <div className="w-6 h-6 bg-egyptian-gold bg-opacity-20 rounded-full flex items-center justify-center">
                <Camera className="text-yellow-600 text-xs" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCameraOpen(true)}
                className={cn(
                  "group h-auto p-4 border-2 hover:border-egyptian-gold transition-all duration-300",
                  "bg-gradient-to-br from-cream to-white"
                )}
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-egyptian-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto group-hover:pulse-glow">
                    <Camera className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('home.photoAnalysis')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('home.photoSubtitle')}
                    </p>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleTextAnalysis}
                className={cn(
                  "group h-auto p-4 border-2 hover:border-egyptian-gold transition-all duration-300",
                  "bg-gradient-to-br from-cream to-white"
                )}
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto group-hover:pulse-glow">
                    <Edit className="h-6 w-6 deep-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('home.textAnalysis')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('home.textSubtitle')}
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      {recentAnalyses.length > 0 && (
        <div className="px-6 mt-6">
          <div className={cn(
            "flex items-center justify-between mb-4",
            isRTL ? "flex-row-reverse" : ""
          )}>
            <h3 className="text-lg font-semibold text-gray-800">
              {t('home.recentAnalyses')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/analysis')}
              className="text-yellow-600 hover:text-yellow-700"
            >
              {t('home.viewAll')}
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentAnalyses.slice(0, 2).map((analysis) => (
              <Card key={analysis.id} className="border-gray-100">
                <CardContent className="p-4">
                  <div className={cn(
                    "flex items-center space-x-3",
                    isRTL ? "space-x-reverse" : ""
                  )}>
                    <img
                      src="https://images.unsplash.com/photo-1583001931096-959e9a1a6223?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                      alt="Skin analysis"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {analysis.concerns?.join('، ') || 'تحليل البشرة'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(analysis.createdAt!).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-500 mr-2">
                          تحسن {analysis.progressScore}%
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 text-gray-400",
                      isRTL && "rotate-180"
                    )} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Product Recommendations */}
      <div className="px-6 mt-6">
        <div className={cn(
          "flex items-center justify-between mb-4",
          isRTL ? "flex-row-reverse" : ""
        )}>
          <h3 className="text-lg font-semibold text-gray-800">
            {t('home.recommendedProducts')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/products')}
            className="text-yellow-600 hover:text-yellow-700"
          >
            {t('home.store')}
          </Button>
        </div>
        
        <div className={cn(
          "flex space-x-4 overflow-x-auto pb-4",
          isRTL ? "space-x-reverse" : ""
        )}>
          {products.slice(0, 5).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="compact"
              className="fade-in"
            />
          ))}
        </div>
      </div>

      {/* Feature Buttons */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-4">
        <Button
          onClick={() => navigate('/analysis?mode=routine')}
          className="bg-deep-teal text-white p-4 rounded-xl hover:bg-opacity-90 transition-all h-auto"
        >
          <div className={cn(
            "flex items-center space-x-3",
            isRTL ? "space-x-reverse flex-row-reverse" : ""
          )}>
            <Calendar className="h-6 w-6" />
            <div className="text-right">
              <p className="font-semibold">{t('home.buildRoutine')}</p>
              <p className="text-sm opacity-90">{t('home.morningEvening')}</p>
            </div>
          </div>
        </Button>
        
        <Button
          onClick={() => navigate('/analysis?mode=progress')}
          className="bg-bronze text-white p-4 rounded-xl hover:bg-opacity-90 transition-all h-auto"
        >
          <div className={cn(
            "flex items-center space-x-3",
            isRTL ? "space-x-reverse flex-row-reverse" : ""
          )}>
            <TrendingUp className="h-6 w-6" />
            <div className="text-right">
              <p className="font-semibold">{t('home.trackProgress')}</p>
              <p className="text-sm opacity-90">{t('home.beforeAfter')}</p>
            </div>
          </div>
        </Button>
      </div>

      {/* Expert Chat Section */}
      <div className="px-6 mt-6">
        <Card className="gradient-egyptian text-white">
          <CardContent className="p-4">
            <div className={cn(
              "flex items-center justify-between",
              isRTL ? "flex-row-reverse" : ""
            )}>
              <div>
                <h3 className="font-semibold mb-1">{t('home.freeConsultation')}</h3>
                <p className="text-sm opacity-90">{t('home.askAboutProduct')}</p>
              </div>
              <Button
                onClick={() => navigate('/chat')}
                variant="secondary"
                className="bg-white bg-opacity-20 rounded-full w-12 h-12 p-0 text-white hover:bg-white/30"
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Tier Selector */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t('home.chooseBudget')}
        </h3>
        <div className="space-y-3">
          {budgetTiers.map((tier) => (
            <Button
              key={tier.key}
              variant="outline"
              onClick={() => setSelectedBudgetTier(tier.key)}
              className={cn(
                "w-full p-4 h-auto justify-between transition-all",
                selectedBudgetTier === tier.key 
                  ? "border-egyptian-gold bg-yellow-50" 
                  : "border-gray-200 hover:border-egyptian-gold"
              )}
            >
              <div className="text-left">
                <h4 className="font-medium text-gray-800">{t(tier.nameKey)}</h4>
                <p className="text-sm text-gray-500">{t(tier.rangeKey)}</p>
              </div>
              <div className={cn(
                "w-5 h-5 border-2 rounded-full",
                selectedBudgetTier === tier.key
                  ? "border-yellow-600 bg-yellow-600"
                  : "border-gray-300"
              )}>
                {selectedBudgetTier === tier.key && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Nearby Pharmacies */}
      <div className="px-6 mt-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t('home.nearbyPharmacies')}
        </h3>
        <div className="space-y-3">
          {nearbyPharmacies.slice(0, 3).map((pharmacy) => (
            <Card key={pharmacy.id} className="border-gray-100">
              <CardContent className="p-4">
                <div className={cn(
                  "flex items-center justify-between",
                  isRTL ? "flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "flex items-center space-x-3",
                    isRTL ? "space-x-reverse" : ""
                  )}>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{pharmacy.name}</h4>
                      <p className="text-sm text-gray-500">500 متر</p>
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center space-x-2",
                    isRTL ? "space-x-reverse" : ""
                  )}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePharmacyCall(pharmacy.phone || '')}
                      className="text-yellow-600 hover:text-yellow-700 p-2"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePharmacyDirections(pharmacy)}
                      className="text-teal-600 hover:text-teal-700 p-2"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsCameraOpen(true)}
        className={cn(
          "fixed w-14 h-14 bg-egyptian-gold rounded-full shadow-lg text-white hover:shadow-xl transition-all pulse-glow z-30",
          isRTL ? "bottom-20 right-6" : "bottom-20 left-6"
        )}
      >
        <Camera className="h-6 w-6" />
      </Button>

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
