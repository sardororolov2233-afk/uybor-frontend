import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, Bell } from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import { sendAIChatMessage, saveAIPreferences } from '../api/ai';
import type { Listing } from '../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  type: 'text' | 'listing';
  listingData?: Listing;
  timestamp: string;
  canSubscribe?: boolean;
  searchPrompt?: string;
}

export const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "Assalomu alaykum! Men UyBor AI maslahatchisiman. Sizga qanday uy topishda yordam bera olaman? Masalan: 'Yunusoboddan 400$ atrofida 2 xonali ijara' deb yozishingiz mumkin.",
      type: 'text',
      timestamp: '10:00'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [subscribedPrompt, setSubscribedPrompt] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    const textToSend = inputText.trim();
    if (!textToSend || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Chat tarixini tayyorlash
      const history = messages
        .filter(m => m.type === 'text')
        .slice(-6)
        .map(m => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

      // Haqiqiy backend AI so'rovi
      const res = await sendAIChatMessage(textToSend, history);

      const aiTextMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply || "Qidiruv natijalari tayyor:",
        type: 'text',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        canSubscribe: true,
        searchPrompt: textToSend,
      };

      const newMsgs: Message[] = [aiTextMsg];

      // Tavsiya etilgan e'lonlarni qo'shish
      if (res.recommended_listings && res.recommended_listings.length > 0) {
        res.recommended_listings.forEach((listing, idx) => {
          newMsgs.push({
            id: (Date.now() + 2 + idx).toString(),
            sender: 'ai',
            text: '',
            type: 'listing',
            listingData: listing,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        });
      }

      setMessages(prev => [...prev, ...newMsgs]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "Kechirasiz, so'rovingizni qayta ishlashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
          type: 'text',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubscribe = async (prompt: string) => {
    try {
      await saveAIPreferences(prompt);
      setSubscribedPrompt(prompt);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: `🔔 Qidiruv talablaringiz saqlandi! Yangi mos e'lon qo'shilishi bilan Telegram botingizga darhol xabar yuboriladi.`,
          type: 'text',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (error) {
      console.error('Subscribe error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-[#f5f8ff] min-h-screen flex flex-col pt-safe relative">
      {/* Fixed Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Uybor AI</h1>
            <p className="text-[11px] text-green-500 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Online
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 pb-[160px] overflow-y-auto">
        <div className="text-center text-xs font-semibold text-gray-400 my-4">Bugun</div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mr-2 self-end mb-1">
                <Bot size={16} />
              </div>
            )}
            
            <div className={`max-w-[75%] ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
              {msg.type === 'text' ? (
                <div>
                  <div 
                    className={`p-3.5 rounded-2xl text-[15px] shadow-sm leading-snug ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.canSubscribe && msg.searchPrompt && (
                    <button
                      onClick={() => handleSubscribe(msg.searchPrompt!)}
                      disabled={subscribedPrompt === msg.searchPrompt}
                      className="mt-2 flex items-center gap-1.5 text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-all font-medium"
                    >
                      <Bell size={13} />
                      {subscribedPrompt === msg.searchPrompt ? '✅ Bildirishnoma yoqilgan' : 'Yangi e\'lonlar uchun eslatma yoqish'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full sm:w-64 max-w-full">
                  {msg.listingData && <ListingCard listing={msg.listingData} />}
                </div>
              )}
              <div className={`text-[10px] text-gray-400 mt-1 font-medium ${msg.sender === 'user' ? 'text-right mr-1' : 'ml-1'}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mr-2 self-end mb-1">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area */}
      <div className="fixed bottom-[96px] left-0 right-0 px-4 z-40">
        {/* Quick Suggestions (Optional) */}
        {messages.length === 1 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-1 px-1">
            <button onClick={() => setInputText('Yunusoboddan 2 xonali ijara')} className="shrink-0 bg-white shadow-sm border border-gray-100 text-blue-600 text-xs font-semibold px-4 py-2 rounded-full active:scale-95 transition-transform">
              Yunusobod 2 xonali
            </button>
            <button onClick={() => setInputText('Arzon hovli sotib olmoqchiman')} className="shrink-0 bg-white shadow-sm border border-gray-100 text-blue-600 text-xs font-semibold px-4 py-2 rounded-full active:scale-95 transition-transform">
              Arzon hovli
            </button>
          </div>
        )}

        <div className="bg-white rounded-[24px] p-1.5 shadow-lg shadow-gray-200/50 border border-gray-100 flex items-end">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="AI yordamchiga yozing..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] p-3 text-[15px] outline-none"
            rows={1}
            style={{ height: 'auto' }}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className={`p-3 rounded-full shrink-0 m-1 transition-colors ${
              inputText.trim() && !isTyping ? 'bg-blue-600 text-white shadow-md active:scale-95' : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Send size={18} className={inputText.trim() && !isTyping ? 'ml-0.5' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};
