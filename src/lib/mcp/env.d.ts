// Deno-side globals used inside MCP tool handlers. The tool files live in
// src/lib/mcp/ so Vite type-checks them, but their handlers actually execute
// inside the generated Supabase Edge Function (Deno) where `process.env`
// is polyfilled by Deno. This ambient declaration keeps tsgo happy without
// pulling in @types/node.
declare const process: {
  env: Record<string, string | undefined>;
};
