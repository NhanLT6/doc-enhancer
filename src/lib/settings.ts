/**
 * Settings management for Confluence credentials and configuration
 * Stores settings in localStorage
 */

export interface ConfluenceSettings {
  confluenceToken: string;
  confluenceEmail: string;
  confluenceBaseUrl: string;
}

const SETTINGS_KEY = 'doc-enhancer:settings';

/**
 * Get saved Confluence settings from localStorage
 */
export function getSettings(): ConfluenceSettings | null {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
}

/**
 * Save Confluence settings to localStorage
 */
export function saveSettings(settings: ConfluenceSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

/**
 * Clear all saved settings
 */
export function clearSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to clear settings:', error);
  }
}

/**
 * Validate if a URL is a valid Confluence URL
 */
export function isValidConfluenceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Check if it's HTTPS
    if (parsed.protocol !== 'https:') {
      return false;
    }

    // Check if it ends with .atlassian.net (Confluence Cloud)
    // or could be a self-hosted instance
    const hostname = parsed.hostname.toLowerCase();

    // Allow Atlassian Cloud URLs
    if (hostname.endsWith('.atlassian.net')) {
      return true;
    }

    // Allow other HTTPS URLs (for self-hosted Confluence)
    // Just ensure it's not localhost or an IP for security
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if settings are configured
 */
export function hasSettings(): boolean {
  const settings = getSettings();
  return settings !== null &&
         settings.confluenceToken.length > 0 &&
         settings.confluenceEmail.length > 0 &&
         settings.confluenceBaseUrl.length > 0;
}
