
export type AppState = 'KEY_SELECTION' | 'DESIGNING' | 'ANIMATING' | 'RESULT';

export interface LogoConfig {
  prompt: string;
  imageSize: '1K' | '2K' | '4K';
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
}

export interface AnimationConfig {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export interface GeneratedAsset {
  imageUrl?: string;
  videoUrl?: string;
  prompt: string;
}

declare global {
  // Define AIStudio interface to match the global type expected by TypeScript for key selection
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // The aistudio property must be of type AIStudio and be declared as readonly to avoid conflicting with existing modifiers
    readonly aistudio: AIStudio;
  }
}
