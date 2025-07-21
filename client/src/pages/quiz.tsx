import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart, Sparkles, Flower2, Crown, Star, 
  ArrowRight, ArrowLeft, CheckCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface QuizQuestion {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
    icon: any;
    value: number;
    skinType: string[];
  }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How does your skin feel in the morning?",
    options: [
      {
        id: "tight",
        text: "Tight and dry",
        icon: Crown,
        value: 1,
        skinType: ["dry"]
      },
      {
        id: "smooth",
        text: "Smooth and comfortable",
        icon: Heart,
        value: 2,
        skinType: ["normal"]
      },
      {
        id: "oily",
        text: "Oily, especially T-zone",
        icon: Sparkles,
        value: 3,
        skinType: ["combination", "oily"]
      },
      {
        id: "very-oily",
        text: "Very oily all over",
        icon: Flower2,
        value: 4,
        skinType: ["oily"]
      }
    ]
  },
  {
    id: 2,
    question: "How often do you experience breakouts?",
    options: [
      {
        id: "never",
        text: "Rarely or never",
        icon: Star,
        value: 1,
        skinType: ["normal", "dry"]
      },
      {
        id: "occasionally",
        text: "Occasionally during hormonal changes",
        icon: Heart,
        value: 2,
        skinType: ["normal", "combination"]
      },
      {
        id: "frequently",
        text: "Frequently in T-zone",
        icon: Sparkles,
        value: 3,
        skinType: ["combination", "oily"]
      },
      {
        id: "constantly",
        text: "Constantly, all over face",
        icon: Crown,
        value: 4,
        skinType: ["oily", "acne-prone"]
      }
    ]
  },
  {
    id: 3,
    question: "How does your skin react to new products?",
    options: [
      {
        id: "sensitive",
        text: "Gets irritated or red easily",
        icon: Heart,
        value: 1,
        skinType: ["sensitive"]
      },
      {
        id: "normal-reaction",
        text: "Usually fine, no issues",
        icon: Sparkles,
        value: 2,
        skinType: ["normal"]
      },
      {
        id: "needs-strong",
        text: "Needs stronger products to see results",
        icon: Crown,
        value: 3,
        skinType: ["oily", "combination"]
      },
      {
        id: "varies",
        text: "Depends on the area of my face",
        icon: Flower2,
        value: 4,
        skinType: ["combination"]
      }
    ]
  },
  {
    id: 4,
    question: "How do you feel about your pores?",
    options: [
      {
        id: "invisible",
        text: "Barely visible",
        icon: Star,
        value: 1,
        skinType: ["dry", "normal"]
      },
      {
        id: "small",
        text: "Small and fine",
        icon: Heart,
        value: 2,
        skinType: ["normal"]
      },
      {
        id: "visible-tzone",
        text: "Visible in T-zone only",
        icon: Sparkles,
        value: 3,
        skinType: ["combination"]
      },
      {
        id: "large",
        text: "Large and noticeable",
        icon: Crown,
        value: 4,
        skinType: ["oily"]
      }
    ]
  },
  {
    id: 5,
    question: "How does your skin look by midday?",
    options: [
      {
        id: "flaky",
        text: "Flaky or tight",
        icon: Flower2,
        value: 1,
        skinType: ["dry"]
      },
      {
        id: "fresh",
        text: "Still looks fresh",
        icon: Star,
        value: 2,
        skinType: ["normal"]
      },
      {
        id: "shiny-tzone",
        text: "Shiny in T-zone",
        icon: Sparkles,
        value: 3,
        skinType: ["combination"]
      },
      {
        id: "very-shiny",
        text: "Very shiny all over",
        icon: Crown,
        value: 4,
        skinType: ["oily"]
      }
    ]
  }
];

