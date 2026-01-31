
import React, { useState, useEffect } from 'react';
import { AppView, User } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ScenarioGuide from './components/ScenarioGuide';
import ContractReviewer from './components/ContractReviewer';
import LegalChat from './components/LegalChat';
import StorageManager from './components/StorageManager';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { PendingApproval } from './components/auth/PendingApproval';
import { UserManagement } from './components/admin/UserManagement';
import { getCurrentUser, logout } from './services/authService';

type AuthScreen = 'login' | 'register';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setRegistrationSuccess(false);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleRegisterSuccess = () => {
    setRegistrationSuccess(true);
    setAuthScreen('login');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f5f7] to-[#e6f0ff]">
        <div className="text-center">
          <svg className="animate-spin w-12 h-12 text-[#0052cc] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-[#5e6c84]">載入中...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login or register
  if (!user) {
    if (authScreen === 'register') {
      return (
        <RegisterForm
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setAuthScreen('login')}
        />
      );
    }

    return (
      <>
        {registrationSuccess && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#e3fcef] border border-[#57d9a3] text-[#006644] px-6 py-3 rounded-lg shadow-lg z-50">
            註冊成功！請等待管理員審核後即可登入。
          </div>
        )}
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => {
            setRegistrationSuccess(false);
            setAuthScreen('register');
          }}
        />
      </>
    );
  }

  // Authenticated but pending or rejected
  if (user.role !== 'admin' && user.status !== 'approved') {
    return <PendingApproval user={user} onLogout={handleLogout} />;
  }

  // Authenticated and approved - show main app
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
      case AppView.USER_MANAGEMENT:
        return user.role === 'admin' ? <UserManagement /> : <Dashboard onViewChange={setCurrentView} />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] text-[#172b4d] overflow-hidden">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />
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
              <p className="text-xs font-bold text-[#172b4d]">{user.name}</p>
              <p className="text-[10px] text-[#0052cc] font-bold uppercase">
                {user.role === 'admin' ? 'System Administrator' : 'Legal Team Member'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#0052cc] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-900/10">
              {user.name.substring(0, 2).toUpperCase()}
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
