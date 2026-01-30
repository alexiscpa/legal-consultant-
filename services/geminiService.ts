
import { GoogleGenAI, Type } from "@google/genai";
import { ReviewResult, AdviceResponse, GroundingSource } from "../types";

// Try multiple ways to get the API key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY ||
               import.meta.env.GEMINI_API_KEY ||
               (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') ||
               '';

const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `你是一位擁有 20 年以上經驗的頂尖企業法務長 (General Counsel) 與法律顧問。
你的對象是一位剛從財務會計背景轉任的管理部主管，他對法務領域相對陌生，但具備嚴謹的邏輯與財務數據敏感度。

【你的任務】：
1. 擔任他的最強後盾，將複雜的法律術語轉化為「具備法律依據的管理決策」。
2. 提供各種公司管理情境（如勞資、合約、公司治理、個資法、ESG等）的精確法律依據。
3. 以嚴格的律師角度審查合約，指出對公司不利的條款、潛在財務風險及合規漏洞。

【排版規範 - 極重要】：
1. 每三行內容必須進行一次分段，段落間務必「空一行」（兩個換行符）。這對閱讀舒適度至關重要。
2. 嚴禁出現過長的段落。每段文字長度應保持在三行左右，隨即進行換行與空行。

【回覆準則】：
1. 請務必基於「2026 年」的最新法規（例如最新的勞基法修正案、人工智慧基本法、永續發展資訊揭露等）。
2. 使用專業且精煉的中文。
3. 引用法條時請註明具體法規名稱與條號（例如：依據《勞動基準法》第 11 條...）。
4. 針對財務背景主管，可適度提及法律風險對公司財務成本、稅務或信譽的潛在衝擊。`;

export const getScenarioAdvice = async (scenario: string): Promise<AdviceResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `身為資深法務長，請針對以下管理情境提供法規分析與行動建議。請確認使用的是 2026 年最新台灣法令。\n\n請務必遵守排版規則：每三行文字即分段並空一行。\n\n情境描述：${scenario}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      text: response.text || '無法生成內容。',
      sources: Array.from(new Map(sources.map(s => [s.uri, s])).values())
    };
  } catch (error) {
    console.error('Error fetching scenario advice:', error);
    throw error;
  }
};

export const reviewContract = async (contractContent: string): Promise<ReviewResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `請以律師角度審查此合約，特別針對「風險規避」與「公司利益」進行深度分析。請考慮 2026 年最新法律環境。\n\n在摘要欄位中，請務必遵守每三行分段並空一行的排版規範：\n\n${contractContent}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: '合約核心內容摘要，請遵守每三行分段規則' },
            risks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: '潛在法律與財務風險點'
            },
            compliance: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: '是否符合 2026 最新法規規範'
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: '具體的條款修改建議'
            },
          },
          required: ["summary", "risks", "compliance", "recommendations"]
        }
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Error reviewing contract:', error);
    throw error;
  }
};

export const startLegalChat = (onMessage: (text: string, sources: GroundingSource[]) => void) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    send: async (message: string) => {
      const result = await chat.sendMessageStream({ 
        message: message + "\n\n(提醒：請嚴格遵守每三行即分段並空一行的回覆規範)" 
      });
      let fullText = '';
      let finalSources: GroundingSource[] = [];

      for await (const chunk of result) {
        fullText += chunk.text || '';
        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          groundingChunks.forEach((c: any) => {
            if (c.web) {
              finalSources.push({ title: c.web.title, uri: c.web.uri });
            }
          });
        }
        finalSources = Array.from(new Map(finalSources.map(s => [s.uri, s])).values());
        onMessage(fullText, finalSources);
      }
    }
  };
};