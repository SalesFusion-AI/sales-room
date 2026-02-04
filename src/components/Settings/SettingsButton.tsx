import React from 'react';
import { Settings } from 'lucide-react';

interface SettingsButtonProps {
  onClick: () => void;
  className?: string;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open settings"
      className={`inline-flex items-center justify-center rounded-xl border border-gray-700 bg-gray-800/70 p-2.5 text-gray-300 transition hover:border-gray-600 hover:bg-gray-700 hover:text-white ${className ?? ''}`}
    >
      <Settings className="h-5 w-5" />
    </button>
  );
};

export default SettingsButton;
