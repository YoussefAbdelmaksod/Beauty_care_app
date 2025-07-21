import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CameraModal } from "@/components/camera-modal";
import { AnalysisResult } from "@/components/analysis-result";
import { useTranslation } from "@/lib/i18n";
import { analysisApi, routinesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, FileText, Loader2, ArrowLeft, 
  Upload, MessageSquare, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Analysis() {
  const { t, isRTL } = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<'photo' | 'text' | 'routine' | 'progress'>('photo');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [textConcerns, setTextConcerns] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Get mode from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode') as typeof mode;
    const resultId = urlParams.get('result');
    
    if (urlMode) {
      setMode(urlMode);
    }
    
    if (resultId) {
      // Load specific analysis result
      analysisApi.getUserAnalyses(1).then(analyses => {
        const result = analyses.find(a => a.id === parseInt(resultId));
        if (result) {
          setAnalysisResult(result);
        }
      });
    }
  }, []);

  // Fetch user's analysis history
  const { data: analysisHistory = [] } = useQuery({
    queryKey: ['/api/analysis', 1],
    staleTime: 2 * 60 * 1000,
  });

  // Image analysis mutation
  const imageAnalysisMutation = useMutation({
    mutationFn: analysisApi.analyzeImage,
    onSuccess: (data) => {
      setAnalysisResult(data);
      setIsAnalyzing(false);
      toast({
        title: t('analysis.results'),
        description: "تم تحليل البشرة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/analysis', 1] });
    },
    onError: (error: any) => {
      setIsAnalyzing(false);
      toast({
        title: t('common.error'),
        description: error.message || "فشل في تحليل الصورة",
        variant: "destructive",
      });
    }
  });

  // Text analysis mutation
  const textAnalysisMutation = useMutation({
    mutationFn: analysisApi.analyzeText,
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: t('analysis.results'),
        description: "تم تحليل الوصف بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/analysis', 1] });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || "فشل في التحليل",
        variant: "destructive",
      });
    }
  });

  // Routine generation mutation
  const routineGenerationMutation = useMutation({
    mutationFn: routinesApi.generateRoutine,
    onSuccess: (data) => {
      toast({
        title: "تم إنشاء الروتين",
        description: "تم إنشاء روتين مخصص لبشرتك بنجاح",
      });
      // Navigate to routine result or show inline
      console.log('Generated routine:', data);
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || "فشل في إنشاء الروتين",
        variant: "destructive",
      });
    }
  });

  const skinTypes = [
    { key: 'dry', label: 'بشرة جافة' },
    { key: 'oily', label: 'بشرة دهنية' },
    { key: 'combination', label: 'بشرة مختلطة' },
    { key: 'sensitive', label: 'بشرة حساسة' },
    { key: 'normal', label: 'بشرة عادية' }
  ];

  const handleCameraCapture = async (imageData: string) => {
    setIsAnalyzing(true);
    imageAnalysisMutation.mutate({
      imageData,
      userId: 1
    });
  };

  const handleTextSubmit = () => {
    if (!textConcerns.trim()) {
      toast({
        title: t('common.error'),
        description: "يرجى وصف مشاكل بشرتك",
        variant: "destructive",
      });
      return;
    }

    textAnalysisMutation.mutate({
      description: textConcerns,
      skinType: selectedSkinType || undefined,
      userId: 1
    });
  };

  const handleRoutineGeneration = () => {
    if (!selectedSkinType) {
      toast({
        title: t('common.error'),
        description: "يرجى اختيار نوع بشرتك",
        variant: "destructive",
      });
      return;
    }

    const concerns = textConcerns.split(',').map(c => c.trim()).filter(Boolean);
    
    routineGenerationMutation.mutate({
      skinType: selectedSkinType,
      concerns,
      budgetTier: 'basic', // Could be dynamic based on user preference
      userId: 1
    });
  };

  const handleSaveRoutine = () => {
    toast({
      title: "تم حفظ التوصيات",
      description: "تم حفظ التوصيات في روتينك الشخصي",
    });
  };

  const handleShareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: 'نتائج تحليل البشرة',
        text: 'شاهد نتائج تحليل بشرتي من Beauty Care',
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "تم النسخ",
          description: "تم نسخ الرابط إلى الحافظة",
        });
      });
    }
  };

  const renderModeContent = () => {
    switch (mode) {
      case 'photo':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Camera className="h-5 w-5 egyptian-gold" />
                  <span>{t('analysis.skinAnalysis')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-egyptian-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="h-12 w-12 egyptian-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">التقط صورة لوجهك</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      احرصي على الإضاءة الجيدة وأن يكون وجهك واضحاً في الصورة
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsCameraOpen(true)}
                    className="bg-egyptian-gold hover:bg-egyptian-gold/90 text-white"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('analysis.analyzing')}
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        {t('analysis.takePhoto')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <FileText className="h-5 w-5 deep-teal" />
                  <span>وصف مشاكل البشرة</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="skinType">نوع بشرتك</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {skinTypes.map((type) => (
                      <Button
                        key={type.key}
                        variant={selectedSkinType === type.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSkinType(type.key)}
                        className={selectedSkinType === type.key ? "bg-egyptian-gold hover:bg-egyptian-gold/90" : ""}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="concerns">صفي مشاكل بشرتك</Label>
                  <Textarea
                    id="concerns"
                    placeholder="مثال: لدي حبوب في منطقة الجبهة، بشرتي دهنية، أعاني من المسام الواسعة..."
                    value={textConcerns}
                    onChange={(e) => setTextConcerns(e.target.value)}
                    className="mt-2 min-h-[120px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    كوني مفصلة قدر الإمكان لنحصل على أفضل توصيات
                  </p>
                </div>

                <Button
                  onClick={handleTextSubmit}
                  disabled={textAnalysisMutation.isPending || !textConcerns.trim()}
                  className="w-full bg-deep-teal hover:bg-deep-teal/90 text-white"
                >
                  {textAnalysisMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('analysis.analyzing')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      تحليل الوصف
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'routine':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>بناء روتين مخصص</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="routineSkinType">نوع بشرتك</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {skinTypes.map((type) => (
                      <Button
                        key={type.key}
                        variant={selectedSkinType === type.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSkinType(type.key)}
                        className={selectedSkinType === type.key ? "bg-egyptian-gold hover:bg-egyptian-gold/90" : ""}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="routineConcerns">المشاكل المراد علاجها</Label>
                  <Textarea
                    id="routineConcerns"
                    placeholder="مثال: حبوب، تصبغات، جفاف، علامات تقدم السن..."
                    value={textConcerns}
                    onChange={(e) => setTextConcerns(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleRoutineGeneration}
                  disabled={routineGenerationMutation.isPending || !selectedSkinType}
                  className="w-full bg-egyptian-gold hover:bg-egyptian-gold/90 text-white"
                >
                  {routineGenerationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      إنشاء الروتين...
                    </>
                  ) : (
                    'إنشاء روتين مخصص'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تتبع تقدم البشرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-bronze bg-opacity-10 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-12 w-12 bronze" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">ارفعي صورة حديثة</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      لنقارن تقدم بشرتك مع التحليلات السابقة
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsCameraOpen(true)}
                    className="bg-bronze hover:bg-bronze/90 text-white"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    التقط صورة للمقارنة
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Previous analyses for comparison */}
            {analysisHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>التحليلات السابقة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisHistory.slice(0, 3).map((analysis) => (
                      <div key={analysis.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {analysis.concerns?.join('، ') || 'تحليل البشرة'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(analysis.createdAt!).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {analysis.progressScore}% تحسن
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-warm-white pb-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className={cn(
              "flex items-center space-x-2",
              isRTL ? "space-x-reverse" : ""
            )}
          >
            <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
            <span>الرئيسية</span>
          </Button>
          <h1 className="text-xl font-semibold">{t('analysis.skinAnalysis')}</h1>
          <div className="w-16" /> {/* Spacer for alignment */}
        </div>

        {/* Mode Tabs */}
        <div className="px-6 pb-4">
          <div className="flex space-x-2 space-x-reverse bg-gray-100 rounded-lg p-1">
            <Button
              variant={mode === 'photo' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('photo')}
              className={mode === 'photo' ? 'bg-egyptian-gold hover:bg-egyptian-gold/90' : ''}
            >
              <Camera className="h-4 w-4 mr-1" />
              صورة
            </Button>
            <Button
              variant={mode === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('text')}
              className={mode === 'text' ? 'bg-egyptian-gold hover:bg-egyptian-gold/90' : ''}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              وصف
            </Button>
            <Button
              variant={mode === 'routine' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('routine')}
              className={mode === 'routine' ? 'bg-egyptian-gold hover:bg-egyptian-gold/90' : ''}
            >
              روتين
            </Button>
            <Button
              variant={mode === 'progress' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('progress')}
              className={mode === 'progress' ? 'bg-egyptian-gold hover:bg-egyptian-gold/90' : ''}
            >
              تقدم
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Show analysis result if available */}
        {analysisResult ? (
          <AnalysisResult
            analysis={analysisResult.analysis}
            recommendations={analysisResult.recommendations}
            onSaveRoutine={handleSaveRoutine}
            onShareResult={handleShareResult}
            className="mb-6"
          />
        ) : (
          renderModeContent()
        )}

        {/* Recent analyses section when not showing a specific result */}
        {!analysisResult && analysisHistory.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>التحليلات السابقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisHistory.slice(0, 5).map((analysis) => (
                  <Button
                    key={analysis.id}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => setAnalysisResult({ analysis, recommendations: [] })}
                  >
                    <div className="text-left">
                      <p className="font-medium">
                        {analysis.concerns?.join('، ') || 'تحليل البشرة'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(analysis.createdAt!).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
