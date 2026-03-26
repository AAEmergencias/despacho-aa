// ======================================
// AUTH.JS - FASE 4 (Módulo 1)
// Autenticación + Roles + Sesión persistente
// ======================================

// Inicializar cliente Supabase
const supabaseClient = supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);

// Guardar la sesión y rol en localStorage
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
// LOGIN REAL
// ======================================
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Ingrese correo y contraseña");
        return;
    }

    // Intentar iniciar sesión
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Error de inicio de sesión: " + error.message);
        return;
    }

    const session = data.session;

    // Buscar el rol en la tabla user_roles
    const { data: roleData, error: roleError } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

    if (roleError) {
        alert("No tiene un rol asignado.");
        return;
    }

    const role = roleData.role;

    // Guardar la sesión persistente
    saveSession(session, role);

    // Redirigir según rol
    redirectByRole(role);
}

// ======================================
// REDIRECCIÓN
// ======================================
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

// ======================================
// PROTEGER RUTAS SEGÚN ROL
// ======================================
function protectRoute(allowedRoles = []) {
    const session = getSavedSession();
    const role = getSavedRole();

    if (!session || !role) {
        window.location.href = "/login.html";
        return;
    }

    if (!allowedRoles.includes(role)) {
        window.location.href = "/public/index.html";
        return;
    }
}

// ======================================
// LOGOUT
// ======================================
async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.clear();
    window.location.href = "/login.html";
}
