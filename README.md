# SalesFusion Sales Room

A modern, AI-powered prospect-facing chat interface that helps leads self-educate, get qualified, and connect with sales teams.

## 🚀 Features

### ✅ Sprint 7 Complete
- **7.1 Chat UI** - React-based LLM-style interface with smooth animations
- **7.2 Branding Customization** - Per-client logo, colors, fonts, and messaging
- **7.3 Guided Prompts** - Starter questions categorized by intent (product, pricing, process)
- **7.4 Company Enrichment** - URL input with automated company data enrichment
- **7.5 Knowledge Base Structure** - Foundation for client content management
- **7.6 LLM Integration** - AI conversation system with context awareness
- **7.7 Conversation Memory** - Session persistence and context retention
- **7.8 Objection Handling** - AI detects and responds to prospect concerns

## 🏗️ Architecture

### Core Components
- **ChatInterface** - Main chat experience with typing indicators
- **MessageBubble** - Rich message rendering with markdown support
- **GuidedPrompts** - Category-based starter questions
- **CompanyEnrichment** - Automated company intelligence
- **QualificationStatus** - BANT qualification tracking
- **ConnectNow** - Human handoff with multiple connection options

### State Management
- **Zustand Store** - Lightweight, performant state management
- **Conversation** - Message history and prospect information
- **Qualification** - BANT scoring with automatic updates
- **Branding** - Dynamic theme and customization

### Styling
- **Tailwind CSS** - utility-first CSS framework
- **Custom Components** - Brand-aware design system
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - Brand customization support

## 🎨 Branding System

The Sales Room supports complete white-labeling:

```typescript
interface BrandConfig {
  branding: {
    logoUrl?: string;
    colors: {
      primary: string;    // Main brand color
      secondary: string;  // Secondary brand color  
      accent: string;     // Accent color for highlights
    };
    fonts: {
      heading: string;    // Headings and titles
      body: string;       // Body text and messages
    };
  };
  messaging: {
    welcomeMessage: string;     // First AI message
    companyCta: string;         // Company enrichment CTA
    qualificationCta: string;   // Qualification prompt
    connectCta: string;         // Human handoff CTA
  };
}
```

## 🤖 AI Integration

### Message Processing
- Intent detection (question, objection, qualification)
- Context-aware responses based on conversation history
- Automatic qualification updates from user responses
- Confidence scoring for AI responses

### Qualification Logic
Automatic BANT (Budget, Authority, Need, Timeline) scoring:
- **Budget** - Detects budget discussions and allocations
- **Authority** - Identifies decision-making power
- **Need** - Recognizes business problems and pain points
- **Timeline** - Captures urgency and implementation timeframes

### Response Types
- **General** - Product and service information
- **Qualification** - BANT-related responses
- **Objection** - Handling concerns and pushback
- **Connect** - Human handoff facilitation

## 🏢 Company Enrichment

Automated prospect company intelligence:
- Domain-based data lookup
- Industry and company size detection
- Technology stack identification
- Recent news and funding information
- Employee count and revenue estimates

## 📊 Qualification Tracking

Real-time qualification scoring with visual indicators:
- **0-24%** - Not Qualified (Red)
- **25-74%** - Partially Qualified (Yellow)  
- **75-100%** - Highly Qualified (Green)

Qualified prospects automatically see connection options.

## 🔗 Connection Options

Multiple ways for prospects to connect:
- **Talk Now** - Immediate callback request
- **Schedule Call** - Calendar booking integration
- **Email Info** - Information packet delivery

## 🚀 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
git clone <repository>
cd sales-room
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

## 🎯 Usage

### Basic Integration
```tsx
import { SalesRoom } from '@salesfusion/sales-room';

const brandConfig = {
  branding: {
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b', 
      accent: '#d946ef',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  messaging: {
    welcomeMessage: 'Hi! How can I help you today?',
  },
  features: {
    showCompanyEnrichment: true,
    requireQualification: true,
    allowDirectConnect: false,
  },
};

<SalesRoom 
  brandConfig={brandConfig}
  knowledgeBase={knowledgeBase}
  onQualified={(prospect) => handleQualification(prospect)}
  onConnect={(prospect, type) => handleConnection(prospect, type)}
/>
```

### Custom Knowledge Base
```typescript
const knowledgeBase = {
  sections: [
    {
      id: '1',
      title: 'Product Overview',
      content: 'Our platform helps businesses...',
      category: 'product',
      tags: ['overview', 'features'],
    }
  ],
  faqs: [
    {
      id: '1', 
      question: 'How much does it cost?',
      answer: 'Our pricing starts at $99/month...',
      category: 'pricing',
    }
  ],
  pricing: [
    {
      id: '1',
      planName: 'Starter',
      price: '$99/month',
      features: ['Feature 1', 'Feature 2'],
    }
  ]
};
```

## 🔧 Configuration

### Environment Variables
```bash
VITE_API_BASE_URL=https://api.salesfusion.com
VITE_AI_MODEL=claude-sonnet-4
VITE_ENABLE_ENRICHMENT=true
VITE_ENABLE_QUALIFICATION=true
```

### Feature Flags
- `showCompanyEnrichment` - Enable company URL input and enrichment
- `requireQualification` - Show qualification tracking
- `allowDirectConnect` - Allow unqualified connection attempts
- `captureEmail` - Require email before connecting
- `showPricing` - Display pricing information

## 📈 Analytics

The Sales Room tracks key engagement metrics:
- **Message Count** - Total conversation length
- **Qualification Score** - BANT progression
- **Company Enriched** - Successful company lookups
- **Connection Requests** - Human handoff attempts
- **Objections Raised** - Concern detection and handling

## 🔒 Security

- Input sanitization for all user messages
- Rate limiting on message sending
- Secure API key handling
- Data encryption in transit and at rest
- GDPR-compliant data handling

## 🤝 Integration Points

### CRM Integration
- Automatic prospect creation
- Conversation logging
- Qualification status sync
- Activity tracking

### Calendar Integration  
- Scheduling system connection
- Availability checking
- Meeting booking
- Reminder automation

### Email Integration
- Information packet delivery
- Follow-up sequences
- Nurture campaign enrollment

## 📱 Mobile Support

Fully responsive design optimized for:
- iPhone and Android devices
- Tablet experiences  
- Desktop and laptop screens
- Touch and keyboard interactions

## 🔄 Future Enhancements

### Sprint 8+ Roadmap
- **Advanced Qualification** - Custom qualification criteria
- **Multi-language Support** - Internationalization
- **Voice Chat** - Speech-to-text integration
- **Video Chat** - WebRTC connection capability
- **Advanced Analytics** - Conversation insights and optimization
- **A/B Testing** - Message and prompt optimization
- **Integration Hub** - Third-party tool connections

## 📞 Support

For technical support or feature requests:
- Documentation: [docs.salesfusion.com](https://docs.salesfusion.com)
- Issues: GitHub Issues
- Email: support@salesfusion.com
- Discord: [Join Community](https://discord.com/invite/salesfusion)

---

Built with ❤️ by the SalesFusion team