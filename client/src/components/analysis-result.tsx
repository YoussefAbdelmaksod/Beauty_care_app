import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/lib/i18n";
import { Eye, TrendingUp, Calendar, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkinAnalysis, Product } from "@shared/schema";

interface AnalysisResultProps {
  analysis: SkinAnalysis;
  recommendations?: Product[];
  onSaveRoutine?: () => void;
  onShareResult?: () => void;
  className?: string;
}

export function AnalysisResult({
  analysis,
  recommendations = [],
  onSaveRoutine,
  onShareResult,
  className
}: AnalysisResultProps) {
  const { t, language } = useTranslation();
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  const geminiData = analysis.geminiAnalysis as any;
  const skinType = geminiData?.skinType || analysis.skinType || 'غير محدد';
  const concerns = analysis.concerns || [];
  const progressScore = analysis.progressScore || 0;

  const getSkinTypeColor = (type: string) => {
    const colors = {
      'dry': 'bg-blue-100 text-blue-800',
      'oily': 'bg-green-100 text-green-800',
      'combination': 'bg-purple-100 text-purple-800',
      'sensitive': 'bg-red-100 text-red-800',
      'normal': 'bg-gray-100 text-gray-800',
    };
    return colors[type.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getConcernSeverity = (concern: string) => {
    if (geminiData?.concernSeverity) {
      return geminiData.concernSeverity[concern] || 5;
    }
    return 5;
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Analysis Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Eye className="h-5 w-5 egyptian-gold" />
              <span>{t('analysis.results')}</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {formatDate(analysis.createdAt!)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t('analysis.skinType')}
              </h4>
              <Badge className={getSkinTypeColor(skinType)}>
                {skinType}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t('analysis.progress')}
              </h4>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Progress value={progressScore} className="flex-1" />
                <span className="text-sm font-medium">{progressScore}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identified Concerns */}
      {concerns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('analysis.concerns')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {concerns.map((concern, index) => {
                const severity = getConcernSeverity(concern);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{concern}</span>
                      <span className="text-xs text-gray-500">
                        {t('common.severity')}: {severity}/10
                      </span>
                    </div>
                    <Progress 
                      value={severity * 10} 
                      className="h-2"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Details */}
      {geminiData?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('analysis.recommendations')}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullAnalysis(!showFullAnalysis)}
              >
                {showFullAnalysis ? t('common.showLess') : t('common.showMore')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "space-y-2 text-sm text-gray-700",
              !showFullAnalysis && "line-clamp-3"
            )}>
              {Array.isArray(geminiData.recommendations) ? (
                <ul className="list-disc list-inside space-y-1">
                  {geminiData.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p>{geminiData.recommendations}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('home.recommendedProducts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {recommendations.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center space-x-3 space-x-reverse p-3 border border-gray-200 rounded-lg">
                  <img
                    src={product.imageUrl || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                    alt={language === 'ar' ? product.nameAr : product.nameEn}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {language === 'ar' ? product.nameAr : product.nameEn}
                    </h4>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold egyptian-gold">
                        {product.price} ج.م
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {product.effectiveness}% فعالية
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {recommendations.length > 3 && (
              <Button variant="outline" className="w-full mt-4">
                {t('common.viewMore')} ({recommendations.length - 3})
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3">
        <Button
          onClick={onSaveRoutine}
          className="bg-deep-teal text-white hover:bg-deep-teal/90 flex items-center space-x-2 space-x-reverse"
        >
          <Calendar className="h-4 w-4" />
          <span>{t('home.buildRoutine')}</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={onShareResult}
          className="flex items-center space-x-2 space-x-reverse"
        >
          <Share2 className="h-4 w-4" />
          <span>{t('common.share')}</span>
        </Button>
      </div>
    </div>
  );
}
