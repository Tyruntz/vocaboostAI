// src/utils/chat.ts

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type Content,
} from "@google/generative-ai";


const GEMINI_API_KEY = import.meta.env.PUBLIC_API_KEY 

if (!GEMINI_API_KEY) {
  throw new Error("❌ Gemini API key is missing from the environment variables!");
}


const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

type Role = "user" | "model";

interface MessagePart {
  text: string;
}

export interface ChatMessage { 
  role: Role;
  parts: MessagePart[];
}

/**
 * Sends a message to the Gemini chatbot and returns the response.
 * @param userMessage - The user's input message.
 * @param chatHistory - Previous conversation context in Gemini format.
 * @param systemInstruction - Optional system-level instruction for the model's persona/behavior.
 * @returns AI-generated response as plain text.
 */
export async function sendMessageToChatbot(
  userMessage: string,
  chatHistory: ChatMessage[] = [],
  systemInstruction: string | null = null
): Promise<string> {
  try {
    const conversation: Content[] = [];

    if (systemInstruction) {
      conversation.push({
        role: "user",
        parts: [{ text: `<<SYS>>\n${systemInstruction}\n<</SYS>>` }],
      });

      conversation.push({
        role: "model",
        parts: [{ text: "Baik, saya siap membantu." }],
      });
    }

    
    conversation.push(...chatHistory);


    // 3. Tambahkan pesan user saat ini
    conversation.push({ role: "user", parts: [{ text: userMessage }] });

    const result = await geminiModel.generateContent({
      contents: conversation,
      generationConfig: {
        temperature: 0.7, // Bisa disesuaikan
        maxOutputTokens: 500, // Tingkatkan untuk penjelasan dan contoh yang lebih lengkap
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const responseText = result.response.text();
    return responseText ?? "Maaf, saya tidak mendapatkan respons dari AI. Coba lagi."; // Ubah pesan fallback
  } catch (error) {
    console.error("❌ Failed to send message to chatbot:", error);
    // Pertimbangkan pesan error yang lebih user-friendly dan dalam Bahasa Indonesia
    return "Terjadi kesalahan saat memproses permintaan Anda. Mohon coba lagi nanti.";
  }
}