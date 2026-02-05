# Data Retention and Security Policy

## Overview

This application handles Personally Identifiable Information (PII) and implements security measures to protect user data and comply with privacy regulations.

## Data Storage Approach

### PII Data Storage
- **Storage Type**: `sessionStorage` with Time-To-Live (TTL)
- **Retention Period**: 24 hours maximum
- **Automatic Cleanup**: Data expires automatically after TTL
- **Session Scope**: Data is automatically cleared when browser tab is closed

### PII Data Categories
The following data types are considered PII and stored with expiring sessionStorage:

1. **Prospect Information**:
   - Names
   - Email addresses
   - Phone numbers
   - Company information
   - Job titles

2. **Conversation Transcripts**:
   - Chat messages containing personal details
   - Qualification data
   - Customer pain points and business needs

3. **Conversation Summaries**:
   - AI-generated insights from conversations
   - Key points extracted from discussions
   - Lead scoring and qualification status

### Non-PII Data Storage
The following data uses regular `sessionStorage` without expiry:

1. **Application Settings**:
   - AI model preferences
   - UI configuration
   - Theme settings

2. **Demo Data**:
   - Anonymous analytics
   - Configuration preferences

## Implementation Details

### Storage Utilities
- **Location**: `src/utils/sessionStorage.ts`
- **TTL Default**: 24 hours (86,400,000 milliseconds)
- **Expiry Check**: Automatic on data retrieval
- **Fallback**: In-memory storage when sessionStorage unavailable

### Key Functions
```typescript
// For PII data with TTL
setExpiringSessionItem(key, value, ttlMs?)
getExpiringSessionItem(key)

// For non-PII data
setSessionItem(key, value)
getSessionItem(key)
```

### Services Updated
1. **TranscriptService**: Conversation and summary storage
2. **DemoService**: Demo summaries and PII mock data
3. **SettingsStore**: API keys and sensitive configuration

## Security Benefits

1. **Data Minimization**: Automatic expiry reduces data retention
2. **Session Isolation**: Data doesn't persist across browser sessions
3. **Browser Protection**: Data cleared when tab is closed
4. **No Server Storage**: All data stored client-side only
5. **Automatic Cleanup**: No manual intervention required for data deletion

## Compliance Considerations

- **GDPR**: Right to be forgotten automatically enforced via TTL
- **CCPA**: Data minimization through automatic expiry
- **SOC 2**: Access controls and data retention policies
- **HIPAA**: Limited data retention (if applicable)

## Monitoring and Maintenance

### Automatic Processes
- Expired data cleanup on application load
- TTL validation on every data access
- Fallback to in-memory storage when needed

### Manual Processes
- Regular security audits of storage usage
- TTL adjustment based on business requirements
- Monitoring for localStorage usage in new features

## Migration from localStorage

Previous localStorage usage has been migrated to sessionStorage with the following changes:

1. **Transcript Storage**: Now uses expiring sessionStorage
2. **Summary Storage**: Now uses expiring sessionStorage  
3. **Demo Data**: Sensitive demo data now expires
4. **Settings**: API keys now stored in sessionStorage only

## Best Practices

1. **New Features**: Always use sessionStorage utilities for any data storage
2. **PII Detection**: Any data containing personal information must use expiring storage
3. **Testing**: Verify data expiry in browser dev tools
4. **Documentation**: Update this file when adding new data types

## Emergency Data Removal

If immediate data removal is required:
```javascript
// Clear all sessionStorage
sessionStorage.clear();

// Or remove specific keys
removeSessionItem('salesfusion_transcripts');
removeSessionItem('salesfusion_summaries');
```

Last Updated: 2024-01-20