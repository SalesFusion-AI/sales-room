import { transcriptService } from '../services/transcriptService';
import { handoffService } from '../services/handoffService';
import { 
  DEMO_CONVERSATIONS, 
  DEMO_SUMMARIES, 
  DEMO_SALES_REPS, 
  DEMO_ANALYTICS,
  DEMO_ONBOARDING_CHECKLIST,
  WEBINAR_DEMO_SCRIPT
} from './demoData';
import type { StoredConversation } from '../types';

export class DemoService {
  private isInitialized = false;
  private currentDemoStep = 0;
  private webinarMode = false;
  private activityIntervalId: ReturnType<typeof setInterval> | null = null;

  // Initialize demo environment
  async initializeDemoEnvironment(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🎬 Initializing Demo Environment...');

    try {
      // Clear any existing data
      this.clearDemoData();

      // Populate with demo conversations
      await this.loadDemoConversations();
      
      // Load demo summaries
      this.loadDemoSummaries();
      
      // Configure demo sales reps
      this.configureDemoReps();
      
      // Set demo analytics
      this.setDemoAnalytics();

      this.isInitialized = true;
      console.log('✅ Demo environment initialized successfully');
      
      // Show demo welcome message
      this.showDemoWelcome();
      
    } catch (error) {
      console.error('❌ Failed to initialize demo environment:', error);
      throw error;
    }
  }

  // Load demo conversations into transcript service
  private async loadDemoConversations(): Promise<void> {
    for (const conversation of DEMO_CONVERSATIONS) {
      await transcriptService.storeConversation(conversation);
    }
    console.log(`📝 Loaded ${DEMO_CONVERSATIONS.length} demo conversations`);
  }

  // Load demo summaries
  private loadDemoSummaries(): void {
    DEMO_SUMMARIES.forEach(summary => {
      localStorage.setItem(`summary-${summary.sessionId}`, JSON.stringify(summary));
    });
    console.log(`💡 Loaded ${DEMO_SUMMARIES.length} demo summaries`);
  }

  // Configure demo sales reps
  private configureDemoReps(): void {
    handoffService.updateReps(DEMO_SALES_REPS);
    console.log(`👥 Configured ${DEMO_SALES_REPS.length} demo sales reps`);
  }

  // Set demo analytics in localStorage
  private setDemoAnalytics(): void {
    localStorage.setItem('demo_analytics', JSON.stringify(DEMO_ANALYTICS));
    localStorage.setItem('demo_onboarding', JSON.stringify(DEMO_ONBOARDING_CHECKLIST));
    console.log('📊 Demo analytics configured');
  }

  // Clear existing demo data
  private clearDemoData(): void {
    // Clear transcripts
    localStorage.removeItem('salesfusion_transcripts');
    localStorage.removeItem('salesfusion_summaries');
    
    // Clear demo-specific data
    localStorage.removeItem('demo_analytics');
    localStorage.removeItem('demo_onboarding');
    
    console.log('🧹 Cleared existing demo data');
  }

  // Show demo welcome message
  private showDemoWelcome(): void {
    const welcomeMessage = `
🎬 DEMO ENVIRONMENT ACTIVE 🎬

Welcome to the SalesFusion Sales Room demo!

📊 Demo Stats:
• 247 conversations loaded
• 68% qualification rate
• 23 calls booked

🎭 Available Scenarios:
1. Hot Lead: TechFlow Solutions (92% qualified)
2. Warm Lead: GlobalManufacturing (67% qualified)  
3. Cold Lead: EduTech Innovations (35% qualified)

🚀 Webinar Mode: Use demoService.startWebinar() for presentation
    `;
    
    console.log(welcomeMessage);
  }

  // Start webinar presentation mode
  startWebinar(): void {
    this.webinarMode = true;
    this.currentDemoStep = 0;
    console.log('🎤 Webinar mode activated!');
    this.showWebinarGuide();
  }

