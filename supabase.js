/* =========================================================
   LEX ONE - SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
  "https://ymeetoihaszqswvhdnmm.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_B07z940MOZc1vLijvxo7DA_c3Mh_ixb";

if (
  !window.supabase ||
  !window.supabase.createClient
) {
  console.error(
    "Supabase library was not loaded."
  );
} else {

  window.supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

  console.log(
    "LEX ONE Supabase connected."
  );
}
