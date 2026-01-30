
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { StoredContract, LegalScenario } from '../types';
import { theme } from '../theme';

const StorageManager: React.FC = () => {
  const [contracts, setContracts] = useState<StoredContract[]>([]);
  const [scenarios, setScenarios] = useState<LegalScenario[]>([]);
  const [usage, setUsage] = useState('0');
  const [activeTab, setActiveTab] = useState<'contracts' | 'scenarios'>('contracts');
  const [viewingItem, setViewingItem] = useState<{type: 'contract' | 'scenario', data: any} | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [contractsData, scenariosData] = await Promise.all([
        storageService.getContracts(),
        storageService.getScenarios()
      ]);
      setContracts(contractsData);
      setScenarios(scenariosData);
      setUsage(storageService.getStorageUsage());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (e: React.MouseEvent, type: 'contract' | 'scenario', id: string) => {
    e.stopPropagation();
    if (confirm('確定要永久刪除此筆紀錄嗎？')) {
      try {
        if (type === 'contract') await storageService.deleteContract(id);
        else await storageService.deleteScenario(id);
        await refresh();
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const success = await storageService.importData(ev.target?.result as string);
      if (success) {
        alert('匯入成功');
        await refresh();
      } else {
        alert('匯入失敗');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    if (confirm('警告：這將清空所有資料庫紀錄，包含所有合約與情境紀錄，且無法還原。')) {
      await storageService.clearAll();
      await refresh();
    }
  };

  return (
    <div className={theme.sectionGap + " animate-in fade-in duration-500 pb-12"}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className={theme.heading1}>數據資產管理</h2>
          <p className={theme.body + " mt-2"}>管理您的法務紀錄、合約審查存檔與資料備份。</p>
        </div>
        <div className="flex gap-3">
          <label className={theme.btnSecondary + " cursor-pointer"}>
            匯入備份
            <input type="file" accept=".json" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
            }} className="hidden" />
          </label>
          <button onClick={() => storageService.exportData()} className={theme.btnPrimary}>
            下載 JSON 備份
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 ${theme.gridGap}`}>
        <div className={theme.card + " p-6"}>
          <p className={theme.small}>資料庫狀態</p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-3xl font-bold text-[#172b4d]">{usage}</p>
          </div>
          <div className="h-1.5 bg-[#f4f5f7] rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-[#0052cc]" style={{ width: '100%' }}></div>
          </div>
        </div>
        <div className={theme.card + " p-6"}>
          <p className={theme.small}>合約審核總量</p>
          <p className="text-3xl font-bold text-[#0052cc] mt-2">{contracts.length} <span className="text-sm font-normal text-[#5e6c84]">份</span></p>
        </div>
        <div className={theme.card + " p-6"}>
          <p className={theme.small}>情境查詢次數</p>
          <p className="text-3xl font-bold text-[#006644] mt-2">{scenarios.length} <span className="text-sm font-normal text-[#5e6c84]">筆</span></p>
        </div>
      </div>

      <div className={theme.card}>
        <div className="flex border-b border-[#dfe1e6] bg-[#fafbfc]">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex-1 py-5 font-bold text-sm transition-all border-b-2 ${activeTab === 'contracts' ? 'text-[#0052cc] border-[#0052cc] bg-white' : 'text-[#5e6c84] border-transparent hover:text-[#172b4d]'}`}
          >
            合約審查歷史存檔 ({contracts.length})
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex-1 py-5 font-bold text-sm transition-all border-b-2 ${activeTab === 'scenarios' ? 'text-[#0052cc] border-[#0052cc] bg-white' : 'text-[#5e6c84] border-transparent hover:text-[#172b4d]'}`}
          >
            法律指南查詢紀錄 ({scenarios.length})
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-20 text-[#5e6c84] font-medium">載入中...</div>
          ) : activeTab === 'contracts' ? (
            <div className="grid grid-cols-1 gap-3">
              {contracts.length === 0 ? (
                <div className="text-center py-20 text-[#a5adba] font-medium">尚無儲存的合約審查紀錄</div>
              ) : (
                contracts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setViewingItem({type: 'contract', data: c})}
                    className="p-5 border border-[#dfe1e6] rounded-xl hover:bg-[#f4f5f7] hover:border-[#0052cc]/30 transition-all flex justify-between items-center group cursor-pointer shadow-sm bg-white"
                  >
                    <div className="flex gap-4 items-start min-w-0 pr-6">
                      <div className="w-10 h-10 rounded-lg bg-[#e6f0ff] flex items-center justify-center text-[#0052cc] shrink-0 font-bold text-lg">
                        DOC
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#172b4d] truncate group-hover:text-[#0052cc] transition-colors">{c.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[10px] text-[#5e6c84] font-bold uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            審查日期：{formatDate(c.timestamp)}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-[#dfe1e6]"></span>
                          <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                            檢出 {c.result.risks.length} 項風險
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#0052cc] opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 px-2 py-1 rounded">檢視報告</span>
                      <button
                        onClick={(e) => handleDelete(e, 'contract', c.id)}
                        className="p-2 text-[#bf2600] hover:bg-red-50 rounded-lg transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {scenarios.length === 0 ? (
                <div className="text-center py-20 text-[#a5adba] font-medium">尚無儲存的情境指南紀錄</div>
              ) : (
                scenarios.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setViewingItem({type: 'scenario', data: s})}
                    className="p-5 border border-[#dfe1e6] rounded-xl hover:bg-[#f4f5f7] transition-all flex justify-between items-center group cursor-pointer bg-white"
                  >
                    <div className="flex-1 min-w-0 pr-6">
                      <span className={theme.badgeIndigo}>{s.category}</span>
                      <h4 className="font-bold text-[#172b4d] mt-2 truncate group-hover:text-[#0052cc] transition-colors">{s.title}</h4>
                      <p className="text-[10px] text-[#5e6c84] mt-1.5 font-bold uppercase flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        查詢日期：{formatDate(s.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#006644] opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50 px-2 py-1 rounded">檢視分析</span>
                      <button
                        onClick={(e) => handleDelete(e, 'scenario', s.id)}
                        className="p-2 text-[#bf2600] hover:bg-red-50 rounded-lg transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleClearAll}
          className="text-[#bf2600] text-xs font-bold hover:underline opacity-60 hover:opacity-100 transition-opacity"
        >
          清空所有資料庫紀錄
        </button>
      </div>

      {/* Detail Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-4 border-b border-[#dfe1e6] bg-[#fafbfc] flex justify-between items-center">
              <div>
                <span className={viewingItem.type === 'contract' ? theme.badgeIndigo : theme.badgeEmerald}>
                  {viewingItem.type === 'contract' ? '合約審查紀錄' : '法律情境紀錄'}
                </span>
                <h3 className="text-lg font-bold text-[#172b4d] mt-1">{viewingItem.data.title}</h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-2 hover:bg-[#f4f5f7] rounded-full text-[#5e6c84] transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8">
              {viewingItem.type === 'contract' ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-center bg-[#f4f5f7] p-4 rounded-xl border border-[#dfe1e6]">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-[10px] font-bold text-[#5e6c84] uppercase">審查完成時間</p>
                        <p className="text-sm font-bold text-[#172b4d]">{formatDate(viewingItem.data.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-[#5e6c84] uppercase">狀態</p>
                       <p className="text-sm font-bold text-[#006644]">已完成結構化分析</p>
                    </div>
                  </div>

                  <section>
                    <h4 className="text-sm font-bold text-[#5e6c84] uppercase tracking-wider mb-3">合約原文 (摘要)</h4>
                    <div className="p-4 bg-white rounded-xl text-xs text-[#172b4d] font-mono whitespace-pre-wrap max-h-40 overflow-auto border border-[#dfe1e6]">
                      {viewingItem.data.content}
                    </div>
                  </section>
                  <section>
                    <h4 className="text-sm font-bold text-[#0052cc] uppercase tracking-wider mb-3">審查摘要</h4>
                    <p className="text-sm text-[#172b4d] leading-relaxed bg-blue-50/30 p-6 rounded-xl border border-blue-100/50">
                      {viewingItem.data.result.summary}
                    </p>
                  </section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section>
                      <h4 className="text-sm font-bold text-[#bf2600] uppercase tracking-wider mb-3">風險點 ({viewingItem.data.result.risks.length})</h4>
                      <ul className="space-y-2">
                        {viewingItem.data.result.risks.map((r: string, i: number) => (
                          <li key={i} className="text-xs text-[#172b4d] flex gap-2 p-3 bg-red-50/30 rounded-lg border border-red-100/50">
                            <span className="font-bold text-[#bf2600]">{i+1}.</span> {r}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <h4 className="text-sm font-bold text-[#006644] uppercase tracking-wider mb-3">修改建議</h4>
                      <ul className="space-y-2">
                        {viewingItem.data.result.recommendations.map((r: string, i: number) => (
                          <li key={i} className="text-xs text-[#172b4d] flex gap-2 p-3 bg-green-50/30 rounded-lg border border-green-100/50">
                            <span className="font-bold text-[#006644]">✓</span> {r}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <h4 className="text-sm font-bold text-[#5e6c84] uppercase tracking-wider">法規分析內容</h4>
                    <span className="text-[10px] text-[#5e6c84] font-medium">存檔時間：{formatDate(viewingItem.data.timestamp)}</span>
                  </div>
                  <div className="p-8 bg-white border border-[#dfe1e6] rounded-xl text-sm text-[#172b4d] leading-relaxed whitespace-pre-wrap shadow-sm font-medium">
                    {viewingItem.data.advice}
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-4 border-t border-[#dfe1e6] bg-[#fafbfc] flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className={theme.btnPrimary}
              >
                關閉視窗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageManager;
