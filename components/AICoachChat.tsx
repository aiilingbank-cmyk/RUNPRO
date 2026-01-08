
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getAIAdviceWithSearch } from '../services/geminiService';
import { Send, Bot, User, Loader2, Link as LinkIcon, ExternalLink, Globe } from 'lucide-react';
import { AppTheme } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
  grounding?: any[];
}

export const AICoachChat: React.FC<{ theme?: AppTheme }> = ({ theme = 'blue' }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'สวัสดี! ผมคือโค้ชวิ่ง AI ของคุณ วันนี้มีอะไรให้ช่วยเกี่ยวกับแผนการฝึกซ้อมไหมครับ? ผมสามารถช่วยคุณเช็คงานวิ่งที่น่าสนใจ หรือวางแผนการกินในวันแข่งขันก็ได้นะ!' }
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
      const response = await getAIAdviceWithSearch(input);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: response.text || "ขออภัยครับ ผมไม่สามารถประมวลผลได้ในขณะนี้",
        grounding: response.grounding
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "เกิดข้อผิดพลาดในการเชื่อมต่อกับโค้ช AI" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[650px] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fadeIn">
      <div className={`${themeClasses.header} p-6 text-white flex items-center gap-4 transition-colors shrink-0`}>
        <div className="bg-white/20 p-2 rounded-full">
          <Bot size={28} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg leading-tight">Pro AI Coach</h3>
          <p className="text-xs text-white/80 flex items-center gap-1">
            <Globe size={12} className="animate-pulse" /> มาพร้อมระบบค้นหาข้อมูลอัจฉริยะ
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-full transition-colors shrink-0 ${m.role === 'user' ? themeClasses.userIcon : 'bg-white border border-gray-200 text-gray-400'}`}>
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className="space-y-2">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-colors ${
                  m.role === 'user' 
                  ? `${themeClasses.userBubble} text-white rounded-tr-none shadow-md` 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  {m.text}
                </div>
                
                {m.grounding && m.grounding.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-fadeIn">
                    {m.grounding.map((chunk, idx) => chunk.web && (
                      <a 
                        key={idx} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm group"
                      >
                        <LinkIcon size={12} className="group-hover:rotate-45 transition-transform" />
                        <span className="max-w-[120px] truncate">{chunk.web.title || 'ดูแหล่งข้อมูล'}</span>
                        <ExternalLink size={10} className="opacity-40" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-3">
                <Loader2 className={`animate-spin ${themeClasses.loader}`} size={18} />
                <span className="text-xs text-gray-400 font-medium">โค้ชกำลังค้นหาข้อมูลที่ดีที่สุดให้คุณ...</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="ถามเรื่องการวิ่ง, งานวิ่งในไทย หรือสภาพอากาศวันนี้..."
          className={`flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm focus:ring-2 ${themeClasses.ring} outline-none transition font-medium`}
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className={`${themeClasses.button} text-white p-4 rounded-xl ${themeClasses.hover} disabled:opacity-50 transition shadow-lg shrink-0`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