  // Show webinar guide
  private showWebinarGuide(): void {
    const guide = `
🎤 WEBINAR DEMO GUIDE 🎤

${WEBINAR_DEMO_SCRIPT.intro.title} (${WEBINAR_DEMO_SCRIPT.intro.duration})
Key Points:
${WEBINAR_DEMO_SCRIPT.intro.keyPoints.map(point => `• ${point}`).join('\n')}

📋 Demo Flow:
1. Show Sales Room interface
2. Navigate to Transcripts → Hot Lead (TechFlow)
3. Review transcript and AI summary  
4. Show CRM sync functionality
5. Display analytics dashboard

Use: nextStep() / prevStep() to navigate
    `;
    console.log(guide);
  }

  // Navigate webinar demo steps
  nextStep(): void {
    if (!this.webinarMode) {
      console.log('Start webinar mode first: demoService.startWebinar()');
      return;
    }

    this.currentDemoStep++;
    this.showCurrentStep();
  }

  prevStep(): void {
    if (!this.webinarMode) return;
    
    if (this.currentDemoStep > 0) {
      this.currentDemoStep--;
    }
    this.showCurrentStep();
  }

  private showCurrentStep(): void {
    const steps = [
      {
        title: "Step 1: Sales Room Interface",
        action: "Show main chat interface with prospect interaction",
        highlight: "AI qualification in real-time"
      },
      {
        title: "Step 2: Hot Lead Scenario", 
        action: "Navigate to Transcripts → Select TechFlow Solutions",
        highlight: "92% qualification score, ready to connect"
      },
      {
        title: "Step 3: Transcript Review",
        action: "Show detailed conversation with AI insights",
        highlight: "Key points, concerns, next steps automatically extracted"
      },
      {
        title: "Step 4: CRM Integration",
        action: "Demonstrate one-click sync to Salesforce",
        highlight: "All conversation context preserved in CRM"
      },
      {
        title: "Step 5: Analytics Dashboard",
        action: "Show analytics with demo data",
        highlight: "247 conversations, 68% qualification rate, 23 calls booked"
      }
    ];

    const currentStep = steps[this.currentDemoStep];
    if (currentStep) {
      console.log(`
🎬 ${currentStep.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Action: ${currentStep.action}
Highlight: ${currentStep.highlight}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step ${this.currentDemoStep + 1} of ${steps.length}
      `);
    }
  }

  // Get demo conversation by scenario
  getDemoConversation(scenario: 'hot' | 'warm' | 'cold'): StoredConversation | null {
    const scenarioMap = {
      hot: 'demo-session-001',
      warm: 'demo-session-002', 
      cold: 'demo-session-003'
    };

    const sessionId = scenarioMap[scenario];
    return transcriptService.getConversationBySessionId(sessionId);
  }

  // Get demo analytics
  getDemoAnalytics() {
    const stored = localStorage.getItem('demo_analytics');
    return stored ? JSON.parse(stored) : DEMO_ANALYTICS;
  }

  // Simulate live conversation for demo
  simulateConversation(scenario: 'hot' | 'warm' | 'cold'): Promise<void> {
    return new Promise((resolve) => {
      const conversation = this.getDemoConversation(scenario);
      if (!conversation) {
        resolve();
        return;
      }

      console.log(`🎭 Simulating ${scenario} lead conversation...`);
      
      // This could be enhanced to actually play back the conversation
      // message by message with timing for live demo effect
      setTimeout(() => {
        console.log(`✅ ${scenario.toUpperCase()} lead simulation complete`);
        resolve();
      }, 2000);
    });
  }

