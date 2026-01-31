
import React from 'react';
import { AppView, User } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  user?: User;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, user, onLogout }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: '儀表板總覽', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: AppView.SCENARIOS, label: '法律情境查詢', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: AppView.CONTRACT_REVIEW, label: '合約智能審查', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: AppView.CONSULTATION, label: 'AI 法務顧問', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: AppView.STORAGE, label: '數據資產管理', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
  ];

  // Add admin menu items
  const adminItems = user?.role === 'admin' ? [
    { id: AppView.USER_MANAGEMENT, label: '使用者管理', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ] : [];

  return (
    <aside className="w-64 bg-[#0747a6] text-white flex flex-col h-screen hidden lg:flex shadow-2xl">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0747a6]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">LegalPro</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all font-medium text-sm ${
              currentView === item.id
                ? 'bg-white/10 text-white shadow-inner'
                : 'text-blue-100 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}

        {adminItems.length > 0 && (
          <>
            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">管理功能</p>
            </div>
            {adminItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all font-medium text-sm ${
                  currentView === item.id
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-blue-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </>
        )}
      </nav>

      <div className="p-6 border-t border-white/10 space-y-4">
        {user && (
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2">帳號資訊</p>
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-blue-200 truncate">{user.email}</p>
            {user.role === 'admin' && (
              <span className="inline-block mt-2 text-[10px] font-bold text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded uppercase">
                管理者
              </span>
            )}
          </div>
        )}

        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2">Security Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-xs font-semibold">SSL Secured</span>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-100 hover:text-white transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            登出
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
