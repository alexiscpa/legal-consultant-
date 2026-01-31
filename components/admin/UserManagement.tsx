import { useState, useEffect } from 'react';
import { theme } from '../../theme';
import { User } from '../../types';
import { getUsers, approveUser, rejectUser, deleteUser } from '../../services/authService';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      setActionLoading(userId);
      await approveUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setActionLoading(userId);
      await rejectUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('確定要刪除此使用者嗎？此操作無法復原。')) {
      return;
    }
    try {
      setActionLoading(userId);
      await deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    return user.status === filter;
  });

  const pendingCount = users.filter((u) => u.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className={theme.badgeEmerald}>已核准</span>;
      case 'pending':
        return <span className={theme.badgeAmber}>待審核</span>;
      case 'rejected':
        return <span className={theme.badgeRose}>已拒絕</span>;
      default:
        return <span className={theme.badgeIndigo}>{status}</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <span className={theme.badgeIndigo}>管理者</span>
    ) : (
      <span className="bg-[#f4f5f7] text-[#5e6c84] px-2.5 py-1 rounded text-[10px] font-bold uppercase">
        使用者
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-[#0052cc] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className={theme.body}>載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={theme.sectionGap}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={theme.heading1}>使用者管理</h1>
          <p className={theme.body}>管理系統使用者帳號與審核申請</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-[#fffae6] border border-[#ff8b00] text-[#ff8b00] px-4 py-2 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{pendingCount} 個待審核申請</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#ffebe6] border border-[#ff8f73] text-[#bf2600] px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: '全部' },
          { key: 'pending', label: '待審核' },
          { key: 'approved', label: '已核准' },
          { key: 'rejected', label: '已拒絕' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === key
                ? 'bg-[#0052cc] text-white'
                : 'bg-[#f4f5f7] text-[#5e6c84] hover:bg-[#e6f0ff] hover:text-[#0052cc]'
            }`}
          >
            {label}
            {key === 'pending' && pendingCount > 0 && (
              <span className="ml-2 bg-[#ff8b00] text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className={theme.card}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f4f5f7] border-b border-[#dfe1e6]">
              <tr>
                <th className="text-left px-6 py-4 text-[#5e6c84] text-xs font-bold uppercase tracking-wider">
                  使用者
                </th>
                <th className="text-left px-6 py-4 text-[#5e6c84] text-xs font-bold uppercase tracking-wider">
                  角色
                </th>
                <th className="text-left px-6 py-4 text-[#5e6c84] text-xs font-bold uppercase tracking-wider">
                  狀態
                </th>
                <th className="text-left px-6 py-4 text-[#5e6c84] text-xs font-bold uppercase tracking-wider">
                  註冊時間
                </th>
                <th className="text-right px-6 py-4 text-[#5e6c84] text-xs font-bold uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfe1e6]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className={theme.body}>沒有符合條件的使用者</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f4f5f7] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-[#172b4d] font-medium">{user.name}</p>
                        <p className="text-[#5e6c84] text-sm">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 text-[#5e6c84] text-sm">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(user.id)}
                              disabled={actionLoading === user.id}
                              className="text-[#006644] hover:bg-[#e3fcef] p-2 rounded-lg transition-all disabled:opacity-50"
                              title="核准"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReject(user.id)}
                              disabled={actionLoading === user.id}
                              className="text-[#bf2600] hover:bg-[#ffebe6] p-2 rounded-lg transition-all disabled:opacity-50"
                              title="拒絕"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={actionLoading === user.id}
                            className="text-[#5e6c84] hover:text-[#bf2600] hover:bg-[#ffebe6] p-2 rounded-lg transition-all disabled:opacity-50"
                            title="刪除"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
