/**
 * Analytics Integration
 * 
 * Supports PostHog (1M events/month free) or Umami (self-hosted, unlimited)
 * Zero cost for both options
 */

export interface AnalyticsConfig {
  provider: 'posthog' | 'umami' | 'plausible';
  apiKey: string;
  domain?: string;
  scriptUrl?: string;
}

/**
 * PostHog analytics (1M events/month free)
 */
export const posthog = {
  name: 'PostHog',
  freeTier: '1M events/month',
  
  getScript(config: AnalyticsConfig): string {
    return `
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init('${config.apiKey}', {
    api_host: '${config.scriptUrl || 'https://app.posthog.com'}',
    loaded: function(posthog) {
      if (posthog.debug) {
        console.log('PostHog loaded');
      }
    }
  });
</script>`.trim();
  },
  
  identify(userId: string, properties?: Record<string, string>): string {
    return `posthog.identify('${userId}', ${JSON.stringify(properties || {})});`;
  },
  
  track(event: string, properties?: Record<string, string | number>): string {
    return `posthog.capture('${event}', ${JSON.stringify(properties || {})});`;
  },
  
  page(name?: string): string {
    return `posthog.capture('$pageview', ${JSON.stringify({ $current_url: window.location.href, ...(name ? { name } : {}) })});`;
  },
};

/**
 * Umami analytics (self-hosted, unlimited)
 */
export const umami = {
  name: 'Umami',
  freeTier: 'Unlimited (self-hosted)',
  
  getScript(config: AnalyticsConfig): string {
    const scriptUrl = config.scriptUrl || 'https://analytics.yourdomain.com';
    return `<script defer src="${scriptUrl}/script.js" data-website-id="${config.apiKey}"></script>`;
  },
  
  track(event: string, data?: Record<string, string | number>): string {
    return `window.umami.track('${event}', ${JSON.stringify(data || {})});`;
  },
};

/**
 * Plausible analytics (self-hosted, unlimited)
 */
export const plausible = {
  name: 'Plausible',
  freeTier: 'Unlimited (self-hosted)',
  
  getScript(config: AnalyticsConfig): string {
    const scriptUrl = config.scriptUrl || 'https://analytics.yourdomain.com';
    return `<script defer data-domain="${config.domain}" src="${scriptUrl}/js/script.js"></script>`;
  },
  
  pageview(url?: string): string {
    return `window.plausible('pageview', ${JSON.stringify({ url: url || window.location.href })});`;
  },
  
  event(name: string, props?: Record<string, string | number>): string {
    return `window.plausible('${name}', ${JSON.stringify({ props: props || {} })});`;
  },
};

/**
 * Get analytics provider by name
 */
export function getAnalytics(provider: AnalyticsConfig['provider']) {
  switch (provider) {
    case 'posthog': return posthog;
    case 'umami': return umami;
    case 'plausible': return plausible;
  }
}

/**
 * Environment variables needed:
 * 
 * PostHog:
 *   PUBLIC_POSTHOG_KEY=phc_xxxxx
 *   PUBLIC_POSTHOG_HOST=https://app.posthog.com
 * 
 * Umami:
 *   PUBLIC_UMAMI_WEBSITE_ID=xxxxx
 *   PUBLIC_UMAMI_SCRIPT_URL=https://analytics.yourdomain.com
 * 
 * Plausible:
 *   PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
 *   PUBLIC_PLAUSIBLE_SCRIPT_URL=https://analytics.yourdomain.com
 */
