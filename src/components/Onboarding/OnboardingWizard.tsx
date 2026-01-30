import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Circle,
  Upload,
  Palette,
  Target,
  BookOpen,
  Users,
  Settings,
  ExternalLink,
  Globe,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Building
} from 'lucide-react';
import { demoService } from '../../demo/demoService';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  optional?: boolean;
}

interface OnboardingConfig {
  company: {
    name: string;
    industry: string;
    size: string;
    website: string;
  };
  branding: {
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
  };
  qualification: {
    schema: 'bant' | 'custom';
    scoreThreshold: number;
    customCriteria: any[];
  };
  knowledgeBase: {
    uploadedFiles: number;
    trainedOnContent: boolean;
  };
  salesTeam: {
    members: any[];
    calendarsConnected: number;
  };
  integrations: {
    crm: string;
    slack: boolean;
    calendar: boolean;
  };
  domain: {
    customDomain: string;
    configured: boolean;
  };
}

const OnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<OnboardingConfig>({
    company: {
      name: 'Acme Corp',
      industry: 'Technology',
      size: '50-200 employees',
      website: 'https://acme.com'
    },
    branding: {
      logoUrl: '',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b'
    },
    qualification: {
      schema: 'bant',
      scoreThreshold: 75,
      customCriteria: []
    },
    knowledgeBase: {
      uploadedFiles: 0,
      trainedOnContent: false
    },
    salesTeam: {
      members: [],
      calendarsConnected: 0
    },
    integrations: {
      crm: '',
      slack: false,
      calendar: false
    },
    domain: {
      customDomain: '',
      configured: false
    }
  });
  
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check if we're in demo mode
    setIsDemo(demoService.isDemoActive());
    
    // Load demo onboarding data if available
    if (demoService.isDemoActive()) {
      const demoOnboarding = localStorage.getItem('demo_onboarding');
      if (demoOnboarding) {
        const demoData = JSON.parse(demoOnboarding);
        // Pre-populate with demo data
        setConfig({
          ...config,
          company: {
            name: 'TechFlow Solutions',
            industry: 'Software Development',
            size: '250-500 employees',
            website: 'https://techflow.com'
          },
          branding: {
            logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=60&fit=crop',
            primaryColor: '#2563eb',
            secondaryColor: '#64748b'
          },
          qualification: {
            schema: 'bant',
            scoreThreshold: 75,
            customCriteria: []
          },
          knowledgeBase: {
            uploadedFiles: 12,
            trainedOnContent: true
          },
          salesTeam: {
            members: [
              { name: 'Alex Thompson', role: 'Senior Sales Executive' },
              { name: 'Maria Garcia', role: 'Solutions Engineer' },
              { name: 'David Kim', role: 'Account Executive' }
            ],
            calendarsConnected: 3
          },
          integrations: {
            crm: 'salesforce',
            slack: true,
            calendar: true
          },
          domain: {
            customDomain: 'sales.techflow.com',
            configured: false
          }
        });
      }
    }
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: 'company',
      title: 'Company Information',
      description: 'Tell us about your company and business',
      icon: Building,
      completed: !!config.company.name && !!config.company.industry,
      optional: false
    },
    {
      id: 'branding',
      title: 'Branding & Design',
      description: 'Customize the look and feel of your sales room',
      icon: Palette,
      completed: !!config.branding.primaryColor,
      optional: false
    },
    {
      id: 'qualification',
      title: 'Qualification Criteria',
      description: 'Set up lead qualification and scoring rules',
      icon: Target,
      completed: config.qualification.schema === 'bant',
      optional: false
    },
    {
      id: 'knowledge',
      title: 'Knowledge Base',
      description: 'Upload content to train your AI sales assistant',
      icon: BookOpen,
      completed: config.knowledgeBase.uploadedFiles > 0,
      optional: false
    },
    {
      id: 'team',
      title: 'Sales Team Setup',
      description: 'Add team members and connect calendars',
      icon: Users,
      completed: config.salesTeam.members.length > 0,
      optional: false
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect your CRM, Slack, and other tools',
      icon: Settings,
      completed: !!config.integrations.crm,
      optional: false
    },
    {
      id: 'domain',
      title: 'Custom Domain',
      description: 'Set up your branded sales room URL',
      icon: Globe,
      completed: !!config.domain.customDomain,
      optional: true
    },
    {
      id: 'launch',
      title: 'Ready to Launch',
      description: 'Review settings and go live',
      icon: Rocket,
      completed: false,
      optional: false
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'company':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                value={config.company.name}
                onChange={(e) => setConfig({
                  ...config,
                  company: { ...config.company, name: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your company name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select
                  value={config.company.industry}
                  onChange={(e) => setConfig({
                    ...config,
                    company: { ...config.company, industry: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                  <option>Financial Services</option>
                  <option>Education</option>
                  <option>E-commerce</option>
                  <option>Consulting</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                <select
                  value={config.company.size}
                  onChange={(e) => setConfig({
                    ...config,
                    company: { ...config.company, size: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>1-10 employees</option>
                  <option>11-50 employees</option>
                  <option>51-200 employees</option>
                  <option>201-500 employees</option>
                  <option>501-1000 employees</option>
                  <option>1000+ employees</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={config.company.website}
                onChange={(e) => setConfig({
                  ...config,
                  company: { ...config.company, website: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-company.com"
              />
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {config.branding.logoUrl ? (
                  <div className="space-y-2">
                    <img src={config.branding.logoUrl} alt="Logo" className="h-16 mx-auto" />
                    <button className="text-sm text-blue-600 hover:text-blue-700">Change Logo</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">Upload your company logo</p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG up to 2MB</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={config.branding.primaryColor}
                    onChange={(e) => setConfig({
                      ...config,
                      branding: { ...config.branding, primaryColor: e.target.value }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.branding.primaryColor}
                    onChange={(e) => setConfig({
                      ...config,
                      branding: { ...config.branding, primaryColor: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={config.branding.secondaryColor}
                    onChange={(e) => setConfig({
                      ...config,
                      branding: { ...config.branding, secondaryColor: e.target.value }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.branding.secondaryColor}
                    onChange={(e) => setConfig({
                      ...config,
                      branding: { ...config.branding, secondaryColor: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
              <div 
                className="rounded-lg p-4 text-white"
                style={{ backgroundColor: config.branding.primaryColor }}
              >
                <h3 className="font-semibold">{config.company.name} Sales Room</h3>
                <p className="text-sm opacity-90">Welcome to our AI-powered sales experience</p>
              </div>
            </div>
          </div>
        );

      case 'qualification':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Qualification Schema</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="schema"
                    value="bant"
                    checked={config.qualification.schema === 'bant'}
                    onChange={(e) => setConfig({
                      ...config,
                      qualification: { ...config.qualification, schema: 'bant' as const }
                    })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">BANT (Recommended)</div>
                    <div className="text-sm text-gray-600">Budget, Authority, Need, Timeline</div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="schema"
                    value="custom"
                    checked={config.qualification.schema === 'custom'}
                    onChange={(e) => setConfig({
                      ...config,
                      qualification: { ...config.qualification, schema: 'custom' as const }
                    })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Custom Criteria</div>
                    <div className="text-sm text-gray-600">Define your own qualification framework</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Score Threshold for Handoff</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={config.qualification.scoreThreshold}
                  onChange={(e) => setConfig({
                    ...config,
                    qualification: { ...config.qualification, scoreThreshold: parseInt(e.target.value) }
                  })}
                  className="flex-1"
                />
                <span className="font-medium text-lg">{config.qualification.scoreThreshold}%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Leads scoring above this threshold will trigger automatic handoff to your sales team
              </p>
            </div>

            {config.qualification.schema === 'bant' && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">BANT Criteria</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Budget:</strong> Does the prospect have budget allocated?</li>
                  <li>• <strong>Authority:</strong> Can they make or influence the decision?</li>
                  <li>• <strong>Need:</strong> Do they have a clear business need?</li>
                  <li>• <strong>Timeline:</strong> When are they looking to implement?</li>
                </ul>
              </div>
            )}
          </div>
        );

      case 'knowledge':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Content</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help your AI assistant learn about your products, services, and company by uploading relevant documents.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { name: 'Product Brochures', count: isDemo ? 4 : 0, icon: '📄' },
                  { name: 'Case Studies', count: isDemo ? 3 : 0, icon: '📊' },
                  { name: 'Pricing Sheets', count: isDemo ? 2 : 0, icon: '💰' },
                  { name: 'FAQs', count: isDemo ? 1 : 0, icon: '❓' },
                  { name: 'Company Info', count: isDemo ? 2 : 0, icon: '🏢' }
                ].map((category, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-600">{category.count} files</div>
                  </div>
                ))}
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                  Choose Files
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, DOC, DOCX, TXT up to 10MB each
                </p>
              </div>
            </div>

            {isDemo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Knowledge Base Trained</span>
                </div>
                <p className="text-sm text-green-700">
                  Your AI assistant has been trained on {config.knowledgeBase.uploadedFiles} documents and is ready to answer questions about your products and services.
                </p>
              </div>
            )}
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Team Members</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your sales team members and connect their calendars for automatic scheduling.
              </p>

              <div className="space-y-4">
                {config.salesTeam.members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">✓ Calendar Connected</span>
                    </div>
                  </div>
                ))}

                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <Users className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Add Team Member</span>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Calendar Integration</h4>
              <p className="text-sm text-blue-800 mb-3">
                Connect team calendars to show real-time availability and enable one-click scheduling.
              </p>
              <div className="space-y-2">
                {['Google Calendar', 'Outlook Calendar', 'Calendly'].map((service) => (
                  <div key={service} className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">{service}</span>
                    <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded transition-colors hover:bg-blue-700">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">CRM Integration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect your CRM to automatically sync qualified leads and conversation data.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Salesforce', id: 'salesforce', connected: config.integrations.crm === 'salesforce' },
                  { name: 'HubSpot', id: 'hubspot', connected: config.integrations.crm === 'hubspot' },
                  { name: 'Pipedrive', id: 'pipedrive', connected: config.integrations.crm === 'pipedrive' }
                ].map((crm) => (
                  <div
                    key={crm.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      crm.connected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setConfig({
                      ...config,
                      integrations: { ...config.integrations, crm: crm.connected ? '' : crm.id }
                    })}
                  >
                    <div className="text-center">
                      <div className="font-medium text-gray-900 mb-1">{crm.name}</div>
                      <div className="text-sm text-gray-600">
                        {crm.connected ? 'Connected' : 'Click to connect'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Integrations</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Slack Notifications</div>
                      <div className="text-sm text-gray-600">Get notified when leads are qualified</div>
                    </div>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.integrations.slack}
                      onChange={(e) => setConfig({
                        ...config,
                        integrations: { ...config.integrations, slack: e.target.checked }
                      })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      config.integrations.slack ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                        config.integrations.slack ? 'translate-x-5' : 'translate-x-1'
                      } mt-1`}></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Webhook Notifications</div>
                      <div className="text-sm text-gray-600">Send data to your custom endpoints</div>
                    </div>
                  </div>
                  <button className="text-sm bg-gray-600 text-white px-3 py-1 rounded transition-colors hover:bg-gray-700">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'domain':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Domain Setup</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set up a custom domain for your sales room to match your brand.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Domain</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={config.domain.customDomain}
                      onChange={(e) => setConfig({
                        ...config,
                        domain: { ...config.domain, customDomain: e.target.value }
                      })}
                      placeholder="sales.yourcompany.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                      Verify
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-2">DNS Configuration Required</h4>
                  <p className="text-sm text-amber-700 mb-3">
                    To use your custom domain, add these DNS records to your domain provider:
                  </p>
                  <div className="bg-white border border-amber-200 rounded p-3 font-mono text-sm">
                    <div>Type: CNAME</div>
                    <div>Name: sales</div>
                    <div>Value: salesroom.salesfusion.ai</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Default URL</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    While you set up your custom domain, your sales room is available at:
                  </p>
                  <div className="bg-white border border-gray-200 rounded p-2 font-mono text-sm text-blue-600">
                    https://acme-corp.salesfusion.ai
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'launch':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Rocket className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Launch! 🚀</h3>
              <p className="text-gray-600">
                Your SalesFusion Sales Room is configured and ready to start converting visitors into qualified leads.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-left">
              <h4 className="font-medium text-green-800 mb-3">Setup Complete ✅</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Company branding configured</li>
                <li>✓ Qualification criteria set to {config.qualification.scoreThreshold}% threshold</li>
                <li>✓ Knowledge base trained on {config.knowledgeBase.uploadedFiles} documents</li>
                <li>✓ {config.salesTeam.members.length} sales team members added</li>
                <li>✓ {config.integrations.crm ? config.integrations.crm.charAt(0).toUpperCase() + config.integrations.crm.slice(1) : 'No'} CRM integration</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Rocket className="w-5 h-5" />
                <span>Launch Sales Room</span>
              </button>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                View Live Demo
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Need help? Contact our support team or check out the documentation.
            </div>
          </div>
        );

      default:
        return <div>Step content</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Room Setup</h1>
            <p className="text-gray-600">Configure your AI-powered sales experience</p>
          </div>
          {isDemo && (
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Demo Mode
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700">{progressPercentage}%</span>
        </div>
        
        <p className="text-sm text-gray-600">
          Step {currentStep + 1} of {steps.length}: {completedSteps} completed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Step Navigation */}
        <div className="space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCurrent = index === currentStep;
            const isCompleted = step.completed;
            
            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  isCurrent
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : isCompleted
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    isCurrent ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                )}
                <div>
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs opacity-75">{step.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{steps[currentStep].title}</h2>
              <p className="text-gray-600">{steps[currentStep].description}</p>
            </div>

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;