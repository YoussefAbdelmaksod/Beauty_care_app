import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Image, 
  ArrowLeft, 
  Bot, 
  User,
  Loader2,
  Camera,
  MessageCircle
} from "lucide-react";
import { useLocation } from "wouter";

interface ChatMessage {
  id: number;
  message: string;
  response: string | null;
  messageType: string;
  createdAt: string;
  isFromUser: boolean;
}

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const language = localStorage.getItem("userLanguage") || "ar";
  const userId = parseInt(localStorage.getItem("userId") || "0");

  const { data: chatHistory, isLoading } = useQuery({
    queryKey: ["/api/chat/history", userId],
    enabled: !!userId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; messageType: string }) => {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: data.message,
          messageType: data.messageType,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
      setMessage("");
      
      // Add the new message and response to local state
      const newMessage: ChatMessage = {
        id: Date.now(),
        message: data.message,
        response: data.response,
        messageType: data.messageType,
        createdAt: new Date().toISOString(),
        isFromUser: true,
      };
      
      setMessages(prev => [...prev, newMessage]);
    },
    onError: (error: Error) => {
      toast({
        title: language === "ar" ? "خطأ في الإرسال" : "Send Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (chatHistory && Array.isArray(chatHistory)) {
      // Convert chat history to message format
      const formattedMessages: ChatMessage[] = [];
      
      chatHistory.forEach((chat: any) => {
        // User message
        formattedMessages.push({
          id: chat.id * 2,
          message: chat.message,
          response: null,
          messageType: chat.messageType,
          createdAt: chat.createdAt,
          isFromUser: true,
        });
        
        // AI response
        if (chat.response) {
          formattedMessages.push({
            id: chat.id * 2 + 1,
            message: chat.response,
            response: null,
            messageType: "response",
            createdAt: chat.createdAt,
            isFromUser: false,
          });
        }
      });
      
      setMessages(formattedMessages);
    }
  }, [chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      message: message.trim(),
      messageType: "text",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const t = {
    ar: {
      chatTitle: "محادثة مع خبير العناية",
      placeholder: "اسألي عن أي شيء متعلق بالعناية بالبشرة...",
      send: "إرسال",
      back: "العودة",
      you: "أنت",
      aiExpert: "خبير العناية",
      typing: "يكتب...",
      welcomeMessage: "أهلاً! أنا خبير العناية بالبشرة. كيف يمكنني مساعدتك اليوم؟",
      suggestions: [
        "ما هو أفضل منتج لبشرتي؟",
        "كيف أعالج حب الشباب؟", 
        "ما هو الروتين المناسب للبشرة الجافة؟",
        "أريد مقارنة بين منتجين"
      ]
    },
    en: {
      chatTitle: "Chat with Skincare Expert",
      placeholder: "Ask anything about skincare...",
      send: "Send",
      back: "Back",
      you: "You",
      aiExpert: "AI Expert",
      typing: "Typing...",
      welcomeMessage: "Hello! I'm your skincare expert. How can I help you today?",
      suggestions: [
        "What's the best product for my skin?",
        "How do I treat acne?",
        "What's a good routine for dry skin?",
        "I want to compare two products"
      ]
    }
  };

  const currentT = t[language as keyof typeof t];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">
            {language === "ar" ? "جاري تحميل المحادثة..." : "Loading chat..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-4 h-4" />
          {currentT.back}
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">{currentT.chatTitle}</h1>
            <p className="text-sm text-green-600">
              {language === "ar" ? "متاح الآن" : "Available now"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 mb-6">{currentT.welcomeMessage}</p>
            
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-sm text-gray-500 mb-3">
                {language === "ar" ? "اقتراحات للبدء:" : "Suggestions to get started:"}
              </p>
              {currentT.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-right"
                  onClick={() => setMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.isFromUser ? "justify-end" : "justify-start"}`}>
            {!msg.isFromUser && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-[70%] ${msg.isFromUser ? "order-1" : ""}`}>
              <div className={`p-3 rounded-lg ${
                msg.isFromUser 
                  ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white ml-auto" 
                  : "bg-white border shadow-sm"
              }`}>
                <p className={`text-sm ${msg.isFromUser ? "text-white" : "text-gray-900"}`}>
                  {msg.message}
                </p>
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${msg.isFromUser ? "text-right" : "text-left"}`}>
                {new Date(msg.createdAt).toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {msg.isFromUser && (
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {sendMessageMutation.isPending && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border shadow-sm p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">{currentT.typing}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentT.placeholder}
            className="flex-1 text-right"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}