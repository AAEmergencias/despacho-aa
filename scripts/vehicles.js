// ===============================
// MAPAS DEL SISTEMA CAD
// ===============================

let vehicleMarkers = {};

// Inicializar Mapa
function initVehicleMap() {
    const map = L.map("map", {
        zoomControl: true,
        preferCanvas: true
    }).setView([-33.45, -70.66], 12);

    // Mapa claro — OSM estándar
    const lightTile = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    );

    // Mapa alternativo — CARTO Voyager (tu imagen)
    const voyagerTile = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
            maxZoom: 19,
            attribution: "&copy; CARTO — Voyager"
        }
    );

    // Guardamos globalmente
    window.lightTile = lightTile;
    window.voyagerTile = voyagerTile;
    window.currentTheme = "light";

    // Capa inicial
    lightTile.addTo(map);

    return map;
}

let vehicleMap = initVehicleMap();


// ===============================
// Alternador de mapa
// ===============================
function toggleMapTheme() {
    if (window.currentTheme === "light") {
        vehicle
        
// ======================================
// BLOQUE 4 — Cargar vehículos desde Supabase
// ======================================

// Lista global de vehículos
let vehicles = [];

// Función que obtiene vehículos desde Supabase
async function loadVehicles() {
    const { data, error } = await supabaseClient
        .from("vehicles")
        .select("*");

    if (error) {
        console.error("Error cargando vehículos:", error);
        return;
    }

    vehicles = data;
    renderVehiclesOnMap();
    renderVehicleList();
}
