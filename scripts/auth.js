// ================================
// AUTH.JS - FASE 4 (Bloque 1)
// Autenticación + Roles + Sesión
// ================================

// Crear cliente Supabase
const supabaseClient = supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);

// Guardar sesión en localStorage
function saveSession(session, role) {
    localStorage.setItem("sb_session", JSON.stringify(session));
    localStorage.setItem("sb_role", role);
}

// Obtener sesión desde localStorage
function getSavedSession() {
    return JSON.parse(localStorage.getItem("sb_session"));
}

function getSavedRole() {
    return localStorage.getItem("sb_role");
}
// =======================
// LOGIN
// =======================
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Ingrese correo y contraseña");
        return;
    }

    // Iniciar sesión con Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Error al iniciar sesión: " + error.message);
        return;
    }

    const session = data.session;

    // Obtener rol desde tabla user_roles
    const { data: roleData } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

    const role = roleData ? roleData.role : "visor";

    // Guardar sesión persistente
    saveSession(session, role);

    // Redirigir según rol
    redirectByRole(role);
}
// =======================
// REDIRECCIÓN POR ROL
// =======================
function redirectByRole(role) {
    switch (role) {
        case "admin":
            window.location.href = "/admin/index.html";
            break;
        case "supervisor":
            window.location.href = "/supervisor/index.html";
            break;
        case "operador":
            window.location.href = "/operator/index.html";
            break;
        default:
            window.location.href = "/public/index.html";
    }
}
// =============================
// PROTEGER RUTAS
// =============================
async function protectRoute(allowedRoles = []) {
    const session = getSavedSession();
    const role = getSavedRole();

    if (!session || !role) {
        window.location.href = "/login.html";
// =============================
// LOGOUT
// =============================
async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.clear();
    window.location.href = "/login.html";
}
      
