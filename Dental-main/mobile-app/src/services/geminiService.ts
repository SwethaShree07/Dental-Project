import { GoogleGenAI, Type } from "@google/genai";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const STORAGE_KEY = 'gemini_api_key';

export const getApiKey = async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  
  return (
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    ""
  );
};

export const setStoredApiKey = async (key: string) => {
  await AsyncStorage.setItem(STORAGE_KEY, key);
};

export const clearStoredApiKey = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

const getAIInstance = async () => {
  const apiKey = await getApiKey();
  return new GoogleGenAI({ apiKey });
};

export const analyzeDentalInfection = async (base64Image: string) => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error("API Key not configured");
    }
    const aiInstance = await getAIInstance();
    const response = await aiInstance.models.generateContent({
      model: "gemini-1.5-flash", // Using stable version name
      contents: [
        {
          parts: [
            { text: "Analyze this dental image for potential infections or issues. Provide a brief detection summary and 3 clear prevention tips. Return the response in JSON format." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detection: { type: Type.STRING },
            prevention: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["detection", "prevention"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      detection: "Unable to analyze image clearly. Please consult a doctor.",
      prevention: ["Maintain regular brushing", "Use dental floss", "Schedule a professional checkup"]
    };
  }
};

export const chatWithAI = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      return "AI assistant is not configured yet. Add EXPO_PUBLIC_GEMINI_API_KEY to your environment, or use the settings to save it.";
    }

    const aiInstance = await getAIInstance();
    const chat = aiInstance.chats.create({
      model: "gemini-1.5-flash",
      config: {
        systemInstruction: "You are a helpful AI Dental Assistant for Alpha Dent. You provide advice on dental hygiene, explain procedures, and help patients understand their symptoms. Always remind patients to consult their actual dentist for professional diagnosis. Keep responses concise and friendly."
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later or contact your dentist directly.";
  }
};
