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

// ===== FUNNEL TRACKING EVENTS =====

// Track quiz completion
export const trackQuizCompleted = (quizType: string, score?: number) => {
  trackEvent('CompleteRegistration', { 
    content_name: quizType,
    value: score,
    currency: 'EUR'
  });
  console.log(`[Funnel] Quiz completed: ${quizType}, score: ${score}`);
};

// Track account creation
export const trackAccountCreated = (source: string) => {
  trackEvent('StartTrial', { 
    content_name: source,
    currency: 'EUR',
    value: 0
  });
  console.log(`[Funnel] Account created from: ${source}`);
};

// Track challenge day started
export const trackChallengeDayStarted = (dayNumber: number) => {
  trackEvent('ViewContent', { 
    content_name: `challenge_day_${dayNumber}`,
    content_type: 'challenge'
  });
  console.log(`[Funnel] Challenge Day ${dayNumber} started`);
};

// Track checkout initiated
export const trackCheckoutInitiated = (planId: string, value: number, currency: string = 'EUR') => {
  trackEvent('InitiateCheckout', { 
    content_name: planId,
    value,
    currency
  });
  console.log(`[Funnel] Checkout initiated: ${planId}, ${value} ${currency}`);
};
