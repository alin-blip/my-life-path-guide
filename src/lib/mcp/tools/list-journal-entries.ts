import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_journal_entries",
  title: "List journal entries",
  description: "List the signed-in user's journal entries, most recent first.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Max entries to return (default 10)."),
    from_date: z.string().optional().describe("Include entries with entry_date >= this ISO date (YYYY-MM-DD)."),
    to_date: z.string().optional().describe("Include entries with entry_date <= this ISO date (YYYY-MM-DD)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, from_date, to_date }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("journal_entries")
      .select("id,title,content,lesson,entry_date,created_at,updated_at")
      .order("entry_date", { ascending: false })
      .limit(limit ?? 10);
    if (from_date) q = q.gte("entry_date", from_date);
    if (to_date) q = q.lte("entry_date", to_date);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { entries: data ?? [] },
    };
  },
});
