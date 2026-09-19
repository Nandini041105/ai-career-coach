import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient = null;

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey.trim());
  }
  return geminiClient;
};

/**
 * Strips code blocks and extra markup from AI output to extract clean JSON
 */
export const cleanJsonString = (raw) => {
  if (!raw) return '';
  let cleaned = raw.trim();
  // Remove markdown code fences ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/```\s*$/i, '');
  return cleaned.trim();
};

/**
 * Calls Gemini with prompt and attempts to parse structured JSON response.
 * If API key is missing or call fails, invokes fallbackGenerator seamlessly.
 */
export const callGeminiWithFallback = async (prompt, fallbackGenerator, modelName = 'gemini-1.5-flash') => {
  const client = getGeminiClient();

  if (client) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = JSON.parse(cleanJsonString(text));
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return {
        ...parsed,
        _aiPowered: true,
        _model: modelName
      };
    } catch (apiError) {
      console.warn(`[GeminiService] Gemini API call error: ${apiError.message}. Switching to intelligent fallback generator.`);
    }
  } else {
    console.info('[GeminiService] GEMINI_API_KEY not configured. Using intelligent fallback heuristic generator.');
  }

  // Graceful fallback execution
  if (typeof fallbackGenerator === 'function') {
    const fallbackResult = await fallbackGenerator();
    if (Array.isArray(fallbackResult)) {
      return fallbackResult;
    }
    return {
      ...fallbackResult,
      _aiPowered: false,
      _notice: 'Generated via built-in career heuristics engine. Add GEMINI_API_KEY in backend/.env for live Google Gemini processing.'
    };
  }

  throw new Error('AI analysis service is unavailable and no fallback was specified.');
};
