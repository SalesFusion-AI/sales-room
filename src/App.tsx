import { useEffect } from 'react';
import ChatInterface from './components/Chat/ChatInterface';
import Header from './components/Layout/Header';
import CompanyEnrichment from './components/CompanyEnrichment/CompanyEnrichment';
import QualificationStatus from './components/Qualification/QualificationStatus';
import ConnectNow from './components/Connect/ConnectNow';
import { useChatStore, useQualificationStatus, useBrandConfig } from './store/chatStore';
import { handoffService } from './services/handoffService';
import type { BrandConfig, HandoffConfig, SalesRep } from './types';

// Demo brand configuration - would come from API based on client
const DEMO_BRAND_CONFIG: BrandConfig = {
  id: 'demo',
  clientId: 'salesfusion-demo',
  branding: {
    logoUrl: undefined, // Would be client's logo
    colors: {
      primary: '#3b82f6', // Blue
      secondary: '#64748b', // Slate  
      accent: '#d946ef', // Purple
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  messaging: {
    welcomeMessage: 'Hi! I\'m here to help you learn about our solution 👋',
    companyCta: 'Tell me about your company',
    qualificationCta: 'Let\'s see if we\'re a good fit',
    connectCta: 'Ready to speak with our team?',
    offlineMessage: 'Our team is currently offline, but I can still help answer your questions!',
  },
  features: {
    showCompanyEnrichment: true,
    requireQualification: true,
    allowDirectConnect: false,
    captureEmail: true,
    showPricing: true,
  },
};

// Demo handoff configuration
const DEMO_HANDOFF_CONFIG: HandoffConfig = {
  enableTalkNow: true,
  enableSlackNotifications: true,
  slackConfig: {
    channel: '#sales-leads',
    mentionUsers: ['USLACKID123'], // Replace with real Slack user IDs
    webhookUrl: 'https://hooks.slack.com/services/your/webhook/url', // Replace with real webhook
  },
  availabilitySources: ['calendar', 'slack', 'manual'],
  defaultCalendarUrl: 'https://calendly.com/your-team/15min',
  scoreThresholdForHandoff: 75,
  businessHours: {
    timezone: 'America/New_York',
    days: {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '10:00', end: '14:00', enabled: false },
      sunday: { start: '10:00', end: '14:00', enabled: false }
    }
  }
};

// Demo sales reps - would come from API/CRM
const DEMO_SALES_REPS: SalesRep[] = [
  {
    id: 'rep-1',
    name: 'Sarah Johnson',
    title: 'Senior Sales Consultant',
    email: 'sarah.j@company.com',
    slackUserId: 'USLACK123',
    calendarUrl: 'https://calendly.com/sarah-j/15min',
    timezone: 'America/New_York',
    isActive: true,
  },
  {
    id: 'rep-2', 
    name: 'Michael Chen',
    title: 'Sales Executive',
    email: 'michael.c@company.com',
    slackUserId: 'USLACK456',
    calendarUrl: 'https://calendly.com/michael-c/15min',
    timezone: 'America/New_York',
    isActive: true,
  }
];

function App() {
  const { setBrandConfig, addMessage, setHandoffConfig } = useChatStore();
  const qualificationStatus = useQualificationStatus();
  const brandConfig = useBrandConfig();
  
  useEffect(() => {
    // Initialize with demo brand config
    setBrandConfig(DEMO_BRAND_CONFIG);
    
    // Initialize handoff configuration
    setHandoffConfig(DEMO_HANDOFF_CONFIG);
    handoffService.updateReps(DEMO_SALES_REPS);
    
    // Add welcome message
    setTimeout(() => {
      addMessage(
        DEMO_BRAND_CONFIG.messaging.welcomeMessage,
        'assistant',
        { type: 'general' }
      );
    }, 500);
  }, [setBrandConfig, addMessage, setHandoffConfig]);
  
  if (!brandConfig) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with branding */}
      <Header brandConfig={brandConfig} />
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <ChatInterface />
            </div>
          </div>
          
          {/* Sidebar with additional features */}
          <div className="space-y-4">
            {/* Company Enrichment */}
            {brandConfig.features.showCompanyEnrichment && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <CompanyEnrichment />
              </div>
            )}
            
            {/* Qualification Status */}
            {brandConfig.features.requireQualification && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <QualificationStatus />
              </div>
            )}
            
            {/* Connect Now */}
            {(qualificationStatus.readyToConnect || brandConfig.features.allowDirectConnect) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <ConnectNow />
              </div>
            )}
            
            {/* Company Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">About Us</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  We help businesses like yours streamline operations and grow revenue 
                  through innovative solutions.
                </p>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Our team is online</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Why Companies Trust Us</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>500+ happy customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>99.9% uptime guarantee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;