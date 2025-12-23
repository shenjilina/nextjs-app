import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in Client Components.
 * This uses a singleton pattern to avoid creating multiple clients.
 */
let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
