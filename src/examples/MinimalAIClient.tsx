import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Minimal example showing how to call the ai-live-coaching edge function
// Not wired into any route; import and render where you need it

export default function MinimalAIClient() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const nextMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-live-coaching", {
        body: {
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt:
            "You are a concise coaching assistant. Be specific. If user asks for a next action, give a single clear step.",
        },
      });

      if (error) throw error;
      const reply = (data as any)?.message || (data as any)?.generatedText || "(no response)";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Eroare la apelul AI",
        description: e?.message || "Încearcă din nou",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto space-y-4">
      <header>
        <h1 className="text-xl font-semibold">Minimal AI Client</h1>
        <p className="text-sm opacity-80">Calls the ai-live-coaching edge function</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 max-h-64 overflow-auto rounded-md border p-3">
            {messages.map((m, i) => (
              <div key={i} className="text-sm">
                <strong>{m.role === "user" ? "You" : "AI"}:</strong> {m.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <Textarea
            placeholder="Scrie mesajul..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                send();
              }
            }}
          />
          <div className="flex gap-2">
            <Button onClick={send} disabled={loading}>
              {loading ? "Se trimite..." : "Trimite"}
            </Button>
            <Button variant="outline" onClick={() => setMessages([])} disabled={loading}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
