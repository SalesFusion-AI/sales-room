import type { StoredConversation, TranscriptSummary, SalesRep } from '../types';
import { DEFAULT_LEAD_TAGS } from '../services/transcriptService';

// Demo company profiles for realistic scenarios
export const DEMO_COMPANIES = [
  {
    name: 'TechFlow Solutions',
    domain: 'techflow.com',
    industry: 'Software Development',
    size: '250-500 employees',
    revenue: '$10-25M',
    location: { city: 'San Francisco', state: 'CA', country: 'USA' },
    description: 'Enterprise software development company specializing in workflow automation',
    technologies: ['React', 'Node.js', 'AWS', 'Kubernetes'],
    painPoints: ['Manual workflow processes', 'Team collaboration inefficiencies', 'Scaling challenges']
  },
  {
    name: 'GlobalManufacturing Corp',
    domain: 'globalmanufacturing.com', 
    industry: 'Manufacturing',
    size: '1000+ employees',
    revenue: '$100M+',
    location: { city: 'Detroit', state: 'MI', country: 'USA' },
    description: 'Leading automotive parts manufacturer with global operations',
    technologies: ['SAP', 'Oracle', 'IoT sensors', 'Robotics'],
    painPoints: ['Supply chain visibility', 'Quality control automation', 'Predictive maintenance']
  },
  {
    name: 'HealthFirst Medical',
    domain: 'healthfirst.com',
    industry: 'Healthcare',
    size: '100-250 employees', 
    revenue: '$5-10M',
    location: { city: 'Boston', state: 'MA', country: 'USA' },
    description: 'Regional healthcare provider focused on patient experience',
    technologies: ['Epic', 'HL7', 'Telehealth', 'Mobile apps'],
    painPoints: ['Patient engagement', 'Administrative overhead', 'Compliance tracking']
  },
  {
    name: 'RetailGenius Inc',
    domain: 'retailgenius.com',
    industry: 'E-commerce',
    size: '50-100 employees',
    revenue: '$2-5M', 
    location: { city: 'Austin', state: 'TX', country: 'USA' },
    description: 'Fast-growing e-commerce platform for small businesses',
    technologies: ['Shopify', 'Stripe', 'Analytics', 'AI/ML'],
    painPoints: ['Customer acquisition costs', 'Inventory optimization', 'Personalization at scale']
  },
  {
    name: 'EduTech Innovations',
    domain: 'edutech.com',
    industry: 'Education Technology',
    size: '25-50 employees',
    revenue: '$1-2M',
    location: { city: 'Seattle', state: 'WA', country: 'USA' },
    description: 'Educational software for K-12 schools and districts', 
    technologies: ['React Native', 'Firebase', 'Video streaming', 'Analytics'],
    painPoints: ['Student engagement', 'Teacher adoption', 'District-wide rollouts']
  }
];

