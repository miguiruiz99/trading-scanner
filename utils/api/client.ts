import { createClient } from "@supabase/supabase-js";

export async function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_API_BASE_URL!,
    process.env.NEXT_PUBLIC_API_KEY!
  );
}
