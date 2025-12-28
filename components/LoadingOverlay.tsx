
import React, { useState, useEffect } from 'react';

const messages = [
  "Mixing the paint...",
  "Sharpening the pixels...",
  "Consulting the design oracle...",
  "Applying digital gold...",
  "Finalizing vector paths...",
  "Injecting brand energy..."
];

const videoMessages = [
  "Rendering frames...",
  "Adding motion physics...",
  "Synchronizing animations...",
  "Polishing visual transitions...",
  "Baking cinematic lighting...",
  "Almost there! Just a few more seconds..."
];

export const LoadingOverlay: React.FC<{ isVideo?: boolean, statusText?: string }> = ({ isVideo, statusText }) => {
  const [msgIdx, setMsgIdx] = useState(0);
  const currentList = isVideo ? videoMessages : messages;

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % currentList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentList]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className={`fas ${isVideo ? 'fa-film' : 'fa-wand-magic-sparkles'} text-indigo-400 text-2xl animate-pulse`}></i>
        </div>
      </div>
      <p className="mt-8 text-xl font-medium text-white">{statusText || currentList[msgIdx]}</p>
      <p className="mt-2 text-sm text-slate-400">This might take a moment, stay with us.</p>
    </div>
  );
};
