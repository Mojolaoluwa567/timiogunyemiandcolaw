/* ==========================================================================
   Supabase client — shared by every page that talks to the database.

   HOW TO FILL THIS IN:
   1. Go to your Supabase project → Project Settings → API.
   2. Copy the "Project URL" into SUPABASE_URL below.
   3. Copy the "anon public" key into SUPABASE_ANON_KEY below.
   The anon key is safe to expose in client-side code — it only grants
   whatever access your Row Level Security policies allow (see
   supabase/schema.sql). It is NOT a secret admin key.
   ========================================================================== */
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";

if (
  SUPABASE_URL.includes("YOUR-PROJECT-REF") ||
  SUPABASE_ANON_KEY.includes("YOUR-ANON-PUBLIC-KEY")
) {
  console.warn(
    "Supabase is not configured yet — edit assets/supabase-client.js with your project's URL and anon key.",
  );
}

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);
