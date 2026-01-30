import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ChatInterface from './components/Chat/ChatInterface';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import LoadingState from './components/Layout/LoadingState';
import ErrorBoundary from './components/Layout/ErrorBoundary';
import CompanyEnrichment from './components/CompanyEnrichment/CompanyEnrichment';
import QualificationStatus from './components/Qualification/QualificationStatus';
import ConnectNow from './components/Connect/ConnectNow';
import TranscriptList from './components/Transcript/TranscriptList';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import OnboardingWizard from './components/Onboarding/OnboardingWizard';
import { useChatStore, useQualificationStatus, useBrandConfig, useHasUnsavedChanges } from './store/chatStore';
import { handoffService } from './services/handoffService';
import { crmService } from './services/crmService';
import { demoService } from './demo/demoService';
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
  const { 
    setBrandConfig, 
    addMessage, 
    setHandoffConfig, 
    continueConversationByEmail,
    saveTranscript 
  } = useChatStore();
  const qualificationStatus = useQualificationStatus();
  const brandConfig = useBrandConfig();
  const hasUnsavedChanges = useHasUnsavedChanges();
  
  const [currentView, setCurrentView] = useState<'chat' | 'transcripts' | 'analytics' | 'settings'>('chat');
  const [prospectEmail, setProspectEmail] = useState<string>('');
  const [demoInitialized, setDemoInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);

        // Initialize with demo brand config
        setBrandConfig(DEMO_BRAND_CONFIG);
        
        // Initialize handoff configuration
        setHandoffConfig(DEMO_HANDOFF_CONFIG);
        handoffService.updateReps(DEMO_SALES_REPS);
        
        // Initialize CRM service
        crmService.updateConfig({
          provider: 'custom',
          autoSync: true,
          syncTriggers: ['qualified', 'handoff'],
          baseUrl: 'https://api.example.com/crm', // Demo URL
        });

        // Check if we should auto-initialize demo (for webinar)
        const urlParams = new URLSearchParams(window.location.search);
        const isDemoMode = urlParams.get('demo') === 'true' || window.location.hostname.includes('demo');
        
        if (isDemoMode) {
          try {
            await demoService.initializeDemoEnvironment();
            setDemoInitialized(true);
            console.log('🎬 Demo environment ready for webinar!');
          } catch (error) {
            console.error('Failed to initialize demo:', error);
            setInitError('Demo initialization failed');
          }
        }
        
        // Check for returning prospect via URL params
        const email = urlParams.get('email');
        
        if (email) {
          setProspectEmail(email);
          // Try to continue existing conversation
          const found = await continueConversationByEmail(email);
          if (!found) {
            // New prospect, add welcome message
            setTimeout(() => {
              addMessage(
                DEMO_BRAND_CONFIG.messaging.welcomeMessage,
                'assistant',
                { type: 'general' }
              );
            }, 500);
          }
        } else {
          // Add welcome message for new session
          setTimeout(() => {
            addMessage(
              DEMO_BRAND_CONFIG.messaging.welcomeMessage,
              'assistant',
              { type: 'general' }
            );
          }, 500);
        }
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError('Application initialization failed');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
    
    // Auto-save on page unload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        saveTranscript();
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
  
  // Show loading state during initialization
  if (isInitializing || !brandConfig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingState 
          type="default" 
          message={demoInitialized ? "Setting up demo environment..." : "Initializing Sales Room..."}
          showProgress={demoInitialized}
          progress={demoInitialized ? 85 : 45}
        />
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Initialization Error</h2>
            <p className="text-sm text-gray-600 mb-4">{initError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render different views
  const renderCurrentView = () => {
    switch (currentView) {
      case 'transcripts':
        return <TranscriptList showViewer={true} />;
      
      case 'analytics':
        return <AnalyticsDashboard />;
      
      case 'settings':
        return <OnboardingWizard />;
        
      default: // 'chat'
        return (
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
                {brandConfig?.features.showCompanyEnrichment && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <CompanyEnrichment />
                  </div>
                )}
                
                {/* Qualification Status */}
                {brandConfig?.features.requireQualification && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <QualificationStatus />
                  </div>
                )}
                
                {/* Connect Now */}
                {(qualificationStatus.readyToConnect || brandConfig?.features.allowDirectConnect) && (
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
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Navigation */}
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Header with branding */}
          <Header brandConfig={brandConfig} />
          
          {/* Demo Mode Indicator */}
          {demoInitialized && (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
              <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-medium">🎬 DEMO MODE ACTIVE</span>
                  <span className="opacity-75">- Ready for Feb 21 webinar presentation</span>
                </div>
                <button
                  onClick={() => demoService.startWebinar()}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors"
                >
                  Start Webinar Mode
                </button>
              </div>
            </div>
          )}
          
          {/* Current View Content */}
          <div className="flex-1 overflow-auto">
            <ErrorBoundary>
              {renderCurrentView()}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;