import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Gemini API keys are supplied by the server environment only.
 * Supported names: GEMINI_API_KEY_1 ... GEMINI_API_KEY_4.
 * GEMINI_API_KEY is also supported as a single-key fallback.
 */
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY,
  process.env.Gemini_API_Key_1,
  process.env.Gemini_API_Key_2,
  process.env.Gemini_API_Key_3,
  process.env.Gemini_API_Key_4,
].filter((key): key is string => Boolean(key?.trim()));

export const GEMINI_API_KEY = API_KEYS[0] || '';
export const GEMINI_API_KEY_COUNT = API_KEYS.length;

const clients = API_KEYS.map((apiKey) => new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: { 'User-Agent': 'aura-ai-render' },
  },
}));

let nextKeyIndex = 0;

function keyOrder() {
  if (clients.length === 0) return [];
  const start = nextKeyIndex % clients.length;
  nextKeyIndex = (nextKeyIndex + 1) % clients.length;
  return Array.from({ length: clients.length }, (_, i) => (start + i) % clients.length);
}

function isRetryableKeyError(err: any) {
  const status = err?.status ?? err?.code;
  const message = String(err?.message || '').toLowerCase();
  return status === 401 || status === 403 || status === 429 ||
    message.includes('401') || message.includes('403') || message.includes('429') ||
    message.includes('quota') || message.includes('rate limit') ||
    message.includes('resource exhausted') || message.includes('api key');
}

async function withKeyRotation<T>(operation: (client: GoogleGenAI) => Promise<T>): Promise<T> {
  if (clients.length === 0) {
    throw new Error('No Gemini API key configured. Add GEMINI_API_KEY_1 through GEMINI_API_KEY_4 in Render Environment Variables.');
  }

  let lastError: any;
  for (const index of keyOrder()) {
    try {
      return await operation(clients[index]);
    } catch (err) {
      lastError = err;
      if (!isRetryableKeyError(err)) throw err;
    }
  }
  throw lastError || new Error('All configured Gemini API keys failed.');
}

export interface ChatMessagePart {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface StreamChatOptions {
  model?: string;
  contents: ChatMessagePart[];
  systemInstruction?: string;
  enableSearch?: boolean;
}

/** Gemini 3.8 Flash no longer accepts legacy temperature/top_p/top_k settings. */
export async function streamGeminiChat(options: StreamChatOptions) {
  const {
    model = 'gemini-3.8-flash',
    contents,
    systemInstruction,
    enableSearch = false,
  } = options;

  const config: Record<string, any> = {};
  if (systemInstruction) config.systemInstruction = systemInstruction;
  if (enableSearch) config.tools = [{ googleSearch: {} }];

  if (clients.length === 0) {
    throw new Error('No Gemini API key configured.');
  }

  let lastError: any;
  for (const index of keyOrder()) {
    try {
      return await clients[index].models.generateContentStream({
        model,
        contents,
        config,
      });
    } catch (err) {
      lastError = err;
      if (!isRetryableKeyError(err)) throw err;
    }
  }
  throw lastError || new Error('All configured Gemini API keys failed.');
}

export async function generateGeminiText(
  promptOrContents: string | ChatMessagePart[],
  systemInstruction?: string,
  enableSearch = false,
) {
  const config: Record<string, any> = {};
  if (systemInstruction) config.systemInstruction = systemInstruction;
  if (enableSearch) config.tools = [{ googleSearch: {} }];

  return withKeyRotation((client) => client.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: promptOrContents,
    config,
  }));
}

export async function generateGeminiSpeech(text: string, voiceName = 'Kore') {
  return withKeyRotation((client) => client.models.generateContent({
    model: 'gemini-3.8-flash-lite-tts',
    contents: [{
      role: 'user',
      parts: [{
        text,
        speechMetadata: {
          style: 'Clear, warm, friendly and articulate female teacher',
        },
      }],
    }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  }));
}

export async function generateGeminiStructuredJson<T = any>(prompt: string): Promise<T | null> {
  const response = await withKeyRotation((client) => client.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  }));

  if (!response.text) return null;
  return JSON.parse(response.text) as T;
}
