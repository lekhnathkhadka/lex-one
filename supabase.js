/* =========================================================
   LEX ONE — SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
  "https://ymeetoihaszqswvhdnmm.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_B07z940MOZC1vLijvxo7DA_c3Mh_ixb";

/* =========================================================
   CHECK SUPABASE LIBRARY
========================================================= */

if (
  !window.supabase ||
  typeof window.supabase.createClient !== "function"
) {
  console.error(
    "LEX ONE ERROR: Supabase library was not loaded."
  );

  window.supabaseClient = null;

} else {

  /* =======================================================
     CREATE SUPABASE CLIENT
  ======================================================= */

  window.supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );

  console.log(
    "LEX ONE: Supabase connected successfully."
  );
}
