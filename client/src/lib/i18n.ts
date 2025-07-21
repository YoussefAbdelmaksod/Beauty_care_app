import { useState, useEffect } from 'react';

export interface Translation {
  [key: string]: string | Translation;
}

const translations: Record<string, Translation> = {
  ar: {
    app: {
      title: "Beauty Care",
      subtitle: "العناية الجمالية"
    },
    nav: {
      home: "الرئيسية",
      quiz: "اختبار البشرة",
      analysis: "تحليل",
      products: "المنتجات",
      chat: "محادثة",
      profile: "الملف"
    },
    home: {
      welcome: "مرحباً بك",
      subtitle: "دعينا نجد الروتين المثالي لبشرتك",
      quickAnalysis: "تحليل سريع",
      photoAnalysis: "تحليل بالصورة",
      photoSubtitle: "التقط صورة لوجهك",
      textAnalysis: "وصف المشاكل",
      textSubtitle: "اكتب ما تواجهينه",
      recentAnalyses: "آخر التحليلات",
      viewAll: "عرض الكل",
      recommendedProducts: "منتجات مُوصى بها",
      store: "المتجر",
      buildRoutine: "بناء الروتين",
      morningEvening: "صباحي ومسائي",
      trackProgress: "تتبع التقدم",
      beforeAfter: "قبل وبعد",
      freeConsultation: "استشارة مجانية",
      askAboutProduct: "اسألي عن أي منتج أو مكون",
      chooseBudget: "اختاري ميزانيتك",
      nearbyPharmacies: "الصيدليات القريبة"
    },
    analysis: {
      skinAnalysis: "تحليل البشرة",
      uploadPhoto: "ارفع صورة",
      takePhoto: "التقط صورة",
      orDescribe: "أو صفي مشاكل بشرتك",
      analyzing: "جاري التحليل...",
      results: "نتائج التحليل",
      skinType: "نوع البشرة",
      concerns: "المشاكل",
      recommendations: "التوصيات",
      progress: "التقدم"
    },
    products: {
      searchProducts: "البحث في المنتجات",
      category: "الفئة",
      brand: "الماركة",
      price: "السعر",
      ingredients: "المكونات",
      suitableFor: "مناسب لـ",
      addToCart: "أضف للسلة",
      compare: "قارن",
      details: "التفاصيل"
    },
    chat: {
      beautyConsultation: "استشارة تجميل",
      typeMessage: "اكتبي سؤالك هنا...",
      askAbout: "اسألي عن",
      productComparison: "مقارنة المنتجات",
      routineHelp: "مساعدة في الروتين",
      ingredientInfo: "معلومات المكونات"
    },
    budget: {
      basic: "الميزانية الأساسية",
      basicRange: "٥٠٠ - ١٠٠٠ ج.م شهرياً",
      premium: "الميزانية المتوسطة",
      premiumRange: "١٠٠٠ - ٢٠٠٠ ج.م شهرياً",
      luxury: "الميزانية العالية",
      luxuryRange: "٢٠٠٠+ ج.م شهرياً"
    },
    common: {
      loading: "جاري التحميل...",
      error: "حدث خطأ",
      retry: "حاول مرة أخرى",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      close: "إغلاق",
      next: "التالي",
      previous: "السابق",
      submit: "إرسال"
    }
  },
  en: {
    app: {
      title: "Beauty Care",
      subtitle: "Egyptian Skincare"
    },
    nav: {
      home: "Home",
      quiz: "Skin Quiz",
      analysis: "Analysis",
      products: "Products",
      chat: "Chat",
      profile: "Profile"
    },
    home: {
      welcome: "Welcome",
      subtitle: "Let's find the perfect routine for your skin",
      quickAnalysis: "Quick Analysis",
      photoAnalysis: "Photo Analysis",
      photoSubtitle: "Take a photo of your face",
      textAnalysis: "Describe Issues",
      textSubtitle: "Write what you're experiencing",
      recentAnalyses: "Recent Analyses",
      viewAll: "View All",
      recommendedProducts: "Recommended Products",
      store: "Store",
      buildRoutine: "Build Routine",
      morningEvening: "Morning & Evening",
      trackProgress: "Track Progress",
      beforeAfter: "Before & After",
      freeConsultation: "Free Consultation",
      askAboutProduct: "Ask about any product or ingredient",
      chooseBudget: "Choose Your Budget",
      nearbyPharmacies: "Nearby Pharmacies"
    },
    analysis: {
      skinAnalysis: "Skin Analysis",
      uploadPhoto: "Upload Photo",
      takePhoto: "Take Photo",
      orDescribe: "Or describe your skin issues",
      analyzing: "Analyzing...",
      results: "Analysis Results",
      skinType: "Skin Type",
      concerns: "Concerns",
      recommendations: "Recommendations",
      progress: "Progress"
    },
    products: {
      searchProducts: "Search Products",
      category: "Category",
      brand: "Brand",
      price: "Price",
      ingredients: "Ingredients",
      suitableFor: "Suitable For",
      addToCart: "Add to Cart",
      compare: "Compare",
      details: "Details"
    },
    chat: {
      beautyConsultation: "Beauty Consultation",
      typeMessage: "Type your question here...",
      askAbout: "Ask about",
      productComparison: "Product Comparison",
      routineHelp: "Routine Help",
      ingredientInfo: "Ingredient Information"
    },
    budget: {
      basic: "Basic Budget",
      basicRange: "500 - 1000 EGP monthly",
      premium: "Premium Budget",
      premiumRange: "1000 - 2000 EGP monthly",
      luxury: "Luxury Budget",
      luxuryRange: "2000+ EGP monthly"
    },
    common: {
      loading: "Loading...",
      error: "An error occurred",
      retry: "Try again",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      next: "Next",
      previous: "Previous",
      submit: "Submit"
    }
  }
};

export function useTranslation() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'ar' | 'en' | null;
    if (savedLanguage && savedLanguage !== language) {
      setLanguage(savedLanguage);
      setDir(savedLanguage === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', savedLanguage);
    }
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return typeof value === 'string' ? value : key;
  };

  const changeLanguage = (newLanguage: 'ar' | 'en') => {
    setLanguage(newLanguage);
    setDir(newLanguage === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('language', newLanguage);
    document.documentElement.setAttribute('dir', newLanguage === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLanguage);
  };

  return {
    t,
    language,
    dir,
    changeLanguage,
    isRTL: language === 'ar'
  };
}
