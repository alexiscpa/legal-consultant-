import { ReviewResult, AdviceResponse, GroundingSource } from "../types";

const API_URL = import.meta.env.VITE_API_URL || 'https://legalpro-backend.zeabur.app';

export const getScenarioAdvice = async (scenario: string): Promise<AdviceResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/gemini/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get advice');
    }

    const result = await response.json();
    return {
      text: result.text || '無法生成內容。',
      sources: result.sources || []
    };
  } catch (error) {
    console.error('Error fetching scenario advice:', error);
    throw error;
  }
};

export const reviewContract = async (contractContent: string): Promise<ReviewResult> => {
  try {
    const response = await fetch(`${API_URL}/api/gemini/contract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: contractContent })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to review contract');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reviewing contract:', error);
    throw error;
  }
};

export const startLegalChat = (onMessage: (text: string, sources: GroundingSource[]) => void) => {
  let history: { role: string; content: string }[] = [];

  return {
    send: async (message: string) => {
      try {
        const response = await fetch(`${API_URL}/api/gemini/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Chat failed');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  onMessage(fullText, []);
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        // Update history
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: fullText });
      } catch (error) {
        console.error('Error in chat:', error);
        throw error;
      }
    }
  };
};
