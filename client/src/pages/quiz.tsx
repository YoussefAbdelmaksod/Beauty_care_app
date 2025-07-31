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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

// Import quiz data - we'll embed it directly for now
const quizData = [
  {"id": "demographics", "title": "Demographics & Basic Info", "questions": [{"key": "age", "label": "Age", "type": "number", "required": true}, {"key": "gender", "label": "Gender", "type": "select", "options": ["Male", "Female"], "required": true}, {"key": "country", "label": "Country of residence", "type": "text", "required": true}, {"key": "skinTone", "label": "Choose your skin tone", "type": "color-picker", "required": true}]},
  {"id": "skinType", "title": "Primary Skin Type", "subtitle": "Check what best describes your skin in a normal state without products", "questions": [{"key": "primarySkinType", "label": "Primary Skin Type", "type": "radio", "options": ["Oily (Shiny, greasy by midday)", "Dry (Flaky, tight, dull)", "Combination (Oily in T-zone, dry elsewhere)", "Normal (Balanced, rarely irritated)", "Sensitive (Reactive, stings, flushes easily)"], "required": true}]},
  {"id": "concerns", "title": "Top Concerns", "subtitle": "Select up to 3 concerns", "questions": [{"key": "topConcerns", "label": "Top Concerns", "type": "checkbox", "maxSelect": 3, "options": ["Acne / breakouts", "Blackheads / clogged pores", "Large pores", "Uneven tone / dullness", "Dark spots / hyperpigmentation", "Redness / rosacea", "Fine lines / wrinkles", "Sagging skin / loss of elasticity", "Dryness / dehydration", "Excess oil / shine"], "required": true}]},
  {"id": "preferences", "title": "Product Preferences & Budget", "questions": [{"key": "budget", "label": "Budget per product", "type": "radio", "options": ["<500", "500-1000", "1000–$2000", "2000+"], "required": true}, {"key": "origin", "label": "Preferred product origin", "type": "radio", "options": ["Korean", "Western", "Local/Drugstore", "Natural / Organic"]}]}
];

const skinToneColors = [
  { type: "I", color: "#FDBCB4", label: "Very Fair", labelAr: "فاتح جداً", description: "Always burns, never tans", descriptionAr: "يحترق دائماً، لا يسمر أبداً" },
  { type: "II", color: "#F1C27D", label: "Fair", labelAr: "فاتح", description: "Burns easily, tans minimally", descriptionAr: "يحترق بسهولة، يسمر قليلاً" },
  { type: "III", color: "#E0AC69", label: "Light Medium", labelAr: "متوسط فاتح", description: "Burns moderately, tans gradually", descriptionAr: "يحترق متوسط، يسمر تدريجياً" },
  { type: "IV", color: "#C68642", label: "Medium", labelAr: "متوسط", description: "Burns minimally, tans well", descriptionAr: "يحترق قليلاً، يسمر جيداً" },
  { type: "V", color: "#8D5524", label: "Dark Medium", labelAr: "متوسط غامق", description: "Rarely burns, tans very well", descriptionAr: "نادراً ما يحترق، يسمر جيداً جداً" },
  { type: "VI", color: "#654321", label: "Dark", labelAr: "غامق", description: "Never burns, deeply pigmented", descriptionAr: "لا يحترق أبداً، مصطبغ بعمق" }
];

