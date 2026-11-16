import { createClient } from "@supabase/supabase-js";
import type { Database } from "@schema/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Browser client. Session is kept in localStorage; fine for the Phase 1 skeleton.
export const supabase = createClient<Database>(url, anonKey);

export const ALLOWED_EMAIL_DOMAIN = "northeastern.edu";

export function isAllowedEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}
