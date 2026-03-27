// ===============================
// SUPABASE CLIENT - CONFIGURACIÓN FINAL
// ===============================

window.SUPABASE_URL = "https://jzfmzzwluqbihtagbtds.supabase.co";
window.SUPABASE_ANON_KEY = "sb-publishable_Fo0MKlp7_EzW-Ar6U-zpQA_CqKYYPy7";

// Crear cliente Supabase V2
const supabaseClient = supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);
