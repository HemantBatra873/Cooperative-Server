import { NextFunction, Request, Response } from "express";
import User from "../models/user.js";
import { genAI, SYSTEM_INSTRUCTION } from "../db/AiModelConfig.js";

interface ChatMessage {
  role: "user" | "model"; 
  content: string;
}

export const generateChatCompletionGemini = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user)
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });

    const contents = user.chats.map((chat) => ({
      role: chat.role === "user" ? "user" : "model",
      parts: [{ text: chat.content }],
    }));

    contents.push({ role: "user", parts: [{ text: message }] });
    
    user.chats.push({ content: message, role: "user" });

    // Call the stateless generateContent method with the full history
    const response = await genAI.models.generateContent({
      model: "gemini-flash-latest",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    const aiMessage = response.text || "";

    // Update user chats with response
    user.chats.push({ content: aiMessage, role: "model" });
    await user.save();

    return res.status(200).json({ chats: user.chats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    //@ts-ignore
    user.chats = [];
    await user.save();
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};