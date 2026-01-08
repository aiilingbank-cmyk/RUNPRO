
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getAIAdvice } from '../services/geminiService';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { AppTheme } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AICoachChat: React.FC<{ theme?: AppTheme }> = ({ theme = 'blue' }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'สวัสดี! ผมคือโค้ชวิ่ง AI ของคุณ วันนี้มีอะไรให้ช่วยเกี่ยวกับแผนการฝึกซ้อมมาราธอนไหมครับ? (เช่น เรื่องโภชนาการ, การคุม Pace หรือการยืดเหยียด)' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const themeClasses = useMemo(() => {
    const configs = {
      blue: { header: 'bg-blue-600', userBubble: 'bg-blue-600', userIcon: 'bg-blue-100 text-blue-600', button: 'bg-blue-600', hover: 'hover:bg-blue-700', ring: 'focus:ring-blue-500', loader: 'text-blue-600' },
      emerald: { header: 'bg-emerald-600', userBubble: 'bg-emerald-600', userIcon: 'bg-emerald-100 text-emerald-600', button: 'bg-emerald-600', hover: 'hover:bg-emerald-700', ring: 'focus:ring-emerald-500', loader: 'text-emerald-600' },
      violet: { header: 'bg-violet-600', userBubble: 'bg-violet-600', userIcon: 'bg-violet-100 text-violet-600', button: 'bg-violet-600', hover: 'hover:bg-violet-700', ring: 'focus:ring-violet-500', loader: 'text-violet-600' },
      rose: { header: 'bg-rose-600', userBubble: 'bg-rose-600', userIcon: 'bg-rose-100 text-rose-600', button: 'bg-rose-600', hover: 'hover:bg-rose-700', ring: 'focus:ring-rose-500', loader: 'text-rose-600' }
    };
    return configs[theme];
  }, [theme]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    try {
      const response = await getAIAdvice(input, []);
      setMessages(prev => [...prev, { role: 'model', text: response || "ขออภัยครับ ผมไม่สามารถประมวลผลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "เกิดข้อผิดพลาดในการเชื่อมต่อกับโค้ช AI กรุณาตรวจสอบอินเทอร์เน็ตของคุณ" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[600px] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fadeIn">
      <div className={`${themeClasses.header} p-6 text-white flex items-center gap-4 transition-colors`}>
        <div className="bg-white/20 p-2 rounded-full">
          <Bot size={28} />
        </div>
        <div>
          <h3 className="font-bold text-lg">Pro AI Coach</h3>
          <p className="text-xs text-white/80 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span> ออนไลน์พร้อมให้คำแนะนำ
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-full transition-colors ${m.role === 'user' ? themeClasses.userIcon : 'bg-gray-200 text-gray-600'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-colors ${
                m.role === 'user' 
                ? `${themeClasses.userBubble} text-white rounded-tr-none shadow-md` 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'
              }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                <Loader2 className={`animate-spin ${themeClasses.loader} transition-colors`} size={18} />
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="ถามเรื่องการฝึกซ้อม, โภชนาการ หรือการพักฟื้น..."
          className={`flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ${themeClasses.ring} outline-none transition`}
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className={`${themeClasses.button} text-white p-3 rounded-xl ${themeClasses.hover} disabled:opacity-50 transition shadow-lg transition-colors`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
