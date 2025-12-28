
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, LogoConfig, AnimationConfig } from './types';
import { generateLogo, animateLogo } from './services/geminiService';
import { LoadingOverlay } from './components/LoadingOverlay';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('KEY_SELECTION');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [logoConfig, setLogoConfig] = useState<LogoConfig>({
    prompt: '',
    imageSize: '1K',
    aspectRatio: '1:1'
  });

  const [animationConfig, setAnimationConfig] = useState<AnimationConfig>({
    prompt: 'The logo should shine and rotate elegantly in 3D space with gold dust particles.',
    aspectRatio: '16:9',
    resolution: '1080p'
  });

  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const checkKey = useCallback(async () => {
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (hasKey) {
        setAppState('DESIGNING');
      } else {
        setAppState('KEY_SELECTION');
      }
    } catch (err) {
      console.error("Failed to check key:", err);
      setAppState('KEY_SELECTION');
    }
  }, []);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  const handleOpenKeySelector = async () => {
    await window.aistudio.openSelectKey();
    // Assuming success as per instructions
    setAppState('DESIGNING');
  };

  const handleGenerateLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoConfig.prompt) return;
    
    setLoading(true);
    setError(null);
    try {
      const imageUrl = await generateLogo(logoConfig);
      setGeneratedLogo(imageUrl);
      setAppState('ANIMATING');
    } catch (err: any) {
      setError("Failed to generate logo. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimateLogo = async () => {
    if (!generatedLogo) return;
    
    setLoading(true);
    setError(null);
    try {
      const videoUrl = await animateLogo(generatedLogo, animationConfig, (status) => setLoadingMsg(status));
      setGeneratedVideo(videoUrl);
      setAppState('RESULT');
    } catch (err: any) {
      if (err.message === 'API_KEY_EXPIRED') {
        setError("Your API key session might have expired. Please re-select your key.");
        setAppState('KEY_SELECTION');
      } else {
        setError("Failed to animate logo. " + err.message);
      }
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const reset = () => {
    setAppState('DESIGNING');
    setGeneratedLogo(null);
    setGeneratedVideo(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-900 text-slate-100 p-4 md:p-8">
      {loading && <LoadingOverlay isVideo={appState === 'ANIMATING' || !!generatedLogo} statusText={loadingMsg} />}

      <header className="w-full max-w-5xl flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <i className="fas fa-play-circle text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            AnimLogo Studio
          </h1>
        </div>
        {appState !== 'KEY_SELECTION' && (
           <button 
             onClick={handleOpenKeySelector}
             className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
           >
             <i className="fas fa-key"></i> Switch Key
           </button>
        )}
      </header>

      <main className="w-full max-w-3xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-4 duration-300">
            <i className="fas fa-circle-exclamation"></i>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {appState === 'KEY_SELECTION' && (
          <div className="text-center bg-slate-800/50 p-8 md:p-12 rounded-3xl border border-slate-700 backdrop-blur-sm animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <i className="fas fa-shield-halved text-4xl text-indigo-500"></i>
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to AnimLogo Studio</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
              To use the power of Gemini 3 Pro and Veo, you need to select a valid API key from your Google Cloud Project.
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleOpenKeySelector}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
              >
                <i className="fas fa-key"></i>
                Select API Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Learn about billing and requirements
              </a>
            </div>
          </div>
        )}

        {appState === 'DESIGNING' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-slate-700">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <i className="fas fa-pencil-ruler text-indigo-500"></i>
                1. Describe Your Logo
              </h2>
              <form onSubmit={handleGenerateLogo} className="space-y-6">
                <div>
                  <textarea
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600 h-32 resize-none"
                    placeholder="E.g. A sleek tech startup called 'Aura' using minimalist geometric shapes..."
                    value={logoConfig.prompt}
                    onChange={(e) => setLogoConfig({ ...logoConfig, prompt: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Quality / Size</label>
                    <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
                      {(['1K', '2K', '4K'] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setLogoConfig({ ...logoConfig, imageSize: size })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            logoConfig.imageSize === size ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Aspect Ratio</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={logoConfig.aspectRatio}
                      onChange={(e) => setLogoConfig({ ...logoConfig, aspectRatio: e.target.value as any })}
                    >
                      <option value="1:1">1:1 Square</option>
                      <option value="4:3">4:3 Landscape</option>
                      <option value="16:9">16:9 Cinematic</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!logoConfig.prompt}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 mt-4"
                >
                  <i className="fas fa-wand-magic-sparkles"></i>
                  Generate Static Logo
                </button>
              </form>
            </div>
          </div>
        )}

        {appState === 'ANIMATING' && generatedLogo && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-slate-700">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <i className="fas fa-film text-indigo-500"></i>
                2. Animate Your Brand
              </h2>
              
              <div className="mb-8 relative group">
                <div className="aspect-square bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center">
                  <img src={generatedLogo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                </div>
                <button 
                  onClick={() => setAppState('DESIGNING')}
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur hover:bg-black/80 p-2 rounded-lg text-xs font-medium transition-all border border-white/10"
                >
                  <i className="fas fa-undo mr-1"></i> Redesign
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Animation Style</label>
                  <textarea
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600 h-24 resize-none"
                    placeholder="How should the logo move?"
                    value={animationConfig.prompt}
                    onChange={(e) => setAnimationConfig({ ...animationConfig, prompt: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Video Aspect Ratio</label>
                    <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
                      {(['16:9', '9:16'] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setAnimationConfig({ ...animationConfig, aspectRatio: ratio })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            animationConfig.aspectRatio === ratio ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {ratio === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Target Resolution</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={animationConfig.resolution}
                      onChange={(e) => setAnimationConfig({ ...animationConfig, resolution: e.target.value as any })}
                    >
                      <option value="1080p">1080p (High Quality)</option>
                      <option value="720p">720p (Faster)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleAnimateLogo}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-video"></i>
                  Render Animation
                </button>
              </div>
            </div>
          </div>
        )}

        {appState === 'RESULT' && generatedVideo && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-500"></i>
                  Animation Ready!
                </h2>
                <button 
                  onClick={reset}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-all"
                >
                  Start New Project
                </button>
              </div>
              
              <div className="mb-8 rounded-2xl overflow-hidden border border-slate-700 bg-black shadow-2xl">
                <video 
                  src={generatedVideo} 
                  controls 
                  autoPlay 
                  loop 
                  className={`w-full max-h-[60vh] mx-auto object-contain ${animationConfig.aspectRatio === '9:16' ? 'max-w-[350px]' : ''}`} 
                />
              </div>

              <div className="flex gap-4">
                <a
                  href={generatedVideo}
                  download="company_logo_animation.mp4"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-download"></i>
                  Download MP4
                </a>
                <button
                  onClick={reset}
                  className="px-8 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-slate-500 text-sm text-center">
        <p>Built with Gemini 3 Pro & Veo &middot; AnimLogo Studio &copy; 2024</p>
      </footer>
    </div>
  );
};

export default App;