  // Generate realistic new demo conversation
  generateNewConversation(): StoredConversation {
    const companies = ['TechCorp', 'InnovateLab', 'DataFlow', 'CloudWorks', 'AI Solutions'];
    const names = ['John Smith', 'Lisa Johnson', 'Mike Chen', 'Sarah Davis', 'Tom Wilson'];
    const titles = ['CEO', 'CTO', 'VP Engineering', 'Director of Operations', 'Head of Sales'];
    
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    
    // This would generate a new realistic conversation
    // For now, return a template
    const newConversation: StoredConversation = {
      id: `demo-new-${Date.now()}`,
      sessionId: `demo-session-${Date.now()}`,
      messages: [
        {
          id: 'new-msg-1',
          content: `Hi, I'm ${randomName.split(' ')[0]} from ${randomCompany}. I'm interested in learning more about your solution.`,
          role: 'user',
          timestamp: new Date(),
          metadata: { type: 'general' }
        }
      ],
      prospect: {
        id: `new-prospect-${Date.now()}`,
        name: randomName,
        company: randomCompany,
        title: randomTitle
      },
      qualificationStatus: {
        schemaId: 'bant-default',
        criteria: {
          budget: { id: 'budget', name: 'Budget', description: '', weight: 0.25, status: 'unknown', confidence: 0, evidence: [] },
          authority: { id: 'authority', name: 'Authority', description: '', weight: 0.25, status: 'unknown', confidence: 0, evidence: [] },
          need: { id: 'need', name: 'Need', description: '', weight: 0.3, status: 'unknown', confidence: 0, evidence: [] },
          timeline: { id: 'timeline', name: 'Timeline', description: '', weight: 0.2, status: 'unknown', confidence: 0, evidence: [] }
        },
        score: 0,
        readyToConnect: false,
        lastUpdated: new Date()
      },
      tags: [],
      crmSynced: false,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return newConversation;
  }

  // Check if demo environment is active
  isDemoActive(): boolean {
    return this.isInitialized;
  }

  // Get webinar script
  getWebinarScript() {
    return WEBINAR_DEMO_SCRIPT;
  }

  // Reset demo environment
  resetDemo(): void {
    this.clearDemoData();
    this.isInitialized = false;
    this.webinarMode = false;
    this.currentDemoStep = 0;
    console.log('🔄 Demo environment reset');
  }

  // Export demo data for backup
  exportDemoData() {
    return {
      conversations: DEMO_CONVERSATIONS,
      summaries: DEMO_SUMMARIES,
      analytics: DEMO_ANALYTICS,
      reps: DEMO_SALES_REPS,
      onboarding: DEMO_ONBOARDING_CHECKLIST,
      script: WEBINAR_DEMO_SCRIPT
    };
  }

  // Performance metrics for demo
  getDemoPerformance() {
    return {
      totalConversations: DEMO_CONVERSATIONS.length,
      qualificationRate: Math.round((DEMO_CONVERSATIONS.filter(c => c.qualificationStatus.score >= 60).length / DEMO_CONVERSATIONS.length) * 100),
      averageScore: Math.round(DEMO_CONVERSATIONS.reduce((sum, c) => sum + c.qualificationStatus.score, 0) / DEMO_CONVERSATIONS.length),
      hotLeads: DEMO_CONVERSATIONS.filter(c => c.qualificationStatus.score >= 85).length,
      readyToConnect: DEMO_CONVERSATIONS.filter(c => c.qualificationStatus.readyToConnect).length,
      crmSynced: DEMO_CONVERSATIONS.filter(c => c.crmSynced).length
    };
  }

  // Simulate real-time activity for demo
  simulateRealTimeActivity(): void {
    if (!this.isInitialized) return;

    // Clear any existing interval to prevent memory leaks
    this.stopRealTimeActivity();

    // Simulate new conversations coming in during demo
    this.activityIntervalId = setInterval(() => {
      if (this.webinarMode && Math.random() > 0.7) {
        console.log('📥 New demo conversation started...');
        // Could trigger UI updates to show live activity
      }
    }, 30000); // Every 30 seconds
  }

  // Stop real-time activity simulation
  stopRealTimeActivity(): void {
    if (this.activityIntervalId) {
      clearInterval(this.activityIntervalId);
      this.activityIntervalId = null;
    }
  }

  // Clean up demo service
  cleanup(): void {
    this.stopRealTimeActivity();
    this.isInitialized = false;
    this.webinarMode = false;
    this.currentDemoStep = 0;
  }
}

// Global demo service instance
export const demoService = new DemoService();

// Make available on window for webinar use
if (typeof window !== 'undefined') {
  (window as any).demoService = demoService;
  (window as any).startDemo = () => demoService.initializeDemoEnvironment();
  (window as any).startWebinar = () => demoService.startWebinar();
  (window as any).nextStep = () => demoService.nextStep();
  (window as any).prevStep = () => demoService.prevStep();
}

export default demoService;