// Facebook Pixel Module
// ID: 974405070779975

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

export const FB_PIXEL_ID = '974405070779975';

// Track Lead event
export const trackLead = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead');
    console.log('[FB Pixel] Lead event tracked');
  }
};

// Track Purchase event
export const trackPurchase = (value: number, currency: string = 'EUR') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', { 
      value, 
      currency 
    });
    console.log(`[FB Pixel] Purchase event tracked: ${value} ${currency}`);
  }
};

// Track custom event
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
    console.log(`[FB Pixel] ${eventName} event tracked`, params);
  }
};
