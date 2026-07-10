import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoami from "./tools/whoami";
import listNotes from "./tools/list-notes";
import createNote from "./tools/create-note";
import listJournalEntries from "./tools/list-journal-entries";
import createJournalEntry from "./tools/create-journal-entry";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "ceo-mind-os-mcp",
  title: "CEO Mind OS",
  version: "0.1.0",
  instructions:
    "Tools for CEO Mind OS — the Founder Operating System. Use `whoami` to verify the connection, `list_notes` / `create_note` to work with the user's notes, and `list_journal_entries` / `create_journal_entry` to work with journal entries. All tools act as the signed-in user; data is scoped by row-level security.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoami, listNotes, createNote, listJournalEntries, createJournalEntry],
});
