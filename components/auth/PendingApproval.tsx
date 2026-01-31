import { theme } from '../../theme';
import { User } from '../../types';
import { logout } from '../../services/authService';

interface PendingApprovalProps {
  user: User;
  onLogout: () => void;
}

export function PendingApproval({ user, onLogout }: PendingApprovalProps) {
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const isRejected = user.status === 'rejected';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f5f7] to-[#e6f0ff] px-4">
      <div className={`${theme.card} w-full max-w-md p-8 text-center`}>
        {isRejected ? (
          <>
            <div className="w-20 h-20 bg-[#ffebe6] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#bf2600]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className={`${theme.heading1} mb-3`}>申請未通過</h1>
            <p className={`${theme.body} mb-6`}>
              很抱歉，您的帳號申請未獲批准。如有疑問，請聯繫系統管理員。
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-[#fffae6] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#ff8b00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className={`${theme.heading1} mb-3`}>等待審核中</h1>
            <p className={`${theme.body} mb-6`}>
              您的帳號已註冊成功，正在等待管理員審核。審核通過後，您將可以使用系統的所有功能。
            </p>
            <div className="bg-[#f4f5f7] rounded-lg p-4 mb-6">
              <p className="text-[#5e6c84] text-sm">
                <span className="font-medium">帳號：</span> {user.email}
              </p>
              <p className="text-[#5e6c84] text-sm">
                <span className="font-medium">姓名：</span> {user.name}
              </p>
            </div>
          </>
        )}

        <button
          onClick={handleLogout}
          className={`${theme.btnSecondary} w-full justify-center`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          登出
        </button>
      </div>
    </div>
  );
}
