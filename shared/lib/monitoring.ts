/**
 * Monitoring Utility
 * 
 * Supports Sentry and GlitchTip (Sentry-compatible)
 * 
 * Sentry free tier: 5,000 events/month
 * GlitchTip free tier: 1,000 events/month
 */

export interface MonitoringConfig {
  dsn: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
}

/**
 * Initialize monitoring (Sentry/GlitchTip)
 * Add this to your Astro config or layout
 */
export function initMonitoring(config: MonitoringConfig) {
  if (typeof window === 'undefined') return;

  // Dynamic import to avoid SSR issues
  import('@sentry/browser').then((Sentry) => {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment || 'production',
      release: config.release,
      tracesSampleRate: config.tracesSampleRate || 0.1,
    });
  }).catch(() => {
    console.warn('Sentry not available, skipping monitoring initialization');
  });
}

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  import('@sentry/browser').then((Sentry) => {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }).catch(() => {
    console.error('Monitoring unavailable:', error);
  });
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window === 'undefined') return;

  import('@sentry/browser').then((Sentry) => {
    Sentry.captureMessage(message, level);
  }).catch(() => {
    console.log(`[${level}] ${message}`);
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(category: string, message: string, data?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  import('@sentry/browser').then((Sentry) => {
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });
  }).catch(() => {
    // Silently fail
  });
}

/**
 * Environment variables needed:
 * 
 * SENTRY_DSN=https://your-dsn@sentry.io/project-id
 * SENTRY_ENVIRONMENT=production
 * SENTRY_RELEASE=1.0.0
 */
