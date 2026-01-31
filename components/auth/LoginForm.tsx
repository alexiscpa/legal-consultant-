import React, { useState } from 'react';
import { theme } from '../../theme';
import { login } from '../../services/authService';
import { User } from '../../types';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onLoginSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user } = await login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f5f7] to-[#e6f0ff] px-4">
      <div className={`${theme.card} w-full max-w-md p-8`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0052cc] to-[#0747a6] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className={theme.heading1}>LegalPro</h1>
          <p className={theme.body}>企業法務顧問系統</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-[#ffebe6] border border-[#ff8f73] text-[#bf2600] px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[#5e6c84] text-sm font-medium mb-2">
              電子郵件
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={theme.input}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-[#5e6c84] text-sm font-medium mb-2">
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={theme.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`${theme.btnPrimary} w-full py-3`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                登入中...
              </>
            ) : (
              '登入'
            )}
          </button>

          <div className="text-center pt-4 border-t border-[#dfe1e6]">
            <p className={theme.body}>
              還沒有帳號？{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[#0052cc] hover:text-[#0747a6] font-medium"
              >
                立即註冊
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
