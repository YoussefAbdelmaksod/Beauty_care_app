import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Check } from "lucide-react";
import { useLocation } from "wouter";

interface QuizQuestion {
  key: string;
  label: string;
  type: string;
  options?: any[];
  required?: boolean;
  maxSelect?: number;
  min?: number;
  max?: number;
}

interface QuizSection {
  id: string;
  title: string;
  subtitle?: string;
  questions: QuizQuestion[];
}

const quizData: QuizSection[] = [
  {
    "id": "demographics",
    "title": "Demographics & Basic Info",
    "questions": [
      {"key": "age", "label": "Age", "type": "number", "required": true},
      {"key": "gender", "label": "Gender", "type": "select", "options": ["Male", "Female"], "required": true},
      {"key": "country", "label": "Country of residence", "type": "text", "required": true},
      {
        "key": "skinTone",
        "label": "Choose your skin tone",
        "type": "color-picker",
        "options": [
          {"type": "I", "color": "#FDBCB4", "label": "Very Fair", "description": "Always burns, never tans"},
          {"type": "II", "color": "#F1C27D", "label": "Fair", "description": "Burns easily, tans minimally"},
          {"type": "III", "color": "#E0AC69", "label": "Light Medium", "description": "Burns moderately, tans gradually"},
          {"type": "IV", "color": "#C68642", "label": "Medium", "description": "Burns minimally, tans well"},
          {"type": "V", "color": "#8D5524", "label": "Dark Medium", "description": "Rarely burns, tans very well"},
          {"type": "VI", "color": "#654321", "label": "Dark", "description": "Never burns, deeply pigmented"}
        ],
        "required": true
      }
    ]
  },
  {
    "id": "skinType",
    "title": "Primary Skin Type",
    "subtitle": "Check what best describes your skin in a normal state without products",
    "questions": [
      {
        "key": "primarySkinType",
        "label": "Primary Skin Type",
        "type": "radio",
        "options": [
          "Oily (Shiny, greasy by midday)",
          "Dry (Flaky, tight, dull)",
          "Combination (Oily in T-zone, dry elsewhere)",
          "Normal (Balanced, rarely irritated)",
          "Sensitive (Reactive, stings, flushes easily)"
        ],
        "required": true
      }
    ]
  },
  {
    "id": "concerns",
    "title": "Top Concerns",
    "subtitle": "Select up to 3 concerns",
    "questions": [
      {
        "key": "topConcerns",
        "label": "Top Concerns",
        "type": "checkbox",
        "maxSelect": 3,
        "options": [
          "Acne / breakouts",
          "Blackheads / clogged pores",
          "Large pores",
          "Uneven tone / dullness",
          "Dark spots / hyperpigmentation",
          "Redness / rosacea",
          "Fine lines / wrinkles",
          "Sagging skin / loss of elasticity",
          "Dryness / dehydration",
          "Excess oil / shine"
        ],
        "required": true
      }
    ]
  }
];

