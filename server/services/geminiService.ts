import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
console.log('Gemini API Key configured:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
const genAI = new GoogleGenerativeAI(apiKey);

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache

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

function getCacheKey(type: string, content: string): string {
  return `${type}:${content.substring(0, 200)}`;
}

function getFromCache(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function getScenarioAdvice(scenario: string): Promise<{ text: string; sources: any[] }> {
  const cacheKey = getCacheKey('scenario', scenario);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('Returning cached scenario advice');
    return cached;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const prompt = `身為資深法務長，請針對以下管理情境提供法規分析與行動建議。請確認使用的是 2026 年最新台灣法令。

請務必遵守排版規則：每三行文字即分段並空一行。

情境描述：${scenario}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const data = { text, sources: [] };
    setCache(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error('Error fetching scenario advice:', error);
    const errorMessage = error.message || error.toString();
    // 暫時顯示完整錯誤訊息以便除錯
    throw new Error(`Gemini API 錯誤: ${errorMessage}`);
  }
}

export async function reviewContract(contractContent: string): Promise<any> {
  const cacheKey = getCacheKey('contract', contractContent);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('Returning cached contract review');
    return cached;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const prompt = `請以律師角度審查此合約，特別針對「風險規避」與「公司利益」進行深度分析。請考慮 2026 年最新法律環境。

請以 JSON 格式回覆，包含以下欄位：
- summary: 合約核心內容摘要，請遵守每三行分段規則
- risks: 潛在法律與財務風險點（陣列）
- compliance: 是否符合 2026 最新法規規範（陣列）
- recommendations: 具體的條款修改建議（陣列）

合約內容：
${contractContent}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse JSON from response
    let data;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      data = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        summary: text,
        risks: [],
        compliance: [],
        recommendations: []
      };
    } catch {
      data = {
        summary: text,
        risks: [],
        compliance: [],
        recommendations: []
      };
    }

    setCache(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error('Error reviewing contract:', error);
    if (error.status === 429) {
      throw new Error('API 配額已用盡，請稍後再試或聯繫管理員升級方案。');
    }
    throw error;
  }
}

export async function* chatStream(message: string, history: { role: string; content: string }[]): AsyncGenerator<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessageStream(message + "\n\n(提醒：請嚴格遵守每三行即分段並空一行的回覆規範)");

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error: any) {
    console.error('Error in chat stream:', error);
    if (error.status === 429) {
      yield 'API 配額已用盡，請稍後再試或聯繫管理員升級方案。';
    } else {
      yield '發生錯誤，請稍後再試。';
    }
  }
}
