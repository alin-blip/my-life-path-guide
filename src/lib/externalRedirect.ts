/**
 * Helper for safely redirecting to external URLs (e.g., Stripe Checkout)
 * Handles iframe environments (Lovable preview) by opening in new tab or top window
 */

/**
 * Detects if the app is running inside an iframe
 */
export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to cross-origin, we're in an iframe
    return true;
  }
};

/**
 * Safely redirects to an external URL
 * - In iframe: Opens in new tab or navigates top window
 * - Outside iframe: Uses window.location.href
 * 
 * @param url The external URL to redirect to
 * @param preOpenedWindow Optional pre-opened window (for async operations)
 */
export const redirectExternal = (url: string, preOpenedWindow?: Window | null): void => {
  const inIframe = isInIframe();
  
  console.log('[externalRedirect]', { url: url.substring(0, 50) + '...', inIframe });
  
  if (inIframe) {
    // Strategy for iframe: try new tab first, then top window
    if (preOpenedWindow && !preOpenedWindow.closed) {
      // Use pre-opened window to avoid popup blocker
      preOpenedWindow.location.href = url;
      console.log('[externalRedirect] Used pre-opened window');
      return;
    }
    
    // Try opening new tab
    const newWindow = window.open(url, '_blank');
    if (newWindow && !newWindow.closed) {
      console.log('[externalRedirect] Opened in new tab');
      return;
    }
    
    // Fallback: try to navigate top window
    try {
      if (window.top) {
        window.top.location.href = url;
        console.log('[externalRedirect] Navigated top window');
        return;
      }
    } catch (e) {
      console.warn('[externalRedirect] Cannot access top window:', e);
    }
    
    // Last resort: try regular redirect (may fail in iframe)
    window.location.href = url;
    console.log('[externalRedirect] Fallback to window.location');
  } else {
    // Not in iframe - simple redirect
    window.location.href = url;
    console.log('[externalRedirect] Direct redirect');
  }
};

/**
 * Pre-opens a window to avoid popup blocker
 * Call this synchronously in click handler BEFORE async operations
 */
export const preOpenWindow = (): Window | null => {
  if (isInIframe()) {
    const w = window.open('about:blank', '_blank');
    if (w) {
      // Show loading state
      w.document.write(`
        <html>
          <head><title>Loading...</title></head>
          <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#1a1a2e;color:#fff;font-family:system-ui;">
            <div style="text-align:center;">
              <div style="width:40px;height:40px;border:3px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>
              <p>Loading checkout...</p>
            </div>
            <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
          </body>
        </html>
      `);
    }
    return w;
  }
  return null;
};
