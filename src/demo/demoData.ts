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
  // Hot Lead - TechFlow Solutions (VP Engineering, budget, ready to buy)
  {
    id: 'demo-conv-1',
    sessionId: 'demo-session-001',
    messages: [
      {
        id: 'msg-1-1',
        content: "Hi, I'm Sarah Chen, VP of Engineering at TechFlow Solutions. We're evaluating workflow automation for our dev-to-QA handoffs and your platform looks promising.",
        role: 'user',
        timestamp: new Date('2026-01-30T10:15:00'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-1-2', 
        content: "Hi Sarah! Great to meet you. Dev-to-QA handoffs are a common bottleneck at your scale. What outcomes are you hoping to improve first - speed, quality, or visibility?",
        role: 'assistant',
        timestamp: new Date('2026-01-30T10:15:30'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-1-3',
        content: "Speed and reliability. We have budget allocated for this quarter and need to choose a vendor by end of this month. I'm the decision maker for engineering tooling.",
        role: 'user', 
        timestamp: new Date('2026-01-30T10:16:15'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-1-4',
        content: "Perfect - budget and timeline are exactly what we need to move fast. At 300 engineers, automating those handoffs typically cuts cycle time by 60-70%. What tools are you using today for release management?",
        role: 'assistant',
        timestamp: new Date('2026-01-30T10:17:00'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-1-5',
        content: "We run Jira + GitHub + Jenkins. The handoff process is still manual and it's slowing every sprint. We want this live within 6 months.",
        role: 'user',
        timestamp: new Date('2026-01-30T10:17:45'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-1-6',
        content: "Great fit. We integrate directly with Jira, GitHub, and Jenkins and can be live in weeks. Want a tailored demo this week with our solutions engineer?",
        role: 'assistant',
        timestamp: new Date('2026-01-30T10:18:30'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-1-7',
        content: "Yes, please. If it looks good, we can move ASAP. Thursday afternoon or Friday morning works.",
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
      budget: 'Budget allocated for this quarter',
      timeline: 'Vendor selection by end of month, live in 6 months',
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
          evidence: ['budget allocated for this quarter']
        },
        authority: {
          id: 'authority',
          name: 'Authority',
          description: 'Has decision-making power or influences the decision',
          weight: 0.25,
          status: 'qualified', 
          confidence: 0.9,
          evidence: ["I'm the decision maker for engineering tooling"]
        },
        need: {
          id: 'need',
          name: 'Need',
          description: 'Has a clear business need or pain point',
          weight: 0.3,
          status: 'qualified',
          confidence: 0.95,
          evidence: ['handoff process is still manual', 'slowing every sprint']
        },
        timeline: {
          id: 'timeline',
          name: 'Timeline', 
          description: 'Has a defined timeframe for implementation',
          weight: 0.2,
          status: 'qualified',
          confidence: 0.9,
          evidence: ['choose a vendor by end of this month', 'live within 6 months']
        }
      },
      score: 94,
      readyToConnect: true,
      lastUpdated: new Date('2026-01-30T10:19:00')
    },
    tags: [DEFAULT_LEAD_TAGS[0], DEFAULT_LEAD_TAGS[3], DEFAULT_LEAD_TAGS[4]], // Hot Lead, Enterprise, Urgent
    crmSynced: true,
    crmId: 'SF_001_DEMO',
    lastActivity: new Date('2026-01-30T10:19:00'),
    createdAt: new Date('2026-01-30T10:15:00'),
    updatedAt: new Date('2026-01-30T10:19:00')
  },

  // Discovery Call - RetailGenius Inc (curious, asking good questions)
  {
    id: 'demo-conv-2',
    sessionId: 'demo-session-002', 
    messages: [
      {
        id: 'msg-2-1',
        content: "Hi, I'm Jordan Lee, Head of Growth at RetailGenius. I'm curious how SalesFusion works for e-commerce teams handling lots of inbound leads.",
        role: 'user',
        timestamp: new Date('2026-01-29T14:30:00'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-2-2',
        content: "Hi Jordan! Great to meet you. We help e-commerce teams qualify inbound leads faster and route the best buyers to sales. What are you hoping to improve first - qualification speed, conversion rate, or team capacity?",
        role: 'assistant',
        timestamp: new Date('2026-01-29T14:30:30'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-2-3',
        content: "All of the above. We're qualifying manually today and it's a bottleneck. How does your AI decide who's ready? And does it integrate with Shopify and Stripe?",
        role: 'user',
        timestamp: new Date('2026-01-29T14:31:30'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-2-4',
        content: "Great questions. We score leads using your criteria and connect directly to Shopify + Stripe for commerce signals. What's your role in the decision process?",
        role: 'assistant',
        timestamp: new Date('2026-01-29T14:32:00'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-2-5',
        content: "I lead growth, but our COO will sign off. No budget set yet, but if the ROI is there we can find it. We'd aim to roll this out next quarter.",
        role: 'user',
        timestamp: new Date('2026-01-29T14:32:45'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-2-6',
        content: "Understood. I can share e-commerce case studies and a sample ROI model for your COO. Would you like a short discovery call to walk through fit and onboarding?",
        role: 'assistant',
        timestamp: new Date('2026-01-29T14:33:30'),
        metadata: { type: 'general' }
      }
    ],
    prospect: {
      id: 'demo-prospect-2',
      name: 'Jordan Lee',
      email: 'jordan.lee@retailgenius.com',
      company: 'RetailGenius Inc',
      title: 'Head of Growth', 
      industry: 'E-commerce',
      companySize: '50-100 employees',
      painPoints: ['Manual lead qualification', 'Slow response times', 'Conversion rate pressure'],
      timeline: 'Next quarter rollout',
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
          confidence: 0.4,
          evidence: ['No budget set yet']
        },
        authority: {
          id: 'authority',
          name: 'Authority',
          description: 'Has decision-making power or influences the decision',
          weight: 0.25,
          status: 'unqualified',
          confidence: 0.8,
          evidence: ['our COO will sign off']
        },
        need: {
          id: 'need',
          name: 'Need',
          description: 'Has a clear business need or pain point',
          weight: 0.3,
          status: 'qualified',
          confidence: 0.9,
          evidence: ['qualifying manually today and it\'s a bottleneck']
        },
        timeline: {
          id: 'timeline',
          name: 'Timeline',
          description: 'Has a defined timeframe for implementation',
          weight: 0.2,
          status: 'qualified',
          confidence: 0.75,
          evidence: ['roll this out next quarter']
        }
      },
      score: 64,
      readyToConnect: false,
      lastUpdated: new Date('2026-01-29T14:33:30')
    },
    tags: [DEFAULT_LEAD_TAGS[1]], // Warm Lead
    crmSynced: false,
    lastActivity: new Date('2026-01-29T14:33:30'),
    createdAt: new Date('2026-01-29T14:30:00'),
    updatedAt: new Date('2026-01-29T14:33:30')
  },

  // Objection Handling - HealthFirst Medical (skeptical, needs convincing)
  {
    id: 'demo-conv-3',
    sessionId: 'demo-session-003',
    messages: [
      {
        id: 'msg-3-1',
        content: "I'm Priya Nair, CTO at HealthFirst Medical. I'm skeptical about AI handling patient inquiries and sales conversations.",
        role: 'user',
        timestamp: new Date('2026-01-28T11:45:00'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-3-2',
        content: "Hi Priya, thanks for sharing that. Healthcare requires a high bar. What would make an AI assistant feel safe and reliable for your team?",
        role: 'assistant', 
        timestamp: new Date('2026-01-28T11:45:30'),
        metadata: { type: 'general' }
      },
      {
        id: 'msg-3-3',
        content: "HIPAA compliance and data residency are non-negotiable. We've been burned by tools that don't integrate with Epic, and cost is a concern. Our care coordinators are overwhelmed with manual follow-ups.",
        role: 'user',
        timestamp: new Date('2026-01-28T11:46:15'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-3-4',
        content: "Totally fair. We support HIPAA-grade controls, offer US-only data residency, and have Epic integration partners. If we can prove security and ROI, who else needs to be involved?",
        role: 'assistant',
        timestamp: new Date('2026-01-28T11:46:45'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-3-5',
        content: "Final decision sits with me and our compliance team, but we wouldn't deploy until next year because of the security review.",
        role: 'user',
        timestamp: new Date('2026-01-28T11:47:20'),
        metadata: { type: 'qualification' }
      },
      {
        id: 'msg-3-6',
        content: "Understood. I can share our HIPAA compliance package, Epic integration references, and a pilot plan. Would a security review call be the next best step?",
        role: 'assistant',
        timestamp: new Date('2026-01-28T11:47:50'),
        metadata: { type: 'general' }
      }
    ],
    prospect: {
      id: 'demo-prospect-3',
      name: 'Priya Nair',
      email: 'priya.nair@healthfirst.com',
      company: 'HealthFirst Medical',
      companySize: '100-250 employees',
      industry: 'Healthcare', 
      title: 'CTO',
      painPoints: ['Manual patient follow-ups', 'Compliance risk', 'Integration complexity'],
      budget: 'Cost concerns',
      timeline: 'Security review through next year',
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
          status: 'unqualified',
          confidence: 0.7,
          evidence: ['cost is a concern']
        },
        authority: {
          id: 'authority',
          name: 'Authority',
          description: 'Has decision-making power or influences the decision',
          weight: 0.25,
          status: 'qualified',
          confidence: 0.85,
          evidence: ['Final decision sits with me']
        },
        need: {
          id: 'need', 
          name: 'Need',
          description: 'Has a clear business need or pain point',
          weight: 0.3,
          status: 'qualified',
          confidence: 0.8,
          evidence: ['care coordinators are overwhelmed with manual follow-ups']
        },
        timeline: {
          id: 'timeline',
          name: 'Timeline',
          description: 'Has a defined timeframe for implementation', 
          weight: 0.2,
          status: 'unqualified',
          confidence: 0.85,
          evidence: ['wouldn\'t deploy until next year']
        }
      },
      score: 55,
      readyToConnect: false,
      lastUpdated: new Date('2026-01-28T11:47:50')
    },
    tags: [DEFAULT_LEAD_TAGS[2]], // Cold Lead
    crmSynced: false,
    lastActivity: new Date('2026-01-28T11:47:50'),
    createdAt: new Date('2026-01-28T11:45:00'),
    updatedAt: new Date('2026-01-28T11:47:50')
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
      'TechFlow Solutions - 250-500 employees, Software Development',
      'Budget allocated for this quarter',
      'Vendor selection by end of month, live in 6 months',
      'Wants Jira + GitHub + Jenkins integration'
    ],
    concerns: [],
    painPoints: ['Manual dev-to-QA handoffs', 'Sprint delays', 'Scaling engineering workflows'],
    qualificationSummary: {
      score: 94,
      criteria: {
        budget: { status: 'qualified', evidence: ['budget allocated for this quarter'] },
        authority: { status: 'qualified', evidence: ['decision maker for engineering tooling'] },
        need: { status: 'qualified', evidence: ['manual handoffs', 'slowing every sprint'] },
        timeline: { status: 'qualified', evidence: ['vendor by end of this month', 'live within 6 months'] }
      },
      readyToConnect: true
    },
    nextSteps: [
      'Schedule tailored demo with solutions engineer',
      'Prepare Jira/GitHub/Jenkins integration walkthrough',
      'Send ROI snapshot for engineering productivity',
      'Hold live demo Thursday afternoon or Friday morning'
    ],
    aiConfidence: 0.94,
    wordCount: 452,
    messageCount: 7,
    duration: 4
  },
  {
    id: 'demo-summary-2', 
    sessionId: 'demo-session-002',
    generatedAt: new Date('2026-01-29T14:35:00'),
    keyPoints: [
      'Head of Growth at RetailGenius (e-commerce)',
      'Manual lead qualification slowing response times',
      'Curious about AI scoring + Shopify/Stripe integrations',
      'COO approval required, budget not set yet',
      'Targeting next-quarter rollout'
    ],
    concerns: ['Needs ROI proof', 'Wants integration clarity'],
    painPoints: ['Manual lead qualification', 'Slow response times', 'Conversion rate pressure'],
    qualificationSummary: {
      score: 64,
      criteria: {
        budget: { status: 'unknown', evidence: ['No budget set yet'] },
        authority: { status: 'unqualified', evidence: ['COO will sign off'] },
        need: { status: 'qualified', evidence: ['qualifying manually today and it\'s a bottleneck'] },
        timeline: { status: 'qualified', evidence: ['roll this out next quarter'] }
      },
      readyToConnect: false
    },
    nextSteps: [
      'Share e-commerce case studies',
      'Provide ROI model for COO review',
      'Offer discovery call to map onboarding plan',
      'Follow up with integration checklist'
    ],
    aiConfidence: 0.81,
    wordCount: 328,
    messageCount: 6,
    duration: 3
  },
  {
    id: 'demo-summary-3',
    sessionId: 'demo-session-003',
    generatedAt: new Date('2026-01-28T11:50:00'),
    keyPoints: [
      'CTO at HealthFirst Medical (healthcare)',
      'Skeptical about AI for patient inquiries',
      'HIPAA compliance + US data residency required',
      'Epic integration and cost are top objections',
      'Security review pushes deployment to next year'
    ],
    concerns: ['HIPAA compliance risk', 'Epic integration gaps', 'Cost sensitivity', 'Long security review'],
    painPoints: ['Manual patient follow-ups', 'Compliance risk', 'Integration complexity'],
    qualificationSummary: {
      score: 55,
      criteria: {
        budget: { status: 'unqualified', evidence: ['cost is a concern'] },
        authority: { status: 'qualified', evidence: ['Final decision sits with me'] },
        need: { status: 'qualified', evidence: ['care coordinators are overwhelmed'] },
        timeline: { status: 'unqualified', evidence: ['wouldn\'t deploy until next year'] }
      },
      readyToConnect: false
    },
    nextSteps: [
      'Send HIPAA compliance package + security documentation',
      'Provide Epic integration references',
      'Offer security review call with compliance team',
      'Propose low-risk pilot plan'
    ],
    aiConfidence: 0.76,
    wordCount: 301,
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
    title: 'SalesFusion Sales Room - Live Demo',
    duration: '2 minutes',
    keyPoints: [
      'AI-powered sales conversations that qualify leads automatically',
      'Real-time handoff to human sales reps when prospects are ready',
      'Full conversation intelligence with CRM-ready summaries'
    ]
  },
  scenario1: {
    title: 'Hot Lead - TechFlow Solutions',
    duration: '3 minutes', 
    persona: 'Sarah Chen - VP Engineering, ready to buy',
    highlights: [
      'AI qualifies budget, authority, need, and timeline in real time',
      '94% qualification score triggers the Talk to Sales handoff',
      'Sales rep sees full context before the call'
    ]
  },
  scenario2: {
    title: 'Discovery Call - RetailGenius',
    duration: '2 minutes',
    persona: 'Jordan Lee - Head of Growth, curious evaluator',
    highlights: [
      'Prospect asks detailed integration questions (Shopify + Stripe)',
      'AI surfaces missing budget/authority gaps',
      'Suggested next questions keep discovery moving'
    ]
  },
  scenario3: {
    title: 'Objection Handling - HealthFirst Medical',
    duration: '2 minutes',
    persona: 'Priya Nair - CTO, skeptical about compliance + cost',
    highlights: [
      'AI captures objections: HIPAA, Epic integration, cost',
      'Summary highlights security review timeline',
      'Next steps focus on compliance pack + pilot plan'
    ]
  },
  close: {
    title: 'Results + Analytics',
    duration: '1 minute',
    results: [
      '247 conversations started this month',
      '68% qualification rate with AI scoring',
      '23 calls booked with full context',
      '3x more qualified leads reach your sales team'
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
