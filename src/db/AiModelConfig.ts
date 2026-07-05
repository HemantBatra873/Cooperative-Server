import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in the environment.");
}

export const genAI = new GoogleGenAI({ apiKey });

export const SYSTEM_INSTRUCTION = "You are a helpful assistant.";