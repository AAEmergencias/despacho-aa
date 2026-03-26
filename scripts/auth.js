// ========================
// AUTH.JS FINAL
// ========================

// Guardar sesión
function saveSession(session, role) {
    localStorage.setItem("sb_session", JSON.stringify(session));
    localStorage.setItem("sb_role", role);
}

// Obtener sesión
function getSavedSession() {
    return JSON.parse(localStorage.getItem("sb_session"));
}
function getSavedRole() {
    return localStorage.getItem("sb_role");
}

// LOGIN
async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Ingrese correo y contraseña.");
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Error al iniciar sesión: " + error.message);
        return;
    }

    const session = data.session;

    // Buscar rol
    const { data: roleData, error: roleError } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

    if (roleError || !roleData) {
        alert("No tiene rol asignado.");
        return;
    }

    const role = roleData.role;
    saveSession(session, role);
    redirectByRole(role);
}

// REDIRECT POR ROL
function redirectByRole(role) {
    switch (role) {
        case "admin":
            window.location.href = "admin/index.html";
            break;

        case "operador":
            window.location.href = "operator/index.html";
            break;

        case "visor":
            window.location.href = "public/index.html";
            break;

        default:
            window.location.href = "login.html";
    }
}

// PROTEGER RUTAS SEGÚN ROL
function protectRoute(allowedRoles = []) {
    const session = getSavedSession();
    const role = getSavedRole();

    if (!session || !role) {
        window.location.href = "../login.html";
        return;
    }

    if (!allowedRoles.includes(role)) {
        window.location.href = "../public/index.html";
        return;
    }
}

// LOGOUT
async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.clear();
    window.location.href = "../login.html";
}
