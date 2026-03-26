// URL del proyecto Supabase
window.SUPABASE_URL = "https://jzfmzzwluqbithqatgbtds.supabase.co";

// Llave ANON pública
window.SUPABASE_ANON_KEY = "sb-publishable_Fo0MKlp7_EzW-Ar6U-zpQA_CqKYYpy7";

// Cliente Supabase V2
const supabaseClient = supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);
