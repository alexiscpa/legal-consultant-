
import React, { useEffect, useState } from 'react';
import { AppView, StoredContract } from '../types';
import { storageService } from '../services/storageService';
import { theme } from '../theme';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const [counts, setCounts] = useState({ contracts: 0, scenarios: 0 });
  const [recentContracts, setRecentContracts] = useState<StoredContract[]>([]);

  useEffect(() => {
    const contracts = storageService.getContracts();
    setCounts({
      contracts: contracts.length,
      scenarios: storageService.getScenarios().length
    });
    setRecentContracts(contracts.slice(0, 3));
  }, []);

  const stats = [
    { label: '累計審查合約', value: counts.contracts.toString(), color: 'text-[#0052cc]', icon: '📄' },
    { label: '數據庫存儲', value: `${storageService.getStorageUsage()} KB`, color: 'text-[#ff8b00]', icon: '💾' },
    { label: '查詢歷史紀錄', value: counts.scenarios.toString(), color: 'text-[#006644]', icon: '🧭' },
  ];

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className={theme.sectionGap + " animate-in fade-in duration-500"}>
      {/* Welcome Banner */}
      <div className="bg-white border border-[#dfe1e6] rounded-xl p-8 flex flex-col md:flex-row justify-between items-center shadow-sm">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#0052cc]/10 text-[#0052cc] text-[10px] font-bold px-2 py-0.5 rounded">2026.01.29</span>
            <h2 className="text-2xl font-bold text-[#172b4d]">歡迎回來，法務決策者</h2>
          </div>
          <p className="text-[#5e6c84] mb-6">
            作為具備財務專業背景的管理部主管，LegalPro 協助您將繁複的法律條文轉化為可執行的管理決策。系統已更新至 2026 年 1 月最新法規庫。
          </p>
          <div className="flex gap-3">
            <button onClick={() => onViewChange(AppView.CONTRACT_REVIEW)} className={theme.btnPrimary}>
              開始合約審查
            </button>
            <button onClick={() => onViewChange(AppView.CONSULTATION)} className={theme.btnSecondary}>
              諮詢 AI 顧問
            </button>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="w-32 h-32 bg-[#e6f0ff] rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-[#0052cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-3 ${theme.gridGap}`}>
        {stats.map((stat) => (
          <div key={stat.label} className={theme.card + " p-6 flex flex-col"}>
            <span className="text-2xl mb-2">{stat.icon}</span>
            <p className="text-xs font-bold text-[#5e6c84] uppercase tracking-wider">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 ${theme.gridGap}`}>
        {/* Compliance Updates */}
        <div className={theme.card + " p-6 lg:col-span-2"}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={theme.heading2}>最新法規異動 (截至 2026.01.28)</h3>
            <span className={theme.badgeIndigo}>2026 Q1 更新</span>
          </div>
          <div className="space-y-4">
            {[
              { tag: '勞動', text: '2026年度最低工資調漲生效，月薪調整至 29,200 元，請核對投保薪資分級表。' },
              { tag: 'ESG', text: '2026年永續報告書申報新規：擴大上市櫃公司個資安全查核範圍。' },
              { tag: '數位', text: '《人工智慧基本法》施行細則發佈，企業內部導入 AI 工具需建立合規審查機制。' },
            ].map((news, i) => (
              <div key={i} className="flex gap-4 p-3 border-b border-[#f4f5f7] last:border-0 hover:bg-[#fafbfc] transition-colors rounded">
                <span className="text-[10px] font-bold text-[#0052cc] bg-[#e6f0ff] px-2 py-0.5 rounded h-fit shrink-0">
                  {news.tag}
                </span>
                <p className="text-sm text-[#172b4d] font-medium leading-snug">{news.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews History Section */}
        <div className={theme.card + " p-6 flex flex-col"}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={theme.heading2}>近期審查紀錄</h3>
            <button onClick={() => onViewChange(AppView.STORAGE)} className="text-[10px] font-bold text-[#0052cc] hover:underline">查看全部</button>
          </div>
          <div className="flex-1 space-y-3">
            {recentContracts.length > 0 ? (
              recentContracts.map((contract) => (
                <button
                  key={contract.id}
                  onClick={() => onViewChange(AppView.STORAGE)}
                  className="w-full text-left p-3 rounded-lg border border-[#dfe1e6] hover:bg-[#f4f5f7] hover:border-[#0052cc]/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg grayscale group-hover:grayscale-0 transition-all">📄</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172b4d] truncate">{contract.title}</p>
                      <p className="text-[10px] text-[#5e6c84] mt-1 font-medium">{formatDate(contract.timestamp)}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-8">
                <span className="text-3xl mb-2">📂</span>
                <p className="text-xs font-bold">尚無審查紀錄</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => onViewChange(AppView.CONTRACT_REVIEW)}
            className="w-full mt-6 py-2.5 bg-[#f4f5f7] text-[#172b4d] rounded-lg font-bold hover:bg-[#ebecf0] transition-all text-[11px] uppercase tracking-wider"
          >
            + 啟動新審查
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
