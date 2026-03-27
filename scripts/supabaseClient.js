// ===============================
// SUPABASE CLIENT - CONFIGURACIÓN FINAL
// ===============================

window.SUPABASE_URL = "https://jzfmzzwluqbihtagbtds.supabase.co";

window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Zm16endsdXFiaWh0YWdidGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjI2MzgsImV4cCI6MjA5MDA5ODYzOH0.VB7kVCLobmRmKxXI0e0BoSr4mAmb5wpYQsS_fOUUZZ4";

// Crear cliente Supabase V2
const supabaseClient = supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);
