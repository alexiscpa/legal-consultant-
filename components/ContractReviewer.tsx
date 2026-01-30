
import React, { useState, useEffect } from 'react';
import { reviewContract } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { ReviewResult, StoredContract } from '../types';
import { theme } from '../theme';

const ContractReviewer: React.FC = () => {
  const [contractText, setContractText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<StoredContract[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const contracts = await storageService.getContracts();
        setHistory(contracts);
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    };
    loadHistory();
  }, []);

  const handleReview = async () => {
    if (!contractText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await reviewContract(contractText);
      setResult(data);
      const firstLine = contractText.split('\n')[0].substring(0, 30);
      const saved = await storageService.saveContract({ title: firstLine || '未命名合約', content: contractText, result: data });

      setHistory(prev => [saved, ...prev]);
      setActiveHistoryId(saved.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: StoredContract) => {
    setContractText(item.content);
    setResult(item.result);
    setActiveHistoryId(item.id);
    if (window.innerWidth < 1024) setShowHistory(false);
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `合約審查結果\n\n摘要：\n${result.summary}\n\n風險點：\n${result.risks.join('\n')}\n\n修改建議：\n${result.recommendations.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className={theme.sectionGap + " animate-in slide-in-from-bottom-4 duration-500 pb-12 relative"}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className={theme.heading1}>智能合約審查</h2>
          <p className={theme.body + " mt-2"}>基於 AI 深度結構分析，找出隱藏的財務與法律風險。</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`${theme.btnSecondary} ${showHistory ? 'ring-2 ring-[#0052cc]' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            歷史紀錄
          </button>
          {result && (
            <button onClick={copyToClipboard} className={theme.btnSecondary + (copied ? " !bg-emerald-50 !text-emerald-700 !border-emerald-200" : "")}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={copied ? "M5 13l4 4L19 7" : "M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1"} />
              </svg>
              {copied ? '已複製' : '複製結果'}
            </button>
          )}
          <button onClick={() => { setContractText(''); setResult(null); setActiveHistoryId(null); }} className={theme.btnGhost}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" />
            </svg>
            新審查
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-stretch min-h-[600px] relative overflow-hidden">
        {/* Main Content Area */}
        <div className={`flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-300 ${showHistory ? 'lg:mr-80' : ''}`}>
          <div className="flex flex-col space-y-6">
            <div className="relative flex-1 flex flex-col">
               <span className="absolute top-4 left-4 text-[10px] font-bold text-[#a5adba] bg-white/80 px-2 py-0.5 rounded border border-[#dfe1e6] z-10">合約本文輸入區</span>
               <textarea
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                placeholder="在此貼上合約全文內容..."
                className={theme.input + " flex-1 resize-none p-8 pt-12 text-sm leading-relaxed"}
              />
            </div>
            <button
              onClick={handleReview}
              disabled={loading || !contractText.trim()}
              className={theme.btnPrimary + " w-full py-5 text-lg shadow-xl shadow-indigo-200"}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  法務系統審查中...
                </>
              ) : '開始法律審查'}
            </button>
          </div>

          <div className={theme.card + " bg-slate-50/50 flex flex-col"}>
            {result ? (
              <div className="p-10 space-y-10 overflow-auto max-h-[700px] animate-in fade-in zoom-in-95 duration-500">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-indigo-100 rounded-xl text-indigo-600">📝</span>
                      <h4 className={theme.heading2}>合約概要</h4>
                    </div>
                    {activeHistoryId && (
                      <span className="text-[10px] font-bold text-[#5e6c84] bg-[#f4f5f7] px-2 py-1 rounded">
                        審查於 {formatDate(history.find(h => h.id === activeHistoryId)?.timestamp || 0)}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="p-2 bg-rose-100 rounded-xl text-rose-600">⚠️</span>
                    <h4 className={theme.heading2}>風險點</h4>
                  </div>
                  <div className="grid gap-3">
                    {result.risks.map((risk, i) => (
                      <div key={i} className="flex gap-4 bg-rose-50/50 border border-rose-100 p-5 rounded-2xl text-slate-700 text-sm">
                        <span className="text-rose-500 font-bold font-mono">0{i+1}</span>
                        {risk}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="p-2 bg-emerald-100 rounded-xl text-emerald-600">⚖️</span>
                    <h4 className={theme.heading2}>修改建議</h4>
                  </div>
                  <div className="grid gap-4">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-slate-700 text-sm">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        </div>
                        {rec}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center text-4xl mb-6 grayscale opacity-50">
                  📄
                </div>
                <p className="text-xl font-bold text-slate-400">請貼入合約開始審查</p>
                <p className="text-slate-400 mt-2 max-w-[280px] text-sm">
                  或者點擊右上角「歷史紀錄」查看先前的審核成果。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* History Sidebar Drawer */}
        <div className={`absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-[#dfe1e6] shadow-2xl z-20 transition-transform duration-300 ease-in-out transform ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b border-[#dfe1e6] bg-[#fafbfc] flex justify-between items-center">
            <h4 className="text-sm font-bold text-[#172b4d]">合約審查歷史紀錄</h4>
            <button onClick={() => setShowHistory(false)} className="text-[#5e6c84] hover:text-[#172b4d]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="overflow-auto h-[calc(100%-53px)] p-2 space-y-1">
            {history.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#a5adba] font-medium italic">
                尚無存檔紀錄
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className={`w-full text-left p-4 rounded-xl transition-all border group relative ${
                    activeHistoryId === item.id
                      ? 'bg-[#e6f0ff] border-[#0052cc]/30 shadow-sm'
                      : 'hover:bg-[#f4f5f7] border-transparent'
                  }`}
                >
                  <p className={`text-xs font-bold truncate mb-2 ${activeHistoryId === item.id ? 'text-[#0052cc]' : 'text-[#172b4d]'}`}>
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-[#a5adba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] text-[#5e6c84] font-medium">{formatDate(item.timestamp)}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      item.result.risks.length > 3 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.result.risks.length} 風險
                    </span>
                  </div>
                  {activeHistoryId === item.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#0052cc] rounded-r-full"></div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractReviewer;