const translations = {
  ar: {
    "Demographics & Basic Info": "المعلومات الأساسية والديموغرافية",
    "Primary Skin Type": "نوع البشرة الأساسي",
    "Top Concerns": "الاهتمامات الرئيسية",
    "Age": "العمر",
    "Gender": "الجنس",
    "Country of residence": "بلد الإقامة",
    "Choose your skin tone": "اختر لون بشرتك",
    "Primary Skin Type": "نوع البشرة الأساسي",
    "Top Concerns": "اهتماماتك الرئيسية",
    "Very Fair": "فاتح جداً",
    "Fair": "فاتح",
    "Light Medium": "متوسط فاتح",
    "Medium": "متوسط",
    "Dark Medium": "متوسط داكن",
    "Dark": "داكن",
    "Male": "ذكر",
    "Female": "أنثى",
    "Oily (Shiny, greasy by midday)": "دهنية (لامعة، دهنية في منتصف النهار)",
    "Dry (Flaky, tight, dull)": "جافة (متقشرة، مشدودة، باهتة)",
    "Combination (Oily in T-zone, dry elsewhere)": "مختلطة (دهنية في المنطقة T، جافة في أماكن أخرى)",
    "Normal (Balanced, rarely irritated)": "طبيعية (متوازنة، نادراً ما تتهيج)",
    "Sensitive (Reactive, stings, flushes easily)": "حساسة (تتفاعل، تلسع، تحمر بسهولة)",
    "Acne / breakouts": "حب الشباب / البثور",
    "Blackheads / clogged pores": "الرؤوس السوداء / المسام المسدودة",
    "Large pores": "المسام الواسعة",
    "Uneven tone / dullness": "عدم توحد اللون / البهتان",
    "Dark spots / hyperpigmentation": "البقع الداكنة / فرط التصبغ",
    "Redness / rosacea": "الاحمرار / الوردية",
    "Fine lines / wrinkles": "الخطوط الدقيقة / التجاعيد",
    "Sagging skin / loss of elasticity": "ترهل الجلد / فقدان المرونة",
    "Dryness / dehydration": "الجفاف / الجفاف",
    "Excess oil / shine": "الزيت الزائد / اللمعان",
    "Previous": "السابق",
    "Next": "التالي",
    "Complete Quiz": "إكمال الاستبيان",
    "Select up to 3 concerns": "اختر حتى 3 اهتمامات",
    "Check what best describes your skin in a normal state without products": "اختر ما يصف بشرتك بشكل أفضل في حالتها الطبيعية بدون منتجات"
  },
  en: {
    "Previous": "Previous",
    "Next": "Next",
    "Complete Quiz": "Complete Quiz"
  }
};