// Demo conversation scenarios
export const DEMO_CONVERSATIONS: StoredConversation[] = [
  // Hot Lead - TechFlow Solutions
  {
    id: 'demo-conv-1',
    sessionId: 'demo-session-001',
    messages: [
      {
        id: 'msg-1-1',
        content: "Hi! I'm Sarah from TechFlow Solutions. I saw your solution and I'm interested in learning more about how it could help automate our workflow processes.",
        role: 'user',
        timestamp: new Date('2026-01-30T10:15:00'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-1-2', 
        content: "Hi Sarah! Great to meet you. TechFlow Solutions - I see you're in software development. Workflow automation is exactly what we help companies like yours optimize. What specific workflow challenges are you facing that brought you here today?",
        role: 'assistant',
        timestamp: new Date('2026-01-30T10:15:30'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-1-3',
        content: "We're spending way too much time on manual handoffs between development and QA. Our team has grown to 250 people and the old processes just don't scale. We're looking at a 6-month timeline to implement something new, and we have budget allocated for this year.",
        role: 'user', 
        timestamp: new Date('2026-01-30T10:16:15'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-1-4',
        content: "That's a perfect fit for what we do! With 250 people, you're at that critical scaling point where automation becomes essential. The dev-to-QA handoff is one of our most popular use cases. Since you have budget allocated and a 6-month timeline, I'd love to show you how we've helped companies like yours reduce handoff time by 70%. Would you like to see a demo tailored to your dev workflow?",
        role: 'assistant',
        timestamp: new Date('2026-01-30T10:17:00'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-1-5',
        content: "Yes, absolutely! I'm the VP of Engineering so I can make decisions on this. A demo would be perfect. We're also looking at competitors, but if your solution fits our needs, we could move quickly.",
        role: 'user',
        timestamp: new Date('2026-01-30T10:17:45'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-1-6',
        content: "Excellent! Having the decision maker involved makes this so much more efficient. I'd love to connect you with our solutions engineer who can walk through exactly how we'd integrate with your current dev stack. They have specific experience with companies your size in the software development space. What's your availability this week?",
        role: 'assistant',
        timestamp: new Date('2026-01-30T10:18:30'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-1-7',
        content: "I'm free Thursday afternoon or Friday morning. My email is sarah.chen@techflow.com if that's easier for scheduling.",
        role: 'user',
        timestamp: new Date('2026-01-30T10:19:00'),
        metadata: { type: 'general' }
      }
    ],
    prospect: {
      id: 'demo-prospect-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@techflow.com',
      company: 'TechFlow Solutions',
      title: 'VP of Engineering',
      industry: 'Software Development',
      companySize: '250-500 employees',
      painPoints: ['Manual workflow processes', 'Dev-to-QA handoff inefficiencies', 'Scaling challenges'],
      budget: 'Budget allocated for this year',
      timeline: '6-month implementation timeline',
      decisionMaker: true
    },
    qualificationStatus: {
      schemaId: 'bant-default',
      criteria: {
        budget: {
          id: 'budget',
          name: 'Budget',
          description: 'Has budget allocated or authority to allocate budget',
          weight: 0.25,
          status: 'qualified',
          confidence: 0.95,
          evidence: ['we have budget allocated for this year']
        },
        authority: {
          id: 'authority',
          name: 'Authority',
          description: 'Has decision-making power or influences the decision',
          weight: 0.25,
          status: 'qualified', 
          confidence: 0.9,
          evidence: ["I'm the VP of Engineering so I can make decisions on this"]
        },
        need: {
          id: 'need',
          name: 'Need',
          description: 'Has a clear business need or pain point',
          weight: 0.3,
          status: 'qualified',
          confidence: 0.95,
          evidence: ['spending way too much time on manual handoffs', 'old processes just don\'t scale']
        },
        timeline: {
          id: 'timeline',
          name: 'Timeline', 
          description: 'Has a defined timeframe for implementation',
          weight: 0.2,
          status: 'qualified',
          confidence: 0.9,
          evidence: ['6-month timeline to implement something new']
        }
      },
      score: 92,
      readyToConnect: true,
      lastUpdated: new Date('2026-01-30T10:19:00')
    },
    tags: [DEFAULT_LEAD_TAGS[0], DEFAULT_LEAD_TAGS[3]], // Hot Lead, Enterprise
    crmSynced: true,
    crmId: 'SF_001_DEMO',
    lastActivity: new Date('2026-01-30T10:19:00'),
    createdAt: new Date('2026-01-30T10:15:00'),
    updatedAt: new Date('2026-01-30T10:19:00')
  },

  // Warm Lead - GlobalManufacturing Corp
  {
    id: 'demo-conv-2',
    sessionId: 'demo-session-002', 
    messages: [
      {
        id: 'msg-2-1',
        content: "Hello, I'm Mike from GlobalManufacturing Corp. We're exploring solutions for supply chain visibility. Can you tell me more about your platform?",
        role: 'user',
        timestamp: new Date('2026-01-29T14:30:00'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-2-2',
        content: "Hi Mike! GlobalManufacturing Corp - you're in the automotive manufacturing space, correct? Supply chain visibility is crucial for companies your size. What specific visibility challenges are you trying to solve?",
        role: 'assistant',
        timestamp: new Date('2026-01-29T14:30:30'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-2-3',
        content: "Yes, we manufacture automotive parts globally. Our main issue is we can't see bottlenecks until they become problems. We have plants in 12 countries and visibility across all of them is a nightmare. We're looking to implement something in the next 12-18 months.",
        role: 'user',
        timestamp: new Date('2026-01-29T14:31:30'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-2-4',
        content: "That's a common challenge for global manufacturers. Real-time visibility across 12 countries is complex but absolutely achievable. Our platform has helped several automotive suppliers get end-to-end visibility. What's your role in the decision-making process for this kind of initiative?",
        role: 'assistant',
        timestamp: new Date('2026-01-29T14:32:00'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-2-5',
        content: "I'm the Director of Operations, but this decision would go through our procurement committee and ultimately need CEO approval since it's a significant investment. We're in early research phase right now.",
        role: 'user',
        timestamp: new Date('2026-01-29T14:32:45'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-2-6',
        content: "I understand - enterprise decisions like this require multiple stakeholders. Since you're in research phase, I can provide you with some case studies from similar automotive manufacturers and ROI data that might help with your internal discussions. What would be most valuable for your procurement committee?",
        role: 'assistant',
        timestamp: new Date('2026-01-29T14:33:30'),
        metadata: { type: 'general' }
      }
    ],
    prospect: {
      id: 'demo-prospect-2',
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@globalmanufacturing.com',
      company: 'GlobalManufacturing Corp',
      title: 'Director of Operations', 
      industry: 'Manufacturing',
      companySize: '1000+ employees',
      painPoints: ['Supply chain visibility across 12 countries', 'Bottleneck detection', 'Global coordination'],
      timeline: '12-18 months implementation',
      decisionMaker: false
    },
    qualificationStatus: {
      schemaId: 'bant-default',
      criteria: {
        budget: {
          id: 'budget',
          name: 'Budget',
          description: 'Has budget allocated or authority to allocate budget',
          weight: 0.25,
          status: 'unknown',
          confidence: 0.3,
          evidence: []
        },
        authority: {
          id: 'authority',
          name: 'Authority',
          description: 'Has decision-making power or influences the decision',
          weight: 0.25,
          status: 'unqualified',
          confidence: 0.8,
          evidence: ['decision would go through procurement committee and need CEO approval']
        },
        need: {
          id: 'need',
          name: 'Need',
          description: 'Has a clear business need or pain point',
          weight: 0.3,
          status: 'qualified',
          confidence: 0.9,
          evidence: ['visibility across all plants is a nightmare', 'can\'t see bottlenecks until they become problems']
        },
        timeline: {
          id: 'timeline',
          name: 'Timeline',
          description: 'Has a defined timeframe for implementation',
          weight: 0.2,
          status: 'qualified',
          confidence: 0.7,
          evidence: ['12-18 months implementation']
        }
      },
      score: 67,
      readyToConnect: false,
      lastUpdated: new Date('2026-01-29T14:33:30')
    },
    tags: [DEFAULT_LEAD_TAGS[1], DEFAULT_LEAD_TAGS[3]], // Warm Lead, Enterprise  
    crmSynced: false,
    lastActivity: new Date('2026-01-29T14:33:30'),
    createdAt: new Date('2026-01-29T14:30:00'),
    updatedAt: new Date('2026-01-29T14:33:30')
  },

  // Cold Lead - EduTech Innovations
  {
    id: 'demo-conv-3',
    sessionId: 'demo-session-003',
    messages: [
      {
        id: 'msg-3-1',
        content: "Hi, I'm exploring different solutions for our education platform. What do you offer?",
        role: 'user',
        timestamp: new Date('2026-01-28T11:45:00'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-3-2',
        content: "Hello! I'd love to help you explore how our platform could benefit your education company. What specific challenges are you looking to solve with your current platform?",
        role: 'assistant', 
        timestamp: new Date('2026-01-28T11:45:30'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-3-3',
        content: "We're having trouble with student engagement. Our platform works but students aren't as engaged as we'd like. We're a small team though, just 30 people, so we need something that doesn't require a huge implementation.",
        role: 'user',
        timestamp: new Date('2026-01-28T11:46:15'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-3-4',
        content: "Student engagement is crucial for educational platforms. With a team of 30, you definitely need solutions that are easy to implement and maintain. What's your current timeline for addressing the engagement issues?",
        role: 'assistant',
        timestamp: new Date('2026-01-28T11:46:45'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-3-5',
        content: "We don't have a set timeline yet. We're just starting to look around and see what options are available. Budget is tight for us as a smaller company.",
        role: 'user',
        timestamp: new Date('2026-01-28T11:47:20'),
        metadata: { type: 'qualification' }
      }
    ],
    prospect: {
      id: 'demo-prospect-3',
      name: 'Anonymous User',
      company: 'EduTech Innovations',
      companySize: '25-50 employees',
      industry: 'Education Technology', 
      painPoints: ['Student engagement issues'],
      budget: 'Tight budget constraints',
      timeline: 'No set timeline'
    },
    qualificationStatus: {
      schemaId: 'bant-default',
      criteria: {
        budget: {
          id: 'budget',
          name: 'Budget', 
          description: 'Has budget allocated or authority to allocate budget',
          weight: 0.25,
          status: 'unqualified',
          confidence: 0.8,
          evidence: ['Budget is tight for us as a smaller company']
        },
        authority: {
          id: 'authority',
          name: 'Authority',
          description: 'Has decision-making power or influences the decision',
          weight: 0.25,
          status: 'unknown',
          confidence: 0.2,
          evidence: []
        },
        need: {
          id: 'need', 
          name: 'Need',
          description: 'Has a clear business need or pain point',
          weight: 0.3,
          status: 'qualified',
          confidence: 0.7,
          evidence: ['having trouble with student engagement']
        },
        timeline: {
          id: 'timeline',
          name: 'Timeline',
          description: 'Has a defined timeframe for implementation', 
          weight: 0.2,
          status: 'unqualified',
          confidence: 0.9,
          evidence: ['don\'t have a set timeline yet', 'just starting to look around']
        }
      },
      score: 35,
      readyToConnect: false,
      lastUpdated: new Date('2026-01-28T11:47:20')
    },
    tags: [DEFAULT_LEAD_TAGS[2]], // Cold Lead
    crmSynced: false,
    lastActivity: new Date('2026-01-28T11:47:20'),
    createdAt: new Date('2026-01-28T11:45:00'),
    updatedAt: new Date('2026-01-28T11:47:20')
  }
];

// Demo summaries
export const DEMO_SUMMARIES: TranscriptSummary[] = [
  {
    id: 'demo-summary-1',
    sessionId: 'demo-session-001',
    generatedAt: new Date('2026-01-30T10:20:00'),
    keyPoints: [
      'VP of Engineering with decision authority',
      'TechFlow Solutions - 250 employees, Software Development',
      'Budget allocated for this year',
      '6-month implementation timeline',
      'Evaluating competitors but can move quickly'
    ],
    concerns: [],
    painPoints: ['Manual workflow processes', 'Dev-to-QA handoff inefficiencies', 'Scaling challenges with team growth'],
    qualificationSummary: {
      score: 92,
      criteria: {
        budget: { status: 'qualified', evidence: ['budget allocated for this year'] },
        authority: { status: 'qualified', evidence: ['VP of Engineering', 'can make decisions'] },
        need: { status: 'qualified', evidence: ['manual handoffs', 'old processes don\'t scale'] },
        timeline: { status: 'qualified', evidence: ['6-month timeline'] }
      },
      readyToConnect: true
    },
    nextSteps: [
      'Schedule demo with solutions engineer',
      'Prepare dev workflow integration presentation',
      'Send ROI case studies for similar companies',
      'Connect Thursday afternoon or Friday morning'
    ],
    aiConfidence: 0.92,
    wordCount: 425,
    messageCount: 7,
    duration: 4
  },
  {
    id: 'demo-summary-2', 
    sessionId: 'demo-session-002',
    generatedAt: new Date('2026-01-29T14:35:00'),
    keyPoints: [
      'Director of Operations at GlobalManufacturing Corp',
      'Global automotive parts manufacturer - 1000+ employees',
      '12 countries, complex supply chain',
      'Early research phase, 12-18 month timeline',
      'Requires procurement committee and CEO approval'
    ],
    concerns: ['Significant investment required', 'Multiple stakeholder approval needed'],
    painPoints: ['Supply chain visibility across 12 countries', 'Bottleneck detection', 'Global coordination'],
    qualificationSummary: {
      score: 67,
      criteria: {
        budget: { status: 'unknown', evidence: [] },
        authority: { status: 'unqualified', evidence: ['needs procurement committee and CEO approval'] },
        need: { status: 'qualified', evidence: ['visibility nightmare', 'bottleneck problems'] },
        timeline: { status: 'qualified', evidence: ['12-18 months'] }
      },
      readyToConnect: false
    },
    nextSteps: [
      'Send automotive manufacturer case studies',
      'Provide ROI data for procurement committee',
      'Create executive summary for CEO presentation',
      'Follow up in 2-3 weeks for research updates'
    ],
    aiConfidence: 0.78,
    wordCount: 312,
    messageCount: 6,
    duration: 3
  }
];

// Demo sales reps with realistic profiles
export const DEMO_SALES_REPS: SalesRep[] = [
  {
    id: 'demo-rep-1',
    name: 'Alex Thompson',
    title: 'Senior Sales Executive',
    email: 'alex.thompson@salesfusion.ai',
    slackUserId: 'U12345ALEX',
    calendarUrl: 'https://calendly.com/alex-thompson/30min',
    timezone: 'America/New_York',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 'demo-rep-2', 
    name: 'Maria Garcia',
    title: 'Solutions Engineer',
    email: 'maria.garcia@salesfusion.ai',
    slackUserId: 'U67890MARIA',
    calendarUrl: 'https://calendly.com/maria-garcia/demo',
    timezone: 'America/Los_Angeles',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b587?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 'demo-rep-3',
    name: 'David Kim',
    title: 'Account Executive',
    email: 'david.kim@salesfusion.ai', 
    slackUserId: 'U24680DAVID',
    calendarUrl: 'https://calendly.com/david-kim/consultation',
    timezone: 'America/Chicago',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  }
];

// Demo analytics data
export const DEMO_ANALYTICS = {
  conversationsStarted: 247,
  qualificationRate: 68, // percentage
  callsBooked: 23,
  averageQualificationScore: 71,
  hotLeads: 18,
  warmLeads: 84,
  coldLeads: 145,
  crmSyncedCount: 198,
  conversionRate: 9.3, // percentage from conversation to call
  averageSessionDuration: 6.2, // minutes
  averageMessagesPerSession: 8.4,
  topIndustries: [
    { name: 'Software Development', count: 67, percentage: 27 },
    { name: 'Manufacturing', count: 52, percentage: 21 },
    { name: 'Healthcare', count: 41, percentage: 17 },
    { name: 'E-commerce', count: 38, percentage: 15 },
    { name: 'Education', count: 49, percentage: 20 }
  ],
  weeklyTrends: [
    { week: 'Jan 6-12', conversations: 42, qualified: 28, booked: 4 },
    { week: 'Jan 13-19', conversations: 51, qualified: 35, booked: 6 },
    { week: 'Jan 20-26', conversations: 63, qualified: 41, booked: 7 },
    { week: 'Jan 27-30', conversations: 91, qualified: 64, booked: 6 }
  ]
};

// Demo onboarding checklist
export const DEMO_ONBOARDING_CHECKLIST = [
  { id: 1, task: 'Upload company branding (logo, colors)', completed: true },
  { id: 2, task: 'Configure qualification criteria (BANT vs custom)', completed: true },
  { id: 3, task: 'Set up knowledge base content', completed: true },
  { id: 4, task: 'Add sales team members and calendars', completed: true },
  { id: 5, task: 'Configure CRM integration (Salesforce)', completed: true },
  { id: 6, task: 'Set up Slack notifications', completed: true },
  { id: 7, task: 'Test conversation flow', completed: true },
  { id: 8, task: 'Configure custom domain', completed: false },
  { id: 9, task: 'Launch to production', completed: false }
];

// Demo script for webinar presentation
export const WEBINAR_DEMO_SCRIPT = {
  intro: {
    title: "SalesFusion Sales Room - Live Demo",
    duration: "2 minutes",
    keyPoints: [
      "AI-powered sales conversations that qualify leads automatically",
      "Real-time handoff to human sales reps when prospects are ready",
      "Complete conversation intelligence with CRM integration"
    ]
  },
  scenario1: {
    title: "Hot Lead - TechFlow Solutions",
    duration: "3 minutes", 
    persona: "Sarah Chen - VP Engineering, needs workflow automation",
    highlights: [
      "Watch AI qualify budget, authority, need, timeline in real conversation",
      "92% qualification score triggers automatic handoff",
      "Sales rep gets full context before the call"
    ]
  },
  scenario2: {
    title: "Transcript Review & CRM Sync",
    duration: "2 minutes",
    highlights: [
      "Sales rep reviews conversation before calling prospect",
      "AI summary with key points, concerns, next steps",
      "One-click sync to Salesforce with all context"
    ]
  },
  scenario3: {
    title: "Analytics Dashboard",
    duration: "2 minutes",
    highlights: [
      "247 conversations started this month",
      "68% qualification rate with AI scoring", 
      "23 calls booked with full context"
    ]
  },
  close: {
    title: "Results",
    duration: "1 minute",
    results: [
      "3x more qualified leads reach your sales team",
      "Zero context loss - every conversation captured and analyzed",
      "Sales reps focus on closing, not qualifying"
    ]
  }
};

export default {
  DEMO_COMPANIES,
  DEMO_CONVERSATIONS,
  DEMO_SUMMARIES,
  DEMO_SALES_REPS,
  DEMO_ANALYTICS,
  DEMO_ONBOARDING_CHECKLIST,
  WEBINAR_DEMO_SCRIPT
};