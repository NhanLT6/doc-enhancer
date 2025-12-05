// Mock data for testing Enhancement Workflow UI

export interface Document {
  id: string;
  name: string;
  confluenceUrl: string;
  lastFetchedContent: string;
}

export const mockDocument: Document = {
  id: '1',
  name: 'Authentication API Documentation',
  confluenceUrl: 'https://example.atlassian.net/wiki/spaces/DOC/pages/123456',
  lastFetchedContent: `# Authentication API

## Session Management

Session timeout has been updated from 30 minutes to 60 minutes to improve user experience.

### Token Expiration

- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Use the refresh endpoint to get new tokens

## Rate Limiting

Rate limits apply per API key:
- 100 requests per minute for standard tier
- 1000 requests per minute for premium tier`,
};

export const mockSourceContent = `## Session Management

Session timeout has been updated from **30 minutes** to **60 minutes** to improve user experience.

### Changes:
- Increased session timeout duration
- Reduces need for frequent re-authentication
- Better for long-running operations

## Rate Limiting

New rate limits introduced:
- Standard tier: 100 requests/minute
- Premium tier: 1000 requests/minute`;

export const mockEnhancedContent = `## Session Management

The authentication system now provides **extended session duration** for improved user experience. Sessions remain active for **60 minutes** of inactivity, increased from the previous 30-minute timeout.

### Implementation Details

When implementing session management in your application:

\`\`\`typescript
// Configure session timeout
const sessionConfig = {
  timeout: 60 * 60 * 1000, // 60 minutes in milliseconds
  autoRenew: true,
  renewThreshold: 5 * 60 * 1000, // Renew 5 minutes before expiry
};

// Initialize session manager
const sessionManager = new SessionManager(sessionConfig);
\`\`\`

### Benefits

- **Reduced friction**: Users experience fewer interruptions during active work sessions
- **Long operations**: Supports workflows that take extended time to complete
- **Better UX**: Maintains context without forcing frequent re-authentication

> **Note**: Sessions still expire after 60 minutes of inactivity for security purposes.

---

## Rate Limiting

API rate limits have been implemented to ensure fair usage and system stability:

### Rate Limit Tiers

| Tier | Requests/Minute | Use Case |
|------|----------------|----------|
| Standard | 100 | Development and small applications |
| Premium | 1,000 | Production applications with high traffic |

### Handling Rate Limits

When you exceed rate limits, the API returns a \`429 Too Many Requests\` status code:

\`\`\`typescript
try {
  const response = await fetch('/api/endpoint', {
    headers: { 'Authorization': \`Bearer \${token}\` }
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    console.log(\`Rate limited. Retry after \${retryAfter} seconds\`);
  }
} catch (error) {
  console.error('Request failed:', error);
}
\`\`\`

### Best Practices

1. **Implement exponential backoff** when retrying failed requests
2. **Cache responses** where appropriate to reduce API calls
3. **Monitor usage** to stay within your tier limits
4. **Upgrade to Premium** if you consistently hit rate limits`;
