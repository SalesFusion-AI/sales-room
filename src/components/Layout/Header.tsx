import React from 'react';
import { BrandConfig } from '../../types';

interface HeaderProps {
  brandConfig: BrandConfig;
}

const Header: React.FC<HeaderProps> = ({ brandConfig }) => {
  return (
    <header 
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
      style={{
        borderBottomColor: `${brandConfig.branding.colors.primary}20`,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center space-x-3">
            {brandConfig.branding.logoUrl ? (
              <img
                src={brandConfig.branding.logoUrl}
                alt="Company Logo"
                className="h-8 w-auto"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: brandConfig.branding.colors.primary }}
              >
                S
              </div>
            )}
            <div>
              <h1 
                className="text-lg font-semibold"
                style={{ color: brandConfig.branding.colors.primary }}
              >
                SalesFusion
              </h1>
              <p className="text-xs text-gray-500">
                AI Sales Assistant
              </p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 hidden sm:inline">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;