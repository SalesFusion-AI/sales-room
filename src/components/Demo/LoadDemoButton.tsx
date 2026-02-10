import { useState } from 'react';
import { Play, Zap, Sparkles } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

const LoadDemoButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const loadDemoScenario = useChatStore(s => s.loadDemoScenario);
  const messages = useChatStore(s => s.messages);
  
  // Only show if there's just the initial message
  if (messages.length > 1) return null;

  const handleLoadDemo = async () => {
    setIsLoading(true);
    await loadDemoScenario();
    setIsLoading(false);
  };

  return (
    <div className="mx-4 mb-4">
      <div className="text-center">
        <button
          onClick={handleLoadDemo}
          disabled={isLoading}
          className={`group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-400 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${
            isLoading ? 'animate-pulse' : 'hover:scale-105'
          }`}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 blur-lg opacity-50 -z-10 group-hover:opacity-70 transition-opacity duration-300" />
          
          <div className="flex items-center justify-center h-8 w-8 bg-white/20 rounded-full">
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </div>
          
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="font-bold">Load Demo Scenario</span>
              <Sparkles className="h-3 w-3 opacity-75" />
            </div>
            <span className="text-xs opacity-90 font-normal">
              See a qualified prospect conversation
            </span>
          </div>
          
          <Zap className="h-4 w-4 opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
        
        <p className="text-xs text-gray-400 mt-2">
          Perfect for demos • Shows qualification in action
        </p>
      </div>
    </div>
  );
};

export default LoadDemoButton;