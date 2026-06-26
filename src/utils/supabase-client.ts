import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createSkeletalClient(): SupabaseClient {
    return createClient(
        "https://placeholder.supabase.co",
        "placeholder-anon-key",
    );
}

export const supabase: SupabaseClient =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey, {
              auth: {
                  persistSession: true,
                  autoRefreshToken: true,
              },
          })
        : (() => {
              console.warn(
                  "Supabase credentials missing. Skeletal client initialized for build generation.",
              );
              return createSkeletalClient();
          })();
