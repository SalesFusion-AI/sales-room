import React, { useState } from 'react';
import { Building2, Globe, MapPin, Users, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { useChatStore, useProspectInfo } from '../../store/chatStore';
import { CompanyEnrichmentData } from '../../types';

const CompanyEnrichment: React.FC = () => {
  const { updateProspectInfo, addMessage } = useChatStore();
  const prospectInfo = useProspectInfo();
  const [companyUrl, setCompanyUrl] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  
  const handleCompanyEnrich = async () => {
    if (!companyUrl.trim()) return;
    
    setIsEnriching(true);
    
    try {
      // Simulate company enrichment (would be API call in production)
      const enrichmentData = await simulateCompanyEnrichment(companyUrl);
      
      // Update prospect info with enriched data
      updateProspectInfo({
        companyUrl: companyUrl,
        company: enrichmentData.name,
        industry: enrichmentData.industry,
        companySize: enrichmentData.size,
        enrichmentData,
      });
      
      // Add message to chat about the enrichment
      addMessage(
        `Great! I can see you work at ${enrichmentData.name}. I've pulled some information about your company to better understand your needs. Feel free to correct anything that doesn't look right!`,
        'assistant',
        { type: 'general' }
      );
      
    } catch (error) {
      console.error('Company enrichment failed:', error);
      addMessage(
        'I had trouble finding information about that company. No worries - you can tell me about your business manually!',
        'assistant'
      );
    } finally {
      setIsEnriching(false);
    }
  };
  
  const simulateCompanyEnrichment = async (url: string): Promise<CompanyEnrichmentData> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Extract domain
    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Simulate enriched data based on domain
    return {
      name: getCompanyNameFromDomain(domain),
      domain: domain,
      industry: 'Technology',
      size: 'Mid-market',
      employeeCount: 150,
      revenue: '$10M - $50M',
      founded: 2018,
      location: {
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
      },
      description: `${getCompanyNameFromDomain(domain)} is a growing technology company focused on innovative solutions.`,
      technologies: ['React', 'Node.js', 'AWS', 'PostgreSQL'],
      recentNews: [
        {
          title: 'Company announces new funding round',
          url: '#',
          date: '2024-01-15',
        },
        {
          title: 'Expansion into new markets',
          url: '#',
          date: '2024-01-10',
        },
      ],
    };
  };
  
  const getCompanyNameFromDomain = (domain: string): string => {
    // Simple company name extraction from domain
    const name = domain.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  
  const hasEnrichmentData = prospectInfo.enrichmentData;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Building2 className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">Your Company</h3>
      </div>
      
      {!hasEnrichmentData ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Help me understand your business better by sharing your company website:
          </p>
          <div className="space-y-2">
            <input
              type="url"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="https://yourcompany.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              disabled={isEnriching}
            />
            <button
              onClick={handleCompanyEnrich}
              disabled={!companyUrl.trim() || isEnriching}
              className="w-full btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEnriching ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Looking up company...</span>
                </div>
              ) : (
                'Get Company Info'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Company Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{hasEnrichmentData.name}</h4>
              {hasEnrichmentData.domain && (
                <a
                  href={`https://${hasEnrichmentData.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <Globe className="w-3 h-3" />
                  <span>{hasEnrichmentData.domain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          
          {/* Company Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {hasEnrichmentData.industry && (
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{hasEnrichmentData.industry}</span>
              </div>
            )}
            {hasEnrichmentData.employeeCount && (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{hasEnrichmentData.employeeCount} employees</span>
              </div>
            )}
            {hasEnrichmentData.revenue && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{hasEnrichmentData.revenue}</span>
              </div>
            )}
            {hasEnrichmentData.founded && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Founded {hasEnrichmentData.founded}</span>
              </div>
            )}
          </div>
          
          {hasEnrichmentData.location && (
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-sm text-gray-600">
                {[
                  hasEnrichmentData.location.city,
                  hasEnrichmentData.location.state,
                  hasEnrichmentData.location.country,
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          
          {hasEnrichmentData.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {hasEnrichmentData.description}
            </p>
          )}
          
          {hasEnrichmentData.technologies && hasEnrichmentData.technologies.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-900 mb-1">Tech Stack:</p>
              <div className="flex flex-wrap gap-1">
                {hasEnrichmentData.technologies.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                  >
                    {tech}
                  </span>
                ))}
                {hasEnrichmentData.technologies.length > 4 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    +{hasEnrichmentData.technologies.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={() => updateProspectInfo({ enrichmentData: undefined, companyUrl: '' })}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Edit company info
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyEnrichment;