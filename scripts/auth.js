// ======================================
// AUTH.JS - Sistema de Login + Roles + Rutas para GitHub Pages
// ======================================

// Crear cliente Supabase (V2)
const supabaseClient = supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);

// Guardar sesión y rol (persistente)
function saveSession(session, role) {
    localStorage.setItem("sb_session", JSON.stringify(session));
    localStorage.setItem("sb_role", role);
}

// Obtener sesión guardada
function getSavedSession() {
    return JSON.parse(localStorage.getItem("sb_session"));
}

// Obtener rol guardado
function getSavedRole() {
    return localStorage.getItem("sb_role");
}

// ======================================
// LOGIN REAL SUPABASE
// ======================================
async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Ingrese correo y contraseña.");
        return;
    }

    // Iniciar sesión en Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Error al iniciar sesión: " + error.message);
        return;
    }

    const session = data.session;

    // Buscar rol en user_roles
    const { data: roleData, error: roleError } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

    if (roleError || !roleData) {
        alert("No tiene un rol asignado.");
        return;
    }

    const role = roleData.role;

    // Guardar sesión
    saveSession(session, role);

    // Redirigir según rol (IMPORTANTE para GitHub Pages)
    redirectByRole(role);
}

// ======================================
// REDIRECCIÓN POR ROL (VERSIÓN CORRECTA PARA GITHUB PAGES)
// ======================================
function redirectByRole(role) {

    switch (role) {
        case "admin":
            window.location.href = "./admin/index.html";
            break;
        case "supervisor":
            window.location.href = "./supervisor/index.html";
            break;
        case "operador":
            window.location.href = "./operator/index.html";
            break;
        default:
            window.location.href = "./public/index.html";
    }
}
// ======================================
// PROTEGER RUTAS SEGÚN ROL
// ======================================
function protectRoute(allowedRoles = []) {
    const session = getSavedSession();
    const role = getSavedRole();

    if (!session || !role) {
        window.location.href = "/despacho-aa/login.html";
        return;
    }

    if (!allowedRoles.includes(role)) {
        window.location.href = "/despacho-aa/public/index.html";
        return;
    }
}
// ======================================
// LOGOUT
// ======================================
async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.clear();
    window.location.href = "/despacho-aa/login.html";
}
