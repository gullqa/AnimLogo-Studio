
import { GoogleGenAI } from "@google/genai";
import { LogoConfig, AnimationConfig } from "../types";

export const generateLogo = async (config: LogoConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `A professional, high-quality, modern minimalist corporate logo for: ${config.prompt}. Clean lines, vector style, white background.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio,
        imageSize: config.imageSize
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in response");
};

export const animateLogo = async (
  baseImageBase64: string, 
  config: AnimationConfig,
  onProgress?: (status: string) => void
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Strip the prefix if present
  const base64Data = baseImageBase64.replace(/^data:image\/\w+;base64,/, "");

  onProgress?.("Initiating video generation...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: config.prompt,
    image: {
      imageBytes: base64Data,
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: config.resolution,
      aspectRatio: config.aspectRatio
    }
  });

  onProgress?.("Processing video (this may take a minute)...");
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 8000));
    try {
      operation = await ai.operations.getVideosOperation({ operation });
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("API_KEY_EXPIRED");
      }
      throw error;
    }
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");

  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};