const translations = {
  ar: {
    demographics: "المعلومات الأساسية والديموغرافية",
    age: "العمر",
    gender: "النوع",
    male: "ذكر",
    female: "أنثى",
    country: "بلد الإقامة",
    skinTone: "اختاري لون بشرتك",
    skinType: "نوع البشرة الأساسي",
    primarySkinType: "نوع البشرة الأساسي",
    subtitle1: "اختاري ما يصف بشرتك بشكل طبيعي بدون منتجات",
    concerns: "الاهتمامات الرئيسية",
    subtitle2: "اختاري حتى 3 اهتمامات",
    topConcerns: "الاهتمامات الرئيسية",
    preferences: "تفضيلات المنتجات والميزانية",
    next: "التالي",
    previous: "السابق",
    submit: "إرسال",
    required: "مطلوب",
    optional: "اختياري"
  },
  en: {
    demographics: "Demographics & Basic Info",
    age: "Age",
    gender: "Gender",
    male: "Male", 
    female: "Female",
    country: "Country of residence",
    skinTone: "Choose your skin tone",
    skinType: "Primary Skin Type",
    primarySkinType: "Primary Skin Type",
    subtitle1: "Check what best describes your skin in a normal state without products",
    concerns: "Top Concerns",
    subtitle2: "Select up to 3 concerns",
    topConcerns: "Top Concerns",
    preferences: "Product Preferences & Budget",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    required: "Required",
    optional: "Optional"
  }
};

interface QuizSection {
  id: string;
  title: string;
  subtitle?: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  maxSelect?: number;
  min?: number;
  max?: number;
}

