import React, { useState } from 'react';
import { Phone, Calendar, Mail, Clock, CheckCircle, User } from 'lucide-react';
import { useChatStore, useProspectInfo, useQualificationStatus } from '../../store/chatStore';

const ConnectNow: React.FC = () => {
  const { addMessage } = useChatStore();
  const prospectInfo = useProspectInfo();
  const qualificationStatus = useQualificationStatus();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: prospectInfo.name || '',
    email: prospectInfo.email || '',
    phone: prospectInfo.phone || '',
  });
  const [connectType, setConnectType] = useState<'now' | 'schedule' | 'email'>('now');
  
  const handleConnectRequest = (type: 'now' | 'schedule' | 'email') => {
    setConnectType(type);
    
    if (!contactInfo.name || !contactInfo.email) {
      setShowContactForm(true);
      return;
    }
    
    handleSubmitConnect(type);
  };
  
  const handleSubmitConnect = (type: 'now' | 'schedule' | 'email') => {
    // Update prospect info
    // updateProspectInfo({
    //   name: contactInfo.name,
    //   email: contactInfo.email,
    //   phone: contactInfo.phone,
    // });
    
    let message = '';
    switch (type) {
      case 'now':
        message = `Perfect! I'm connecting you with one of our sales specialists now. ${contactInfo.name}, someone will reach out to you at ${contactInfo.email}${contactInfo.phone ? ` or ${contactInfo.phone}` : ''} within the next few minutes.`;
        break;
      case 'schedule':
        message = `Great! I've sent calendar booking instructions to ${contactInfo.email}. You'll be able to choose a time that works best for you, ${contactInfo.name}.`;
        break;
      case 'email':
        message = `Thanks ${contactInfo.name}! I've sent a detailed information packet to ${contactInfo.email}. One of our specialists will follow up within 24 hours.`;
        break;
    }
    
    addMessage(message, 'assistant', {
      type: 'general',
      suggestedActions: type === 'schedule' ? ['View Calendar', 'Reschedule'] : undefined,
    });
    
    setShowContactForm(false);
    
    // In a real app, this would trigger actual connections
    console.log('Connect request:', { type, contactInfo, qualificationStatus });
  };
  
  if (showContactForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Contact Information</h3>
        </div>
        
        <p className="text-sm text-gray-600">
          We'll need a few details to connect you with our team:
        </p>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={contactInfo.name}
              onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleSubmitConnect(connectType)}
            disabled={!contactInfo.name.trim() || !contactInfo.email.trim()}
            className="flex-1 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
          <button
            onClick={() => setShowContactForm(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Phone className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">Ready to Talk?</h3>
      </div>
      
      {qualificationStatus.readyToConnect ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              You're Qualified!
            </span>
          </div>
          <p className="text-xs text-green-700">
            Based on our conversation, you're a great fit for our solution.
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          Connect with our sales team to learn more and get personalized recommendations.
        </p>
      )}
      
      <div className="space-y-2">
        {/* Talk Now */}
        <button
          onClick={() => handleConnectRequest('now')}
          className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
        >
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
            <Phone className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900">Talk Now</div>
            <div className="text-xs text-gray-600">Get a call within 5 minutes</div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-600">Available</span>
          </div>
        </button>
        
        {/* Schedule Call */}
        <button
          onClick={() => handleConnectRequest('schedule')}
          className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
        >
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900">Schedule a Call</div>
            <div className="text-xs text-gray-600">Pick a time that works for you</div>
          </div>
          <Clock className="w-4 h-4 text-gray-400" />
        </button>
        
        {/* Email Follow-up */}
        <button
          onClick={() => handleConnectRequest('email')}
          className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
        >
          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200">
            <Mail className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900">Email Me Info</div>
            <div className="text-xs text-gray-600">Get detailed information via email</div>
          </div>
        </button>
      </div>
      
      {/* Representative Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">JD</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">John Doe</div>
            <div className="text-xs text-gray-600">Senior Sales Specialist</div>
          </div>
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-600">Online</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        🔒 Your information is secure and won't be shared with third parties
      </div>
    </div>
  );
};

export default ConnectNow;