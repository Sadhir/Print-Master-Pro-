
import { GoogleGenAI } from "@google/genai";

// Always use { apiKey: process.env.API_KEY } for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type MessageType = 'PAYMENT_REMINDER' | 'DISPATCH_READY' | 'ENQUIRY_REPLY' | 'QUOTE_READY' | 'REVIEW_REQUEST' | 'BIRTHDAY_WISH';

export const generateProfessionalMessage = async (type: MessageType, data: any) => {
  try {
    const prompt = `Act as a professional customer relations manager for "PrintMaster Pro", a high-end graphic design and printing shop. Generate a concise, professional message for the following scenario:
    
    Type: ${type}
    Client Name: ${data.customerName}
    Job Title: ${data.jobTitle || 'Your Order'}
    Total Due: ${data.amount || 'N/A'}
    Current Status: ${data.status || 'Active'}
    Business Branch: ${data.branchName || 'Main HQ'}
    ${data.urgency ? `Reminder Window: ${data.urgency}` : ''}
    ${data.platform ? `Review Platform: ${data.platform}` : ''}
    ${data.reviewLink ? `Direct Link: ${data.reviewLink}` : ''}
    
    Rules:
    - Keep it under 150 words.
    - Sound helpful and professional.
    - If it's a review request:
      - For Google/Facebook: Ask for a star rating and mention the provided link.
      - For Video: Request a short video clip sharing their experience.
      - For Text: Ask for a quick reply with their feedback.
    - If it's a birthday wish:
      - Be warm, celebratory, and include a small token of appreciation (e.g., a 10% discount on their next design project).
      - Do not mention specific ages.
    - If it's a payment reminder:
      - Window "15-Day Notice": Be very friendly, just informing them about the upcoming deadline and balance.
      - Window "3-Day Warning": Be professional but more direct, mentioning the job is nearing completion/delivery and funds are needed to finalize.
      - Window "Continuous Follow-up" or "Immediate Overdue": Be polite but firm. Mention the job is ready or overdue and payment is required immediately to avoid delivery delays.
    - If it's dispatch ready, include excitement.
    - Do not use placeholders like [Name], use the provided data.
    - End with "PrintMaster Pro Team".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Hello! Your job with PrintMaster is ready. Please contact us for details.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Hello! Your job with PrintMaster is ready. Please contact us for details.";
  }
};

/**
 * Refines the provided message by checking spelling, grammar, and improving professional tone.
 */
export const refineAndCheckMessage = async (text: string) => {
  try {
    const prompt = `Act as a professional editor. Please check the following message for spelling and grammar errors. 
    Refine it to be more professional, polite, and concise while maintaining the original intent. 
    
    Message: "${text}"
    
    Return ONLY the corrected and refined message text. Do not include explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Refinement Error:", error);
    return text;
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
