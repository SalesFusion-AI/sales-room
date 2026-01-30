import type { QualificationSchema, QualificationCriterion, QualificationStatus, Message } from '../types';

// Default BANT Schema
export const DEFAULT_BANT_SCHEMA: QualificationSchema = {
  id: 'bant-default',
  name: 'BANT (Budget, Authority, Need, Timeline)',
  scoreThreshold: 75,
  criteria: [
    {
      id: 'budget',
      name: 'Budget',
      description: 'Has budget allocated or authority to allocate budget',
      weight: 0.25,
      status: 'unknown',
      confidence: 0,
      evidence: []
    },
    {
      id: 'authority',
      name: 'Authority', 
      description: 'Has decision-making power or influences the decision',
      weight: 0.25,
      status: 'unknown',
      confidence: 0,
      evidence: []
    },
    {
      id: 'need',
      name: 'Need',
      description: 'Has a clear business need or pain point',
      weight: 0.3,
      status: 'unknown',
      confidence: 0,
      evidence: []
    },
    {
      id: 'timeline',
      name: 'Timeline',
      description: 'Has a defined timeframe for implementation',
      weight: 0.2,
      status: 'unknown',
      confidence: 0,
      evidence: []
    }
  ]
};

// Custom schemas for different industries/use cases
export const SAAS_QUALIFICATION_SCHEMA: QualificationSchema = {
  id: 'saas-custom',
  name: 'SaaS Qualification',
  scoreThreshold: 70,
  criteria: [
    ...DEFAULT_BANT_SCHEMA.criteria,
    {
      id: 'tech-stack',
      name: 'Tech Stack Fit',
      description: 'Current technology stack is compatible',
      weight: 0.15,
      status: 'unknown',
      confidence: 0,
      evidence: []
    },
    {
      id: 'team-size',
      name: 'Team Size',
      description: 'Team size fits our ideal customer profile',
      weight: 0.1,
      status: 'unknown',
      confidence: 0,
      evidence: []
    }
  ]
};

export class QualificationService {
  private currentSchema: QualificationSchema;

  constructor(schema: QualificationSchema = DEFAULT_BANT_SCHEMA) {
    this.currentSchema = schema;
  }

  // Initialize qualification status with current schema
  initializeQualificationStatus(): QualificationStatus {
    const criteria: Record<string, QualificationCriterion> = {};
    
    this.currentSchema.criteria.forEach(criterion => {
      criteria[criterion.id] = { ...criterion };
    });

    return {
      schemaId: this.currentSchema.id,
      criteria,
      score: 0,
      readyToConnect: false,
      lastUpdated: new Date()
    };
  }

  // Calculate weighted qualification score
  calculateScore(status: QualificationStatus): number {
    let totalWeight = 0;
    let qualifiedWeight = 0;

    Object.values(status.criteria).forEach(criterion => {
      totalWeight += criterion.weight;
      
      if (criterion.status === 'qualified') {
        qualifiedWeight += criterion.weight * criterion.confidence;
      }
    });

    return totalWeight > 0 ? Math.round((qualifiedWeight / totalWeight) * 100) : 0;
  }

  // AI-powered qualification assessment from conversation
  async assessQualificationFromMessages(
    messages: Message[], 
    currentStatus: QualificationStatus
  ): Promise<Partial<QualificationStatus>> {
    
    // This would integrate with your AI service (OpenAI, Claude, etc.)
    // For now, implementing rule-based logic that can be enhanced with AI
    
    const recentMessages = messages.slice(-10); // Last 10 messages for context
    const userMessages = recentMessages.filter(m => m.role === 'user');
    const conversationText = userMessages.map(m => m.content.toLowerCase()).join(' ');
    
    const updatedCriteria: Record<string, QualificationCriterion> = { 
      ...currentStatus.criteria 
    };

    // Budget assessment
    if (this.detectsBudgetSignals(conversationText)) {
      updatedCriteria.budget = {
        ...updatedCriteria.budget,
        status: this.assessBudgetStatus(conversationText),
        confidence: 0.8,
        evidence: userMessages
          .filter(m => this.containsBudgetKeywords(m.content))
          .map(m => m.content)
      };
    }

    // Authority assessment
    if (this.detectsAuthoritySignals(conversationText)) {
      updatedCriteria.authority = {
        ...updatedCriteria.authority,
        status: this.assessAuthorityStatus(conversationText),
        confidence: 0.7,
        evidence: userMessages
          .filter(m => this.containsAuthorityKeywords(m.content))
          .map(m => m.content)
      };
    }

    // Need assessment
    if (this.detectsNeedSignals(conversationText)) {
      updatedCriteria.need = {
        ...updatedCriteria.need,
        status: 'qualified', // Pain points usually indicate qualified need
        confidence: 0.85,
        evidence: userMessages
          .filter(m => this.containsNeedKeywords(m.content))
          .map(m => m.content)
      };
    }

    // Timeline assessment
    if (this.detectsTimelineSignals(conversationText)) {
      updatedCriteria.timeline = {
        ...updatedCriteria.timeline,
        status: this.assessTimelineStatus(conversationText),
        confidence: 0.75,
        evidence: userMessages
          .filter(m => this.containsTimelineKeywords(m.content))
          .map(m => m.content)
      };
    }

    const updatedStatus: Partial<QualificationStatus> = {
      criteria: updatedCriteria,
      lastUpdated: new Date(),
      aiAssessment: {
        summary: this.generateAssessmentSummary(updatedCriteria),
        confidence: this.calculateOverallConfidence(updatedCriteria),
        nextQuestions: this.suggestNextQuestions(updatedCriteria)
      }
    };

    // Calculate new score
    const tempStatus = { ...currentStatus, ...updatedStatus };
    updatedStatus.score = this.calculateScore(tempStatus);
    updatedStatus.readyToConnect = updatedStatus.score >= this.currentSchema.scoreThreshold;

    return updatedStatus;
  }

