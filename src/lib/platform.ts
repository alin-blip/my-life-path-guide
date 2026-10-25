import { Capacitor } from "@capacitor/core";

/**
 * True only in a Capacitor iOS/Android shell. Browser previews and ceomindos.com
 * keep the web experience unchanged.
 */
export function isNativeMobileApp(): boolean {
  return Capacitor.isNativePlatform();
}
