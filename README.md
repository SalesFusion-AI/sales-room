# Sales Room

Prospect-facing AI chat interface for SalesFusion. A customizable React application that provides an interactive sales conversation experience for potential clients.

## What It Does

Sales Room is the front-end customer interface that:

- **AI-Powered Sales Conversations**: Engages prospects with intelligent, contextual responses
- **Company Research**: Automatically researches and displays relevant company information
- **Guided Prompts**: Provides suggested conversation starters to guide prospects
- **Transcript Management**: Maintains conversation history and allows transcript review
- **Real-time Chat**: Smooth, responsive chat interface with typing indicators
- **Brand Customization**: Easily customizable colors, fonts, and styling per client
- **Connect Integration**: Seamless handoff to human sales representatives
- **Mobile-Responsive**: Optimized for all device types

## Architecture

```
src/
├── components/
│   ├── Chat/               # Chat interface components
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── GuidedPrompts.tsx
│   ├── CompanyEnrichment/  # Company research components
│   ├── Layout/             # App layout and navigation
│   ├── Transcript/         # Transcript viewing and management
│   └── Connect/            # Human handoff components
├── services/               # API services and integrations
├── demo/                   # Demo data and mock services
├── types/                  # TypeScript type definitions
└── App.tsx                # Main application component
```

## Setup

### Environment Variables

Create a `.env` file with the following variables:

```bash
# CRM Integration (connects to Pipeline Bot)
REACT_APP_CRM_BASE_URL=http://localhost:3001/api/crm
REACT_APP_CRM_API_KEY=your_api_key

# Optional: Development settings
NODE_ENV=development
```

### Installation

```bash
# Install dependencies
npm install
```

## How to Run

### Development
```bash
npm run dev
```
Starts the Vite development server with hot module replacement.

### Production Build
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Other Commands
```bash
# Lint code
npm run lint
```

## Features

### Chat Interface
- Real-time messaging with AI responses
- Typing indicators for natural conversation flow
- Message history and conversation persistence
- Guided prompts to help prospects get started

### Company Enrichment
- Automatic company research based on prospect information
- Display of company details, industry, and relevant context
- Integration with data enrichment services

### Brand Customization
The interface supports extensive brand customization through CSS custom properties:

```css
:root {
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  /* ... and more color variables */
}
```

### Responsive Design
- Mobile-first responsive design
- Optimized for tablets and desktop
- Touch-friendly interface elements
- Accessible keyboard navigation

## Integration with Pipeline Bot

Sales Room communicates with Pipeline Bot through REST API calls:

- **Chat Messages**: Sent to Pipeline Bot for AI processing
- **Company Data**: Retrieved from CRM integrations
- **Transcript Storage**: Conversations saved for sales team review
- **Lead Handoff**: Smooth transition to human representatives

## Customization

### Brand Colors
Update the CSS custom properties in `src/index.css`:
- Primary colors: Main brand colors for buttons and accents
- Secondary colors: Supporting UI elements
- Accent colors: Highlights and special elements

### Fonts
Configure custom fonts in the CSS:
```css
html {
  font-family: 'Your-Brand-Font', 'Inter', system-ui, sans-serif;
}
```

### Messaging
Customize AI prompts and guided conversation starters in:
- `src/components/Chat/GuidedPrompts.tsx`
- `src/demo/demoData.ts` (for demo content)

## Demo Mode

The application includes a demo mode with:
- Mock conversation data
- Simulated AI responses
- Example company enrichment data
- Sample transcripts

To enable demo mode, the app automatically uses demo services when API endpoints are unavailable.

## Technologies

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **State Management**: Zustand
- **Markdown**: React Markdown with syntax highlighting
- **Icons**: Lucide React
- **Testing**: Vitest (configured)
- **Code Quality**: ESLint with TypeScript rules

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Code splitting for optimal loading
- Lazy loading of components
- Optimized bundle size with tree shaking
- CDN-ready static assets

---

Built for SalesFusion by Angelo AI