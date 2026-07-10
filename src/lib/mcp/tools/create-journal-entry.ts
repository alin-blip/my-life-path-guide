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
  name: "create_journal_entry",
  title: "Create journal entry",
  description: "Create a journal entry for the signed-in CEO Mind OS user.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Entry title."),
    content: z.string().optional().describe("Journal body / reflection."),
    lesson: z.string().optional().describe("Key lesson or insight."),
    entry_date: z.string().optional().describe("Date of the entry (YYYY-MM-DD). Defaults to today."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ title, content, lesson, entry_date }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const date = entry_date ?? new Date().toISOString().slice(0, 10);
    const { data, error } = await supabaseForUser(ctx)
      .from("journal_entries")
      .insert({
        user_id: ctx.getUserId(),
        title,
        content: content ?? "",
        lesson: lesson ?? null,
        entry_date: date,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { entry: data },
    };
  },
});
