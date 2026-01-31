import React, { useState } from 'react';
import { theme } from '../../theme';
import { register } from '../../services/authService';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('密碼不一致');
      return;
    }

    if (password.length < 6) {
      setError('密碼需至少 6 個字元');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      onRegisterSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className={theme.heading1}>註冊帳號</h1>
          <p className={theme.body}>建立您的 LegalPro 帳號</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-[#ffebe6] border border-[#ff8f73] text-[#bf2600] px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[#5e6c84] text-sm font-medium mb-2">
              姓名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={theme.input}
              placeholder="您的姓名"
              required
            />
          </div>

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
              placeholder="至少 6 個字元"
              required
            />
          </div>

          <div>
            <label className="block text-[#5e6c84] text-sm font-medium mb-2">
              確認密碼
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={theme.input}
              placeholder="再次輸入密碼"
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
                註冊中...
              </>
            ) : (
              '註冊'
            )}
          </button>

          <div className="text-center pt-4 border-t border-[#dfe1e6]">
            <p className={theme.body}>
              已經有帳號？{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#0052cc] hover:text-[#0747a6] font-medium"
              >
                登入
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
