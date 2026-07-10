declare const process: { env: Record<string, string | undefined> };
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
  name: "create_note",
  title: "Create note",
  description: "Create a new note for the signed-in CEO Mind OS user.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Note title."),
    content: z.string().optional().describe("Note body."),
    category: z.string().optional().describe("Optional category label."),
    pinned: z.boolean().optional().describe("Pin the note to the top."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ title, content, category, pinned }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("notes")
      .insert({
        user_id: ctx.getUserId(),
        title,
        content: content ?? "",
        category: category ?? null,
        pinned: pinned ?? false,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { note: data },
    };
  },
});
