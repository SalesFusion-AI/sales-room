import React, { useState } from 'react';
import { MessageSquare, FileText, BarChart3, Settings, Menu, X } from 'lucide-react';

interface NavigationProps {
  currentView: 'chat' | 'transcripts' | 'analytics' | 'settings';
  onViewChange: (view: 'chat' | 'transcripts' | 'analytics' | 'settings') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'chat' as const, label: 'Sales Room', icon: MessageSquare, description: 'Interactive chat interface' },
    { id: 'transcripts' as const, label: 'Transcripts', icon: FileText, description: 'View conversation history' },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3, description: 'Performance metrics' },
    { id: 'settings' as const, label: 'Settings', icon: Settings, description: 'Configure system' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-lg rounded-lg p-2 text-gray-600 hover:text-gray-900"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform z-40
        lg:transform-none lg:relative lg:w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">SalesFusion</h1>
            <p className="text-sm text-gray-600">Sales Room</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            <ul className="space-y-2 px-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onViewChange(item.id);
                        setIsOpen(false); // Close mobile menu
                      }}
                      className={`
                        w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>Sprint 9 Complete</p>
              <p>Transcripts + Logging</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;