export default function Quiz() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submitQuizMutation = useMutation({
    mutationFn: async (quizData: any) => {
      const response = await apiRequest('POST', '/api/quiz/submit', quizData);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      setIsCompleted(true);
      toast({
        title: "🎉 Quiz Completed!",
        description: "Your skin type has been determined!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (!selectedOption) return;
    
    const newAnswers = { ...answers, [currentQuestion + 1]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption("");
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate skin type
      const skinTypeCount: Record<string, number> = {};
      const concerns: string[] = [];
      
      Object.entries(newAnswers).forEach(([questionIndex, optionId]) => {
        const question = quizQuestions[parseInt(questionIndex) - 1];
        const option = question.options.find(opt => opt.id === optionId);
        if (option) {
          option.skinType.forEach(type => {
            skinTypeCount[type] = (skinTypeCount[type] || 0) + 1;
          });
        }
      });
      
      const dominantSkinType = Object.keys(skinTypeCount).reduce((a, b) => 
        skinTypeCount[a] > skinTypeCount[b] ? a : b
      );
      
      // Submit quiz
      submitQuizMutation.mutate({
        answers: newAnswers,
        skinType: dominantSkinType,
        concerns,
        score: skinTypeCount,
        userId: 1 // Mock user ID
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion] || "");
    }
  };

  const getSkinTypeDescription = (skinType: string) => {
    const descriptions = {
      dry: {
        title: "Dry Skin Beauty 🌸",
        description: "Your skin loves hydration and gentle care! You have beautiful, delicate skin that thrives with nourishing ingredients.",
        tips: ["Use gentle, creamy cleansers", "Apply rich moisturizers", "Try hydrating serums with hyaluronic acid"]
      },
      oily: {
        title: "Radiant Oily Skin ✨",
        description: "You have vibrant, resilient skin! Your natural oils give you that gorgeous glow - we just need to balance it perfectly.",
        tips: ["Use gentle foaming cleansers", "Try oil-free moisturizers", "Use products with niacinamide"]
      },
      combination: {
        title: "Perfectly Balanced Beauty 🌺",
        description: "You have the best of both worlds! Your skin is unique and beautiful, needing different care for different areas.",
        tips: ["Use gentle cleansers", "Spot-treat different areas", "Balance hydration and oil control"]
      },
      normal: {
        title: "Lucky Natural Beauty 💖",
        description: "You're blessed with naturally balanced, gorgeous skin! Your skin is healthy and radiant.",
        tips: ["Maintain with gentle skincare", "Use light moisturizers", "Focus on prevention and protection"]
      },
      sensitive: {
        title: "Delicate Beauty 🌸",
        description: "Your skin is precious and delicate! With the right gentle care, your skin will bloom beautifully.",
        tips: ["Use fragrance-free products", "Patch test new products", "Choose gentle, minimal ingredients"]
      }
    };
    return descriptions[skinType as keyof typeof descriptions] || descriptions.normal;
  };

  if (isCompleted && result) {
    const skinTypeInfo = getSkinTypeDescription(result.skinType);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-pink via-lavender to-coral p-4">
        <div className="max-w-md mx-auto pt-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Crown className="text-rose-pink text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h1>
            <p className="text-rose-100">Discover your beautiful skin type</p>
          </div>

          {/* Result Card */}
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl mb-6">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <CheckCircle className="text-mint text-4xl" />
              </div>
              <CardTitle className="text-2xl text-gray-800 mb-2">
                {skinTypeInfo.title}
              </CardTitle>
              <p className="text-gray-600 leading-relaxed">
                {skinTypeInfo.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Sparkles className="text-rose-pink mr-2" />
                    Personalized Tips for You
                  </h3>
                  <div className="space-y-2">
                    {skinTypeInfo.tips.map((tip, index) => (
                      <div key={index} className="flex items-start">
                        <Star className="text-coral text-sm mt-1 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/products")}
              className="w-full bg-gradient-to-r from-rose-pink to-coral text-white py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Heart className="mr-2" />
              Shop Products for Your Skin
            </Button>
            
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full bg-white/90 text-gray-700 py-4 text-lg rounded-xl border-2 border-white/50 hover:bg-white transition-all duration-300"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-pink via-lavender to-coral p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="text-rose-pink text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Skin Type Quiz</h1>
          <p className="text-rose-100">Let's discover your beautiful skin type!</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-sm font-medium">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
            <span className="text-white text-sm font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-3 bg-white/30" />
        </div>

        {/* Question Card */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 text-center leading-relaxed">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {question.options.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={cn(
                      "w-full p-4 text-left rounded-xl border-2 transition-all duration-300 hover:shadow-lg",
                      selectedOption === option.id
                        ? "border-rose-pink bg-rose-pink/10 shadow-lg"
                        : "border-gray-200 bg-white hover:border-lavender"
                    )}
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                        selectedOption === option.id
                          ? "bg-rose-pink text-white"
                          : "bg-gray-100 text-gray-600"
                      )}>
                        <IconComponent className="text-lg" />
                      </div>
                      <span className={cn(
                        "font-medium",
                        selectedOption === option.id ? "text-rose-pink" : "text-gray-700"
                      )}>
                        {option.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="flex-1 bg-white/90 text-gray-700 py-4 rounded-xl border-2 border-white/50 hover:bg-white"
            >
              <ArrowLeft className="mr-2" />
              Previous
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={!selectedOption || submitQuizMutation.isPending}
            className={cn(
              "py-4 rounded-xl shadow-lg transition-all duration-300",
              currentQuestion === 0 ? "w-full" : "flex-1",
              selectedOption 
                ? "bg-gradient-to-r from-rose-pink to-coral text-white hover:shadow-xl" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            {submitQuizMutation.isPending ? (
              "Analyzing..."
            ) : currentQuestion === quizQuestions.length - 1 ? (
              <>Complete Quiz <Crown className="ml-2" /></>
            ) : (
              <>Next <ArrowRight className="ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}