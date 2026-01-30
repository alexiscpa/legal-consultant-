
import React, { useState, useRef, useEffect } from 'react';
import { startLegalChat } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { ChatMessage } from '../types';
import { theme } from '../theme';

const LegalChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const loadChat = async () => {
      try {
        const history = await storageService.getChat();
        if (history.length > 0) setMessages(history);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    loadChat();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      storageService.saveChat(messages).catch(err => {
        console.error('Failed to save chat:', err);
      });
    }
    if (scrollRef.current && !showHistory) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showHistory]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    const now = Date.now();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp: now }]);
    setIsTyping(true);
    setMessages(prev => [...prev, { role: 'model', text: '', sources: [], timestamp: Date.now() }]);

    try {
      if (!chatRef.current) {
        chatRef.current = startLegalChat((text, sources) => {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...last, text, sources, timestamp: Date.now() }];
          });
        });
      }
      await chatRef.current.send(userMessage);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: '抱歉，發生錯誤，請稍後再試。', timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('zh-TW')} ${date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const scrollToMessage = (index: number) => {
    const element = messageRefs.current[index];
    if (element && scrollRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowHistory(false);
    }
  };

  const userQuestions = messages
    .map((msg, idx) => ({ ...msg, index: idx }))
    .filter(msg => msg.role === 'user');

  return (
    <div className={theme.card + " flex flex-col h-[calc(100vh-180px)] relative overflow-hidden"}>
      <div className="px-6 py-4 bg-white border-b border-[#dfe1e6] flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0052cc] flex items-center justify-center text-white font-bold">
            ⚖️
          </div>
          <div>
            <h3 className="font-bold text-[#172b4d] text-sm leading-tight">AI 法務諮詢助理</h3>
            <p className="text-[10px] text-[#5e6c84] font-bold uppercase tracking-wider">Secure Professional Consultation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              showHistory ? 'bg-[#0052cc] text-white' : 'bg-[#f4f5f7] text-[#5e6c84] hover:bg-[#ebecf0]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            歷史提問
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-bold text-[#5e6c84]">系統連線中</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto p-6 space-y-6 bg-[#fafbfc] transition-all duration-300"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-12">
              <div className="w-16 h-16 bg-white rounded-xl border border-[#dfe1e6] flex items-center justify-center text-3xl mb-4 shadow-sm">
                💬
              </div>
              <p className="font-bold text-[#172b4d]">歡迎開始法律諮詢</p>
              <p className="text-xs text-[#5e6c84] mt-2 leading-relaxed">
                您可以詢問關於勞基法、採購合約或公司治理的任何問題。
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              ref={el => messageRefs.current[i] = el}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[9px] font-bold text-[#a5adba] mb-1 px-1">
                {msg.role === 'user' ? '您的提問' : '法務建議'} • {formatDate(msg.timestamp)}
              </span>
              <div className={`max-w-[85%] p-4 rounded-xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#0052cc] text-white rounded-tr-none'
                  : 'bg-white text-[#172b4d] border border-[#dfe1e6] rounded-tl-none'
              }`}>
                {msg.text || (msg.role === 'model' && i === messages.length - 1 && isTyping ? '正在查閱相關法條與 2026 實務見解...' : '')}

                {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#f4f5f7]">
                    <p className="text-[9px] font-bold text-[#a5adba] uppercase mb-2">法規依據與參考連結：</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((s, idx) => (
                        <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-[#f4f5f7] text-[#0052cc] px-2 py-1 rounded border border-[#dfe1e6] hover:bg-[#ebecf0] transition-colors">
                          {s.title.substring(0, 20)}...
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* History Sidebar */}
        <div className={`absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-[#dfe1e6] shadow-2xl z-10 transition-transform duration-300 ease-in-out transform ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b border-[#dfe1e6] bg-[#fafbfc] flex justify-between items-center">
            <h4 className="text-sm font-bold text-[#172b4d]">歷史提問紀錄</h4>
            <button onClick={() => setShowHistory(false)} className="text-[#5e6c84] hover:text-[#172b4d]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="overflow-auto h-[calc(100%-53px)] p-2 space-y-1">
            {userQuestions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#a5adba] font-medium">
                尚無歷史提問
              </div>
            ) : (
              [...userQuestions].reverse().map((q) => (
                <button
                  key={q.index}
                  onClick={() => scrollToMessage(q.index)}
                  className="w-full text-left p-3 rounded-lg hover:bg-[#f4f5f7] border border-transparent hover:border-[#dfe1e6] transition-all group"
                >
                  <p className="text-xs font-bold text-[#172b4d] line-clamp-2 mb-1 group-hover:text-[#0052cc]">
                    {q.text}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-[#a5adba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] text-[#5e6c84] font-medium">{formatDate(q.timestamp)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-[#dfe1e6] z-20">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="請輸入您的法律問題 (例如：業務同仁以其他公司名義陪標之行為會違反什麼法規？)"
            className={theme.input}
            disabled={isTyping}
          />
          <button type="submit" disabled={!input.trim() || isTyping} className={theme.btnPrimary + " h-11 w-11 !p-0 shrink-0"}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LegalChat;
