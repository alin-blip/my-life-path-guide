/**
 * Have I Been Pwned (HIBP) Password Check Service
 * 
 * Uses k-anonymity to check if a password has been exposed in data breaches
 * without ever sending the full password over the network.
 * 
 * How it works:
 * 1. Compute SHA-1 hash of the password locally
 * 2. Send only first 5 characters of the hash to HIBP API
 * 3. Receive list of matching hash suffixes
 * 4. Check locally if full hash exists in the response
 */

const HIBP_API_TIMEOUT_MS = 3000;

/**
 * Computes SHA-1 hash of a string using Web Crypto API
 */
async function computeSHA1(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export interface HIBPResult {
  isBreached: boolean;
  breachCount: number;
  error?: string;
}

/**
 * Check if a password has been exposed in known data breaches
 * 
 * @param password - The password to check
 * @returns Object with isBreached (boolean), breachCount (number), and optional error
 */
export async function checkPasswordBreached(password: string): Promise<HIBPResult> {
  // Don't check empty or very short passwords
  if (!password || password.length < 4) {
    return { isBreached: false, breachCount: 0 };
  }

  try {
    // Step 1: Compute SHA-1 hash
    const hash = await computeSHA1(password);
    
    // Step 2: Split into prefix (5 chars) and suffix
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);
    
    // Step 3: Query HIBP API with prefix only (k-anonymity)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HIBP_API_TIMEOUT_MS);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'Add-Padding': 'true', // Adds padding to prevent response size analysis
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // API error - fail open (allow registration)
      console.warn('HIBP API error:', response.status);
      return { isBreached: false, breachCount: 0, error: 'API_ERROR' };
    }
    
    const text = await response.text();
    
    // Step 4: Search for our suffix in the response
    // Response format: "SUFFIX:COUNT\r\n" per line
    const lines = text.split('\r\n');
    
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix === suffix) {
        const count = parseInt(countStr, 10) || 0;
        return { isBreached: true, breachCount: count };
      }
    }
    
    // Password not found in breaches
    return { isBreached: false, breachCount: 0 };
    
  } catch (error: any) {
    // Timeout or network error - fail open (allow registration)
    if (error.name === 'AbortError') {
      console.warn('HIBP API timeout');
      return { isBreached: false, breachCount: 0, error: 'TIMEOUT' };
    }
    
    console.warn('HIBP check error:', error);
    return { isBreached: false, breachCount: 0, error: 'NETWORK_ERROR' };
  }
}

/**
 * Format breach count for display
 */
export function formatBreachCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
}