  // Helper methods for signal detection
  private detectsBudgetSignals(text: string): boolean {
    const budgetKeywords = [
      'budget', 'cost', 'price', 'expensive', 'affordable', 'invest', 
      'ROI', 'worth', 'value', 'money', 'financial', 'funds', 'allocated'
    ];
    return budgetKeywords.some(keyword => text.includes(keyword));
  }

  private assessBudgetStatus(text: string): 'qualified' | 'unqualified' | 'unknown' {
    const positiveSignals = ['budget allocated', 'have budget', 'can invest', 'worth it', 'approved budget'];
    const negativeSignals = ['no budget', 'too expensive', 'cannot afford', 'budget constraints'];
    
    if (positiveSignals.some(signal => text.includes(signal))) return 'qualified';
    if (negativeSignals.some(signal => text.includes(signal))) return 'unqualified';
    return 'unknown';
  }

  private containsBudgetKeywords(text: string): boolean {
    return this.detectsBudgetSignals(text.toLowerCase());
  }

  private detectsAuthoritySignals(text: string): boolean {
    const authorityKeywords = [
      'decision', 'decide', 'choose', 'approve', 'manager', 'director', 
      'CEO', 'CTO', 'owner', 'founder', 'lead', 'responsible', 'authority'
    ];
    return authorityKeywords.some(keyword => text.includes(keyword));
  }

  private assessAuthorityStatus(text: string): 'qualified' | 'unqualified' | 'unknown' {
    const highAuthority = ['CEO', 'CTO', 'director', 'manager', 'owner', 'founder', 'decision maker'];
    const lowAuthority = ['intern', 'assistant', 'junior', 'need approval'];
    
    if (highAuthority.some(signal => text.includes(signal))) return 'qualified';
    if (lowAuthority.some(signal => text.includes(signal))) return 'unqualified';
    return 'unknown';
  }

  private containsAuthorityKeywords(text: string): boolean {
    return this.detectsAuthoritySignals(text.toLowerCase());
  }

  private detectsNeedSignals(text: string): boolean {
    const needKeywords = [
      'problem', 'issue', 'challenge', 'struggle', 'difficult', 'pain', 
      'frustrat', 'inefficient', 'slow', 'manual', 'broken', 'need help'
    ];
    return needKeywords.some(keyword => text.includes(keyword));
  }

  private containsNeedKeywords(text: string): boolean {
    return this.detectsNeedSignals(text.toLowerCase());
  }

  private detectsTimelineSignals(text: string): boolean {
    const timelineKeywords = [
      'soon', 'urgent', 'immediately', 'asap', 'this month', 'next quarter', 
      'by end of', 'timeline', 'deadline', 'when', 'schedule'
    ];
    return timelineKeywords.some(keyword => text.includes(keyword));
  }

  private assessTimelineStatus(text: string): 'qualified' | 'unqualified' | 'unknown' {
    const urgentSignals = ['urgent', 'asap', 'immediately', 'this month', 'soon'];
    const distantSignals = ['maybe next year', 'not urgent', 'no rush', 'someday'];
    
    if (urgentSignals.some(signal => text.includes(signal))) return 'qualified';
    if (distantSignals.some(signal => text.includes(signal))) return 'unqualified';
    return 'unknown';
  }

  private containsTimelineKeywords(text: string): boolean {
    return this.detectsTimelineSignals(text.toLowerCase());
  }

  private generateAssessmentSummary(criteria: Record<string, QualificationCriterion>): string {
    const qualified = Object.values(criteria).filter(c => c.status === 'qualified').length;
    const total = Object.values(criteria).length;
    
    if (qualified === total) return 'Highly qualified prospect with clear fit';
    if (qualified >= total * 0.75) return 'Strong qualification with minor gaps';
    if (qualified >= total * 0.5) return 'Partially qualified, needs more information';
    return 'Early stage qualification, requires additional discovery';
  }

  private calculateOverallConfidence(criteria: Record<string, QualificationCriterion>): number {
    const confidences = Object.values(criteria)
      .filter(c => c.confidence > 0)
      .map(c => c.confidence);
    
    return confidences.length > 0 
      ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
      : 0;
  }

  private suggestNextQuestions(criteria: Record<string, QualificationCriterion>): string[] {
    const questions: string[] = [];
    
    Object.values(criteria).forEach(criterion => {
      if (criterion.status === 'unknown' || criterion.confidence < 0.7) {
        switch (criterion.id) {
          case 'budget':
            questions.push("What's your budget range for solving this challenge?");
            break;
          case 'authority':
            questions.push("Who else would be involved in making this decision?");
            break;
          case 'need':
            questions.push("What's the biggest pain point you're facing right now?");
            break;
          case 'timeline':
            questions.push("When are you looking to have a solution in place?");
            break;
        }
      }
    });

    return questions.slice(0, 2); // Return top 2 questions
  }

  // Schema management
  setSchema(schema: QualificationSchema): void {
    this.currentSchema = schema;
  }

  getSchema(): QualificationSchema {
    return this.currentSchema;
  }

  getAvailableSchemas(): QualificationSchema[] {
    return [DEFAULT_BANT_SCHEMA, SAAS_QUALIFICATION_SCHEMA];
  }
}

export const qualificationService = new QualificationService();