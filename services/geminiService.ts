import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { UserProfile, CareerAdviceResponse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recommendationSchema = {
  type: Type.OBJECT,
  properties: {
    careerPaths: {
      type: Type.ARRAY,
      description: "A list of 3-5 suitable career paths for a Nigerian student.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The name of the career path." },
          description: { type: Type.STRING, description: "A brief description of the career path." },
          courses: {
            type: Type.ARRAY,
            description: "A list of 2-3 relevant university courses for this career.",
            items: { type: Type.STRING }
          }
        },
        required: ["title", "description", "courses"]
      }
    },
    universities: {
      type: Type.ARRAY,
      description: "A list of 5-7 recommended Nigerian universities, mixing Federal, State, and Private options that match the user's budget.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The full name of the university." },
          location: { type: Type.STRING, description: "The city and state where the university is located." },
          type: { type: Type.STRING, description: "The type of university (e.g., Federal, State, Private)." }
        },
        required: ["name", "location", "type"]
      }
    },
    motivation: {
      type: Type.STRING,
      description: "A short, motivational paragraph to encourage the student on their journey, ending with a positive message like 'Remember, success begins with self-awareness. Believe in your path!'"
    }
  },
  required: ["careerPaths", "universities", "motivation"]
};

const systemInstruction = `You are SmartCareer Advisor, a professional Nigerian career counselor designed by Rayyanu Abdullahi (Rayyanu Digital Academy). Your role is to guide students in selecting the right career paths, universities, and courses based on their interests and talents, academic performance, financial situation, preferred region of study, and long-term career goals.

Always be friendly, motivational, and clear.

When recommending schools or courses, use real Nigerian examples such as:
- University of Lagos (UNILAG)
- Bayero University Kano (BUK)
- University of Maiduguri (UNIMAID)
- Ahmadu Bello University (ABU Zaria)
- Federal University of Technology, Minna (FUTMinna)

If the user mentions a budget, recommend schools that fit their range. For example: “Based on your interest in technology and your ₦200,000 budget, consider studying Computer Science at UNIMAID or Software Engineering at FUTMinna.”

End responses with a motivational tone — e.g., “Remember, success begins with self-awareness. Believe in your path!”

For the initial set of recommendations, always return your response in the specified JSON format. For follow-up chat, respond conversationally.`;

export const generateRecommendations = async (profile: UserProfile): Promise<CareerAdviceResponse> => {
  const prompt = `Generate career, course, and university recommendations in Nigeria for a student with these details:
- Strong Subjects: ${profile.subjects.join(', ')}
- Interests: ${profile.interests.join(', ')}
- Financial Capacity: ${profile.budget}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: recommendationSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as CareerAdviceResponse;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw new Error("Failed to get recommendations from AI. Please try again.");
  }
};

export const startChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.8,
        },
    });
};