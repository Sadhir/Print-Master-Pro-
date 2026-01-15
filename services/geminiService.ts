
import { GoogleGenAI } from "@google/genai";

// Always use { apiKey: process.env.API_KEY } for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfessionalMessage = async (type: string, data: any) => {
  try {
    const prompt = `Generate a professional WhatsApp message for a printing business. 
    Message Type: ${type}
    Client Name: ${data.customerName}
    Job Title: ${data.jobTitle}
    Amount: ${data.amount}
    Status: ${data.status}
    Keep it concise, friendly, and include a call to action. Use emojis sparingly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Message generation failed. Please try again.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Hello! Your job with PrintMaster is ready for review. Please contact us for details.";
  }
};

export const analyzeSalesTrends = async (history: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these recent sales data summaries and provide 3 quick actionable insights for a printing shop: ${history}`,
    });
    return response.text;
  } catch (error) {
    return "Keep focusing on high-margin design services and seasonal banner printing.";
  }
};
