import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Minimal typed wrapper — the `supabase.auth.oauth` namespace is beta and may
// not appear on the generated types yet.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauthApi = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        try { localStorage.setItem("pending_return_path", next); } catch { /* ignore */ }
        window.location.href = "/auth?redirect=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) {
          setError(error.message ?? "Could not load this authorization request.");
          return;
        }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        setError(e?.message ?? "Unexpected error");
      }
    })();
    return () => { active = false; };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    try {
      const api = oauthApi();
      const { data, error } = approve
        ? await api.approveAuthorization(authorizationId)
        : await api.denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        setError(error.message ?? "Could not complete this authorization.");
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        setError("No redirect returned by the authorization server.");
        return;
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "Unexpected error");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {details?.client?.name
              ? `Connect ${details.client.name} to CEO Mind OS`
              : "Authorize connection"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!error && !details && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
          {details && (
            <>
              <p className="text-sm">
                This lets{" "}
                <strong>{details.client?.name ?? "this client"}</strong> use CEO
                Mind OS as you. It will be able to call the app's enabled tools
                while you are signed in.
              </p>
              <p className="text-xs text-muted-foreground">
                This does not bypass this app's permissions or backend policies.
              </p>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => decide(true)} disabled={busy} className="flex-1">
                  {busy ? "Working…" : "Approve"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => decide(false)}
                  disabled={busy}
                  className="flex-1"
                >
                  Cancel connection
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
