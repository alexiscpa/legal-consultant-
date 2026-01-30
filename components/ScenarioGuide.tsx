
import React, { useState } from 'react';
import { getScenarioAdvice } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { GroundingSource } from '../types';
import { theme } from '../theme';

const PREDEFINED_SCENARIOS = [
  { id: '1', title: '員工曠職與資遣處理', category: '勞資關係', desc: '處理流程與 2026 最新勞基法規範認定。' },
  { id: '2', title: '採購供應鏈違約風險', category: '商務合約', desc: '延遲交貨罰則與物價波動條款調整建議。' },
  { id: '3', title: '辦公室租賃續約與點交', category: '資產管理', desc: '租賃合約到期之法律通知義務與糾紛防範。' },
  { id: '4', title: '公司章程與印鑑管理', category: '公司治理', desc: '對內管理辦法與對外授權之法律效力。' },
  { id: '5', title: '個資洩漏緊急處置', category: '合規風險', desc: '發生資安事故時的法律申報義務與賠償責任。' },
  { id: '6', title: '性別平等與職場霸凌', category: '勞資關係', desc: '2026 最新修正法規之內部調查流程。' },
];

const ScenarioGuide: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [adviceDate, setAdviceDate] = useState<string | null>(null);
  const [customScenario, setCustomScenario] = useState('');

  const handleScenarioClick = async (scenarioTitle: string, category: string = '自定義情境') => {
    setLoading(true);
    setSelectedScenario(scenarioTitle);
    setAdvice(null);
    setSources([]);
    setAdviceDate(null);
    try {
      const result = await getScenarioAdvice(scenarioTitle);
      const now = new Date();
      setAdvice(result.text);
      setSources(result.sources);
      setAdviceDate(now.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      await storageService.saveScenario({
        title: scenarioTitle,
        category,
        description: scenarioTitle,
        advice: result.text
      });
    } catch (err) {
      setAdvice('獲取建議時發生錯誤。');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customScenario.trim()) return;
    await handleScenarioClick(customScenario);
  };

  return (
    <div className={theme.sectionGap + " animate-in slide-in-from-bottom-4 duration-500 pb-12"}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className={theme.heading1}>情境法律指南</h2>
          <p className={theme.body + " mt-2"}>快速檢索管理部常見情境的法規依據與實務處理建議。</p>
        </div>
        <form onSubmit={handleCustomSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            placeholder="輸入您的具體管理情境..."
            className={theme.input}
          />
          <button type="submit" className="absolute right-3 top-2.5 p-1 text-[#0052cc] hover:bg-blue-50 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${theme.gridGap}`}>
        {PREDEFINED_SCENARIOS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleScenarioClick(item.title, item.category)}
            className={`${theme.card} ${theme.cardHover} p-6 text-left group ${
              selectedScenario === item.title ? 'ring-2 ring-[#0052cc] border-[#0052cc]/20' : ''
            }`}
          >
            <span className={theme.badgeIndigo + " mb-3 inline-block"}>{item.category}</span>
            <h4 className="font-bold text-[#172b4d] mb-2 group-hover:text-[#0052cc] transition-colors">{item.title}</h4>
            <p className="text-xs text-[#5e6c84] leading-relaxed">{item.desc}</p>
          </button>
        ))}
      </div>

      {(loading || advice) && (
        <div className={theme.card + " animate-in zoom-in-95 duration-300"}>
          <div className="px-8 py-5 border-b border-[#dfe1e6] bg-[#fafbfc] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-[#0052cc] rounded-xl text-white text-base shadow-sm">⚖️</span>
              <div>
                <h3 className={theme.heading2}>法規分析建議</h3>
                {adviceDate && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#0052cc] animate-pulse"></span>
                    <p className="text-[10px] text-[#5e6c84] font-bold">提問日期：{adviceDate}</p>
                  </div>
                )}
              </div>
            </div>
            {selectedScenario && !loading && (
              <div className="flex items-center gap-2">
                <span className={theme.badgeEmerald}>2026 最新法律分析</span>
              </div>
            )}
          </div>
          <div className="p-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-16 h-16 border-4 border-[#deebff] border-t-[#0052cc] rounded-full animate-spin"></div>
                <p className="text-[#5e6c84] font-bold animate-pulse">資深法務助理正在分析 2026 最新法規...</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="prose prose-slate max-w-none text-[#172b4d] leading-relaxed whitespace-pre-wrap font-medium">
                  {advice}
                </div>

                {sources.length > 0 && (
                  <div className="pt-8 border-t border-[#dfe1e6]">
                    <p className={theme.small + " mb-4"}>網路參考依據 (Google Grounding)：</p>
                    <div className="flex flex-wrap gap-3">
                      {sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-blue-50 border border-[#dfe1e6] hover:border-[#0052cc]/30 px-4 py-2 rounded-lg text-xs text-[#0052cc] transition-all flex items-center gap-2 shadow-sm"
                        >
                          <span className="truncate max-w-[200px]">{source.title}</span>
                          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioGuide;
