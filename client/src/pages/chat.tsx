import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/lib/i18n";
import { chatApi, productsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, ArrowLeft, MessageCircle, Bot, User, 
  Sparkles, Package, Scale, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import type { ChatMessage } from "@shared/schema";

interface ChatBubbleProps {
  message: ChatMessage;
  isUser: boolean;
  className?: string;
}

function ChatBubble({ message, isUser, className }: ChatBubbleProps) {
  const { isRTL } = useTranslation();
  
  return (
    <div className={cn(
      "flex items-start space-x-3 mb-4",
      isUser ? "justify-end" : "justify-start",
      isRTL ? "space-x-reverse" : "",
      className
    )}>
      {!isUser && (
        <div className="w-8 h-8 bg-egyptian-gold rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
          <Bot className="w-4 h-4" />
        </div>
      )}
      
      <div className={cn(
        "max-w-xs mx-2 px-4 py-3 rounded-2xl",
        isUser 
          ? "bg-egyptian-gold text-white ml-auto" 
          : "bg-gray-100 text-gray-800 mr-auto"
      )}>
        <p className="text-sm whitespace-pre-wrap">
          {isUser ? message.message : message.response}
        </p>
        <div className="text-xs opacity-75 mt-2">
          {new Date(message.createdAt!).toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-deep-teal rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

export default function Chat() {
  const { t, isRTL } = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch chat history
  const { data: chatHistory = [], isLoading } = useQuery({
    queryKey: ['/api/chat', 1],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      setCurrentMessage('');
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ['/api/chat', 1] });
      
      // Scroll to bottom after new message
      setTimeout(() => scrollToBottom(), 100);
    },
    onError: (error: any) => {
      setIsTyping(false);
      toast({
        title: t('common.error'),
        description: error.message || "فشل في إرسال الرسالة",
        variant: "destructive",
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      message: currentMessage,
      userId: 1,
      context: { timestamp: new Date().toISOString() }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    {
      icon: Package,
      label: "توصية منتجات",
      message: "أريد توصيات لمنتجات مناسبة لبشرتي",
      color: "bg-egyptian-gold"
    },
    {
      icon: Scale,
      label: "مقارنة منتجات",
      message: "أريد مقارنة بين منتجين",
      color: "bg-deep-teal"
    },
    {
      icon: Sparkles,
      label: "نصائح للعناية",
      message: "ما هي أفضل النصائح للعناية بالبشرة؟",
      color: "bg-bronze"
    },
    {
      icon: HelpCircle,
      label: "سؤال عام",
      message: "لدي سؤال عن مكون معين",
      color: "bg-purple-500"
    }
  ];

  const handleQuickAction = (message: string) => {
    setCurrentMessage(message);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-warm-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
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
        <div className="text-center">
          <h1 className="text-xl font-semibold">{t('chat.beautyConsultation')}</h1>
          <p className="text-sm text-gray-500">خبير العناية بالبشرة</p>
        </div>
        <div className="w-16" />
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 space-x-reverse">
                <div className="skeleton w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-12 w-3/4 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-egyptian-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-10 w-10 egyptian-gold" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              مرحباً! كيف يمكنني مساعدتك؟
            </h3>
            <p className="text-gray-600 mb-6">
              أنا هنا لمساعدتك في العناية ببشرتك وإرشادك لأفضل المنتجات
            </p>
            
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "h-auto p-3 flex flex-col items-center space-y-2 hover:shadow-md transition-all",
                    "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => handleQuickAction(action.message)}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white",
                    action.color
                  )}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-center">
                    {action.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {chatHistory.map((message) => (
              <div key={message.id}>
                <ChatBubble message={message} isUser={true} />
                {message.response && (
                  <ChatBubble 
                    message={{...message, message: message.response}} 
                    isUser={false} 
                  />
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className={cn(
                "flex items-start space-x-3 mb-4",
                isRTL ? "space-x-reverse" : ""
              )}>
                <div className="w-8 h-8 bg-egyptian-gold rounded-full flex items-center justify-center text-white text-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className={cn(
          "flex items-center space-x-2",
          isRTL ? "space-x-reverse" : ""
        )}>
          <Input
            ref={inputRef}
            placeholder={t('chat.typeMessage')}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || sendMessageMutation.isPending}
            className="w-10 h-10 bg-egyptian-gold hover:bg-egyptian-gold/90 rounded-full p-0 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Suggestions */}
        {chatHistory.length > 0 && !currentMessage && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("هل يمكنك توضيح المكونات الفعالة؟")}
                className="text-xs"
              >
                المكونات الفعالة
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("ما هو الروتين المناسب لبشرتي؟")}
                className="text-xs"
              >
                روتين العناية
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("أريد مقارنة بين منتجين")}
                className="text-xs"
              >
                مقارنة المنتجات
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
