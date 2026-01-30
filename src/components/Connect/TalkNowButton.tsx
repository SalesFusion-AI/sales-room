import React, { useState, useEffect } from 'react';
import { Phone, Calendar, Clock, User } from 'lucide-react';
import { 
  useChatStore, 
  useCanTalkNow, 
  useAvailabilityStatus, 
  useAssignedRep, 
  useHandoffConfig 
} from '../../store/chatStore';

const TalkNowButton: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const canTalkNow = useCanTalkNow();
  const availabilityStatus = useAvailabilityStatus();
  const assignedRep = useAssignedRep();
  const handoffConfig = useHandoffConfig();
  const { initiateHandoff, checkRepAvailability } = useChatStore();

  // Check availability on mount and periodically
  useEffect(() => {
    checkRepAvailability();
    
    // Check every 30 seconds
    const interval = setInterval(checkRepAvailability, 30000);
    return () => clearInterval(interval);
  }, [checkRepAvailability]);

  const handleTalkNow = async () => {
    setIsConnecting(true);
    try {
      const success = await initiateHandoff();
      if (success) {
        // UI will update automatically via store
      } else {
        // Handle failure - maybe show error message
        console.error('Failed to initiate handoff');
      }
    } catch (error) {
      console.error('Error during handoff:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBookCalendar = () => {
    if (assignedRep?.calendarUrl) {
      window.open(assignedRep.calendarUrl, '_blank');
    } else if (handoffConfig?.defaultCalendarUrl) {
      window.open(handoffConfig.defaultCalendarUrl, '_blank');
    }
  };

  const formatNextAvailable = (nextAvailable: Date) => {
    const now = new Date();
    const diff = nextAvailable.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    }
    return `in ${minutes}m`;
  };

  // Don't render if not qualified
  if (!canTalkNow && availabilityStatus.status !== 'busy') {
    return null;
  }

  return (
    <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <h3 className="font-semibold text-green-800">Ready to Connect!</h3>
      </div>
      
      {/* Available Rep Info */}
      {assignedRep && (
        <div className="flex items-center space-x-3 p-2 bg-white/50 rounded-md">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {assignedRep.avatar ? (
              <img src={assignedRep.avatar} alt={assignedRep.name} className="w-8 h-8 rounded-full" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{assignedRep.name}</p>
            <p className="text-xs text-gray-600">{assignedRep.title}</p>
          </div>
        </div>
      )}

      {/* Status and Actions */}
      {availabilityStatus.status === 'available' && canTalkNow ? (
        <div className="space-y-2">
          <p className="text-sm text-green-700">
            🎉 Perfect timing! A sales expert is available right now.
          </p>
          <button
            onClick={handleTalkNow}
            disabled={isConnecting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                <span>Talk Now</span>
              </>
            )}
          </button>
        </div>
      ) : availabilityStatus.status === 'busy' ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-orange-700">
            <Clock className="w-4 h-4" />
            <p className="text-sm">
              Currently in a meeting
              {availabilityStatus.nextAvailable && (
                <span>, back {formatNextAvailable(availabilityStatus.nextAvailable)}</span>
              )}
            </p>
          </div>
          
          {availabilityStatus.currentMeeting && (
            <p className="text-xs text-gray-600">
              📅 {availabilityStatus.currentMeeting.title}
            </p>
          )}

          <div className="flex space-x-2">
            {availabilityStatus.nextAvailable && (
              <button
                onClick={handleTalkNow}
                disabled={isConnecting}
                className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 font-medium py-2 px-3 rounded-md text-sm transition-colors"
              >
                Notify When Available
              </button>
            )}
            <button
              onClick={handleBookCalendar}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center space-x-1"
            >
              <Calendar className="w-3 h-3" />
              <span>Book Time</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            Our sales team is currently offline.
          </p>
          <button
            onClick={handleBookCalendar}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule a Call</span>
          </button>
        </div>
      )}

      {/* Business Hours Info */}
      {handoffConfig?.businessHours && availabilityStatus.status === 'offline' && (
        <div className="text-xs text-gray-600 bg-white/50 p-2 rounded">
          <p className="font-medium mb-1">Business Hours ({handoffConfig.businessHours.timezone}):</p>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(handoffConfig.businessHours.days).map(([day, hours]) => (
              <div key={day} className="flex justify-between">
                <span className="capitalize">{day.slice(0, 3)}</span>
                <span>{hours.enabled ? `${hours.start}-${hours.end}` : 'Closed'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TalkNowButton;