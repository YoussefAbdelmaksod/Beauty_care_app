import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Get chat history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const chats = await storage.getChatHistory(userId);
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

// Get recent chats for home page
router.get('/recent/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const chats = await storage.getRecentChats(userId, 5);
    res.json(chats);
  } catch (error) {
    console.error('Error fetching recent chats:', error);
    res.status(500).json({ message: 'Failed to fetch recent chats' });
  }
});

// Send a new message
router.post('/send', async (req, res) => {
  try {
    const { userId, message, messageType } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: 'User ID and message are required' });
    }

    // Generate AI response (simplified for now)
    const response = await generateAIResponse(message, messageType);

    // Save the chat
    const chat = await storage.createChatMessage({
      userId,
      message,
      response,
      messageType: messageType || 'text'
    });

    res.json({
      message,
      response,
      messageType: chat.messageType,
      id: chat.id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Simple AI response generator (placeholder for actual AI integration)
async function generateAIResponse(message: string, messageType: string): Promise<string> {
  // This is a placeholder. In a real app, you'd integrate with Google Gemini or another AI service
  const responses = [
    "شكراً لسؤالك! بناءً على نوع بشرتك، أنصحك باستخدام منظف لطيف في الصباح والمساء.",
    "لعلاج حب الشباب، جربي المنتجات التي تحتوي على حمض الساليسيليك أو البنزويل بيروكسايد.",
    "للبشرة الجافة، استخدمي مرطب يحتوي على حمض الهيالورونيك والسيراميد.",
    "أهم شيء في روتين العناية هو الثبات على المنتجات لمدة 6-8 أسابيع على الأقل لرؤية النتائج.",
    "تذكري دائماً استخدام واقي الشمس يومياً، حتى في الأيام الغائمة!"
  ];

  // Simple keyword-based response selection
  if (message.includes('حب الشباب') || message.includes('acne')) {
    return "لعلاج حب الشباب، أنصحك بروتين يتضمن: منظف بحمض الساليسيليك، تونر لطيف، سيروم نياسيناميد، ومرطب خفيف. تجنبي المنتجات الزيتية والإفراط في التقشير.";
  }
  
  if (message.includes('جفاف') || message.includes('dry')) {
    return "للبشرة الجافة: استخدمي منظف كريمي لطيف، سيروم حمض الهيالورونيك، مرطب غني بالسيراميد، وزيت طبيعي في المساء. اشربي الكثير من الماء!";
  }

  if (message.includes('مقارنة') || message.includes('compare')) {
    return "لمقارنة المنتجات، انظري إلى: المكونات الفعالة، نوع البشرة المناسب، السعر، وتقييمات المستخدمين. يمكنني مساعدتك في مقارنة منتجات محددة إذا أخبرتيني بأسمائها.";
  }

  return responses[Math.floor(Math.random() * responses.length)];
}

export default router;