export default function QuizPage() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const language = localStorage.getItem("userLanguage") || "ar";
  const userId = parseInt(localStorage.getItem("userId") || "0");
  const isRTL = language === "ar";
  const t = translations[language as keyof typeof translations];

  const sections: QuizSection[] = quizData;
  const currentSection = sections[currentSectionIndex];
  const progress = ((currentSectionIndex + 1) / sections.length) * 100;

  // Load existing quiz responses
  const { data: existingResponses } = useQuery({
    queryKey: ["/api/quiz/responses", userId],
    enabled: !!userId,
  });

  useEffect(() => {
    if (existingResponses && Array.isArray(existingResponses)) {
      const responseMap: Record<string, any> = {};
      existingResponses.forEach((response: any) => {
        responseMap[response.sectionId] = response.responses;
      });
      setResponses(responseMap);
    }
  }, [existingResponses]);

  const saveResponseMutation = useMutation({
    mutationFn: async (data: { sectionId: string; responses: any }) => {
      const response = await fetch("/api/quiz/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sectionId: data.sectionId,
          responses: data.responses,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save response");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz/responses"] });
    },
  });

  const completeQuizMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to complete quiz");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: language === "ar" ? "تم إكمال الاستبيان بنجاح" : "Quiz completed successfully",
        description: language === "ar" ? "سنقوم بإنشاء توصيات مخصصة لك" : "We'll create personalized recommendations for you",
      });
      setLocation("/");
    },
  });

  const handleInputChange = (questionKey: string, value: any) => {
    const currentResponses = responses[currentSection.id] || {};
    const updatedResponses = {
      ...currentResponses,
      [questionKey]: value,
    };
    
    setResponses(prev => ({
      ...prev,
      [currentSection.id]: updatedResponses,
    }));
  };

  const translateText = (text: string) => {
    if (language === "ar") {
      return t[text as keyof typeof t] || text;
    }
    return text;
  };

  const handleNext = () => {
    // Save current section responses
    if (responses[currentSection.id]) {
      saveResponseMutation.mutate({
        sectionId: currentSection.id,
        responses: responses[currentSection.id],
      });
    }

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      // Complete quiz
      completeQuizMutation.mutate();
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const isCurrentSectionValid = () => {
    const currentResponses = responses[currentSection.id] || {};
    const requiredQuestions = currentSection.questions.filter(q => q.required);
    
    return requiredQuestions.every(question => {
      const value = currentResponses[question.key];
      if (question.type === "checkbox") {
        return Array.isArray(value) && value.length > 0;
      }
      return value !== undefined && value !== "" && value !== null;
    });
  };

  const renderQuestion = (question: QuizQuestion) => {
    const currentResponses = responses[currentSection.id] || {};
    const value = currentResponses[question.key];

    switch (question.type) {
      case "text":
      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={question.key} className="text-sm font-medium">
              {translateText(question.label)}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={question.key}
              type={question.type}
              value={value || ""}
              onChange={(e) => handleInputChange(question.key, e.target.value)}
              min={question.min}
              max={question.max}
              className="w-full"
            />
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {translateText(question.label)}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value || ""}
              onValueChange={(newValue) => handleInputChange(question.key, newValue)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={language === "ar" ? "اختر..." : "Select..."} />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {translateText(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "radio":
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {translateText(question.label)}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value || ""}
              onValueChange={(newValue) => handleInputChange(question.key, newValue)}
              className="space-y-2"
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                  <RadioGroupItem value={option} id={`${question.key}-${index}`} />
                  <Label htmlFor={`${question.key}-${index}`} className="flex-1 text-sm cursor-pointer">
                    {translateText(option)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "checkbox":
        const selectedValues = value || [];
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {translateText(question.label)}
              {question.required && <span className="text-red-500 ml-1">*</span>}
              {question.maxSelect && (
                <span className="text-gray-500 text-xs ml-2">
                  ({selectedValues.length}/{question.maxSelect})
                </span>
              )}
            </Label>
            <div className="space-y-2">
              {question.options?.map((option, index) => {
                const isSelected = selectedValues.includes(option);
                const isDisabled = question.maxSelect && selectedValues.length >= question.maxSelect && !isSelected;
                
                return (
                  <div key={index} className={`flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 ${isDisabled ? 'opacity-50' : ''}`}>
                    <Checkbox
                      id={`${question.key}-${index}`}
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={(checked) => {
                        const newValues = checked
                          ? [...selectedValues, option]
                          : selectedValues.filter((v: string) => v !== option);
                        handleInputChange(question.key, newValues);
                      }}
                    />
                    <Label 
                      htmlFor={`${question.key}-${index}`} 
                      className={`flex-1 text-sm cursor-pointer ${isDisabled ? 'cursor-not-allowed' : ''}`}
                    >
                      {translateText(option)}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "color-picker":
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {translateText(question.label)}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {question.options?.map((option: any, index: number) => {
                const isSelected = value === option.type;
                return (
                  <div
                    key={index}
                    onClick={() => handleInputChange(question.key, option.type)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: option.color }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{translateText(option.label)}</h4>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-blue-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={question.key} className="text-sm font-medium">
              {translateText(question.label)}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={question.key}
              value={value || ""}
              onChange={(e) => handleInputChange(question.key, e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentSection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 pt-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">
              {language === "ar" ? "استبيان العناية بالبشرة" : "Skin Care Quiz"}
            </h1>
            <p className="text-sm text-blue-100">
              {language === "ar" ? "اكتشف روتين العناية المثالي لك" : "Discover your perfect routine"}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{language === "ar" ? `الخطوة ${currentSectionIndex + 1} من ${sections.length}` : `Step ${currentSectionIndex + 1} of ${sections.length}`}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-blue-500/30" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">
              {translateText(currentSection.title)}
            </CardTitle>
            {currentSection.subtitle && (
              <CardDescription className="text-gray-600">
                {translateText(currentSection.subtitle)}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentSection.questions.map((question, index) => (
              <div key={index}>
                {renderQuestion(question)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {language === "ar" ? "السابق" : "Previous"}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isCurrentSectionValid() || saveResponseMutation.isPending || completeQuizMutation.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {saveResponseMutation.isPending || completeQuizMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : currentSectionIndex === sections.length - 1 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {language === "ar" ? "إكمال الاستبيان" : "Complete Quiz"}
              </>
            ) : (
              <>
                {language === "ar" ? "التالي" : "Next"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}