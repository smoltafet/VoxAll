/**
 * Logger utility that logs to both browser console and server terminal
 * In development, logs appear in both browser console and terminal (via API route)
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Send log to server for terminal visibility
const logToServer = async (category: string, message: string, data?: any) => {
  if (typeof window === 'undefined') return; // Server-side, skip
  
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, message, data }),
    }).catch(() => {
      // Silently fail if logging endpoint doesn't exist
    });
  } catch {
    // Ignore errors
  }
};

export const logger = {
  /**
   * Log debug information
   * Logs to browser console AND terminal (via server API)
   */
  debug: (category: string, message: string, data?: any) => {
    const logMessage = `[${category}] ${message}`;
    
    // Always log to browser console
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }

    // Also send to server for terminal visibility
    if (isDevelopment && typeof window !== 'undefined') {
      logToServer(category, message, data);
    }
  },

  /**
   * Log error information
   */
  error: (category: string, message: string, error?: any) => {
    const logMessage = `[${category}] ${message}`;
    
    if (error) {
      console.error(logMessage, error);
    } else {
      console.error(logMessage);
    }

    // Also send to server for terminal visibility
    if (isDevelopment && typeof window !== 'undefined') {
      logToServer(category, message, error);
    }
  },

  /**
   * Log info
   */
  info: (category: string, message: string, data?: any) => {
    const logMessage = `[${category}] ${message}`;
    
    if (data) {
      console.info(logMessage, data);
    } else {
      console.info(logMessage);
    }

    // Also send to server for terminal visibility
    if (isDevelopment && typeof window !== 'undefined') {
      logToServer(category, message, data);
    }
  },
};
