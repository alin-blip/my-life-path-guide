import { isNativeMobileApp } from "@/lib/platform";
import { supabase } from "../supabase/client";

type OAuthProvider = "google" | "apple";

/**
 * Lovable's cloud OAuth endpoint is browser-only. In a Capacitor app it resolves
 * to an internal preview route that is unavailable in the packaged WebView.
 * E-mail/password authentication remains available through Supabase.
 */
export const lovable = {
  auth: {
    signInWithOAuth: async (provider: OAuthProvider, opts?: { redirect_uri?: string }) => {
      if (isNativeMobileApp()) {
        return { error: new Error("Social sign-in is not yet available in the mobile app. Please use your CEO Mind OS e-mail and password.") };
      }

      const { createLovableAuth } = await import("@lovable.dev/cloud-auth-js");
      const lovableAuth = createLovableAuth(import.meta.env.VITE_SUPABASE_PROJECT_ID);
      const result = await lovableAuth.signInWithOAuth(provider, {
        ...opts,
      });

      if (result.redirected) {
        return result;
      }

      if (result.error) {
        return result;
      }

      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    },
  },
};