export default function QuizPage() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const language = localStorage.getItem("userLanguage") || "ar";
  const userId = parseInt(localStorage.getItem("userId") || "0");
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
      setLocation("/recommendations");
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

  const renderQuestion = (question: QuizQuestion) => {
    const currentValue = responses[currentSection.id]?.[question.key];
    const questionLabel = language === "ar" ? getArabicTranslation(question.label) : question.label;

    switch (question.type) {
      case "number":
        return (
          <div key={question.key} className="space-y-2">
            <Label className="text-sm font-medium">
              {questionLabel} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="number"
              value={currentValue || ""}
              onChange={(e) => handleInputChange(question.key, parseInt(e.target.value) || 0)}
              min={question.min}
              max={question.max}
              className="text-right"
            />
          </div>
        );

      case "text":
        return (
          <div key={question.key} className="space-y-2">
            <Label className="text-sm font-medium">
              {questionLabel} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              value={currentValue || ""}
              onChange={(e) => handleInputChange(question.key, e.target.value)}
              className="text-right"
            />
          </div>
        );

      case "textarea":
        return (
          <div key={question.key} className="space-y-2">
            <Label className="text-sm font-medium">
              {questionLabel} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              value={currentValue || ""}
              onChange={(e) => handleInputChange(question.key, e.target.value)}
              className="text-right min-h-[100px]"
            />
          </div>
        );

      case "select":
        return (
          <div key={question.key} className="space-y-2">
            <Label className="text-sm font-medium">
              {questionLabel} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={currentValue || ""}
              onValueChange={(value) => handleInputChange(question.key, value)}
            >
              <SelectTrigger className="text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {language === "ar" ? getArabicTranslation(option) : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "radio":
        return (
          <div key={question.key} className="space-y-3">
            <Label className="text-sm font-medium">
              {questionLabel} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={currentValue || ""}
              onValueChange={(value) => handleInputChange(question.key, value)}
              className="space-y-2"
            >
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value={option} id={`${question.key}-${option}`} />
                  <Label htmlFor={`${question.key}-${option}`} className="text-sm cursor-pointer">
                    {language === "ar" ? getArabicTranslation(option) : option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "checkbox":
        const selectedItems = currentValue || [];
        return (
          <div key={question.key} className="space-y-3">
            <Label className="text-sm font-medium">
              {questionLabel} {question.required && <span className="text-red-500">*</span>}
              {question.maxSelect && (
                <span className="text-xs text-gray-500 mr-2">
                  ({language === "ar" ? `حد أقصى ${question.maxSelect}` : `Max ${question.maxSelect}`})
                </span>
              )}
            </Label>
            <div className="space-y-2">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`${question.key}-${option}`}
                    checked={selectedItems.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        if (!question.maxSelect || selectedItems.length < question.maxSelect) {
                          handleInputChange(question.key, [...selectedItems, option]);
                        }
                      } else {
                        handleInputChange(question.key, selectedItems.filter((item: any) => item !== option));
                      }
                    }}
                    disabled={question.maxSelect && !selectedItems.includes(option) && selectedItems.length >= question.maxSelect}
                  />
                  <Label htmlFor={`${question.key}-${option}`} className="text-sm cursor-pointer">
                    {language === "ar" ? getArabicTranslation(option) : option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case "color-picker":
        return (
          <div key={question.key} className="space-y-3">
            <Label className="text-sm font-medium">
              {questionLabel} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {skinToneColors.map((tone) => (
                <div
                  key={tone.type}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    currentValue === tone.type
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleInputChange(question.key, tone.type)}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: tone.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {language === "ar" ? tone.labelAr : tone.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {language === "ar" ? tone.descriptionAr : tone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getArabicTranslation = (text: string): string => {
    const arabicTranslations: Record<string, string> = {
      "Male": "ذكر",
      "Female": "أنثى",
      "Oily (Shiny, greasy by midday)": "دهنية (لامعة ومدهنة بحلول منتصف النهار)",
      "Dry (Flaky, tight, dull)": "جافة (متقشرة، مشدودة، باهتة)",
      "Combination (Oily in T-zone, dry elsewhere)": "مختلطة (دهنية في المنطقة T، جافة في أماكن أخرى)",
      "Normal (Balanced, rarely irritated)": "طبيعية (متوازنة، نادراً ما تتهيج)",
      "Sensitive (Reactive, stings, flushes easily)": "حساسة (تتفاعل، تلسع، تحمر بسهولة)",
      "Acne / breakouts": "حب الشباب / البثور",
      "Blackheads / clogged pores": "الرؤوس السوداء / المسام المسدودة",
      "Large pores": "المسام الواسعة",
      "Uneven tone / dullness": "لون غير متجانس / بهتان",
      "Dark spots / hyperpigmentation": "البقع الداكنة / فرط التصبغ",
      "Redness / rosacea": "الاحمرار / الوردية",
      "Fine lines / wrinkles": "الخطوط الدقيقة / التجاعيد",
      "Sagging skin / loss of elasticity": "ترهل الجلد / فقدان المرونة",
      "Dryness / dehydration": "الجفاف / الجفاف",
      "Excess oil / shine": "الزيت الزائد / اللمعان",
      "<500": "أقل من 500",
      "500-1000": "500-1000",
      "1000–$2000": "1000-2000",
      "2000+": "أكثر من 2000",
      "Korean": "كوري",
      "Western": "غربي",
      "Local/Drugstore": "محلي/صيدلية",
      "Natural / Organic": "طبيعي / عضوي"
    };
    
    return arabicTranslations[text] || text;
  };

  const isCurrentSectionValid = () => {
    const currentResponses = responses[currentSection.id] || {};
    const requiredQuestions = currentSection.questions.filter(q => q.required);
    
    return requiredQuestions.every(question => {
      const value = currentResponses[question.key];
      return value !== undefined && value !== null && value !== "";
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {language === "ar" ? "استبيان العناية بالبشرة" : "Skincare Quiz"}
            </h1>
            <span className="text-sm text-gray-500">
              {currentSectionIndex + 1} / {sections.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">
              {language === "ar" ? t[currentSection.id as keyof typeof t] || currentSection.title : currentSection.title}
            </CardTitle>
            {currentSection.subtitle && (
              <CardDescription>
                {language === "ar" ? getArabicTranslation(currentSection.subtitle) : currentSection.subtitle}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentSection.questions.map(renderQuestion)}
            
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSectionIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                {t.previous}
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!isCurrentSectionValid() || saveResponseMutation.isPending || completeQuizMutation.isPending}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
              >
                {saveResponseMutation.isPending || completeQuizMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentSectionIndex === sections.length - 1 ? (
                  t.submit
                ) : (
                  <>
                    {t.next}
                    <ChevronLeft className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}