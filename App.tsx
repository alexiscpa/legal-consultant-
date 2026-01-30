
import React, { useState } from 'react';
import { AppView } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ScenarioGuide from './components/ScenarioGuide';
import ContractReviewer from './components/ContractReviewer';
import LegalChat from './components/LegalChat';
import StorageManager from './components/StorageManager';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onViewChange={setCurrentView} />;
      case AppView.SCENARIOS:
        return <ScenarioGuide />;
      case AppView.CONTRACT_REVIEW:
        return <ContractReviewer />;
      case AppView.CONSULTATION:
        return <LegalChat />;
      case AppView.STORAGE:
        return <StorageManager />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] text-[#172b4d] overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 flex flex-col overflow-auto h-screen">
        <header className="bg-white border-b border-[#dfe1e6] px-8 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-[#0052cc] rounded-full"></div>
            <div>
              <h1 className="text-lg font-bold text-[#172b4d] tracking-tight">
                LegalPro <span className="text-[#5e6c84] font-normal mx-2">|</span> 企業法務顧問系統
              </h1>
              <p className="text-[10px] text-[#5e6c84] font-bold uppercase tracking-widest">Administrative Management Console</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#172b4d]">管理部主管</p>
              <p className="text-[10px] text-[#0052cc] font-bold uppercase">Finance & Legal Hub</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#0052cc] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-900/10">
              AD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
