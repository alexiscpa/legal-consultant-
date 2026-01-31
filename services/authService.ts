import { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://legalpro-backend.zeabur.app';

const TOKEN_KEY = 'legalpro_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  user: User;
}

interface MeResponse {
  user: User;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  setToken(data.token);
  return data;
};

export const register = async (email: string, password: string, name: string): Promise<RegisterResponse> => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
};

export const logout = async (): Promise<void> => {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }
  removeToken();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        return null;
      }
      throw new Error('Failed to get current user');
    }

    const data: MeResponse = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get current user failed:', error);
    removeToken();
    return null;
  }
};

// Admin user management functions
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/api/users`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch users');
  }

  const data = await response.json();
  return data.users;
};

export const getPendingUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/api/users/pending`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch pending users');
  }

  const data = await response.json();
  return data.users;
};

export const approveUser = async (userId: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/users/${userId}/approve`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to approve user');
  }

  const data = await response.json();
  return data.user;
};

export const rejectUser = async (userId: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/users/${userId}/reject`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reject user');
  }

  const data = await response.json();
  return data.user;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }
};
