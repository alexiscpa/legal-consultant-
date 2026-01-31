import { StoredContract, LegalScenario, ChatMessage } from '../types';
import { getAuthHeaders } from './authService';

// Use VITE_API_URL if set, otherwise use production URL
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://gwt-legal-consultant.zeabur.app' : '');

const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders(),
});

export const storageService = {
  // Contracts
  saveContract: async (contract: Omit<StoredContract, 'id' | 'timestamp'>): Promise<StoredContract> => {
    const response = await fetch(`${API_URL}/api/contracts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(contract),
    });
    if (!response.ok) throw new Error('Failed to save contract');
    return response.json();
  },

  getContracts: async (): Promise<StoredContract[]> => {
    const response = await fetch(`${API_URL}/api/contracts`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch contracts');
    return response.json();
  },

  deleteContract: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/contracts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete contract');
  },

  // Scenarios
  saveScenario: async (scenario: Omit<LegalScenario, 'id' | 'timestamp'>): Promise<LegalScenario> => {
    const response = await fetch(`${API_URL}/api/scenarios`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(scenario),
    });
    if (!response.ok) throw new Error('Failed to save scenario');
    return response.json();
  },

  getScenarios: async (): Promise<LegalScenario[]> => {
    const response = await fetch(`${API_URL}/api/scenarios`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch scenarios');
    return response.json();
  },

  deleteScenario: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/scenarios/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete scenario');
  },

  // Chats
  saveChat: async (messages: ChatMessage[]): Promise<void> => {
    const response = await fetch(`${API_URL}/api/chats`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(messages),
    });
    if (!response.ok) throw new Error('Failed to save chat');
  },

  getChat: async (): Promise<ChatMessage[]> => {
    const response = await fetch(`${API_URL}/api/chats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch chat');
    return response.json();
  },

  clearChat: async (): Promise<void> => {
    const response = await fetch(`${API_URL}/api/chats`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to clear chat');
  },

  // System - These remain client-side for export/import functionality
  getStorageUsage: () => {
    return 'N/A (using database)';
  },

  clearAll: async () => {
    const headers = getAuthHeaders();
    await Promise.all([
      fetch(`${API_URL}/api/contracts`, { method: 'DELETE', headers }).catch(() => {}),
      fetch(`${API_URL}/api/scenarios`, { method: 'DELETE', headers }).catch(() => {}),
      fetch(`${API_URL}/api/chats`, { method: 'DELETE', headers }).catch(() => {}),
    ]);
  },

  exportData: async () => {
    const [contracts, scenarios, chats] = await Promise.all([
      storageService.getContracts(),
      storageService.getScenarios(),
      storageService.getChat(),
    ]);
    const data = {
      contracts,
      scenarios,
      chats,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LegalPro_Backup_${new Date().toLocaleDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData: async (json: string): Promise<boolean> => {
    try {
      const data = JSON.parse(json);
      const promises = [];
      const headers = getHeaders();

      if (data.contracts) {
        for (const contract of data.contracts) {
          promises.push(
            fetch(`${API_URL}/api/contracts`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                title: contract.title,
                content: contract.content,
                result: contract.result,
              }),
            })
          );
        }
      }

      if (data.scenarios) {
        for (const scenario of data.scenarios) {
          promises.push(
            fetch(`${API_URL}/api/scenarios`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                title: scenario.title,
                category: scenario.category,
                description: scenario.description,
                advice: scenario.advice,
              }),
            })
          );
        }
      }

      if (data.chats) {
        promises.push(
          fetch(`${API_URL}/api/chats`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data.chats),
          })
        );
      }

      await Promise.all(promises);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};
