// ===============================
// Mapa claro OpenStreetMap
// ===============================

let vehicleMarkers = {};

function initVehicleMap() {
    const map = L.map("map", {
        zoomControl: true,
        preferCanvas: true
    }).setView([-33.45, -70.66], 12);

    // Capa clara estilo estándar (OSM)
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    return map;
}

let vehicleMap = initVehicleMap();
// ===============================
// BLOQUE 2 — Alternador de modo de mapa (oscuro / claro)
// ===============================

// Capas de mapa disponibles
const darkTile = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    { maxZoom: 19, attribution: "&copy; CARTO (Dark Matter)" }
);

const lightTile = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    { maxZoom: 19, attribution: "&copy; CARTO (Positron)" }
);

// Estado global del tema
let currentTheme = "dark";

// Aplicar tema inicial
darkTile.addTo(vehicleMap);

// Función para cambiar tema
function toggleMapTheme() {
    if (currentTheme === "dark") {
        vehicleMap.removeLayer(darkTile);
        vehicleMap.addLayer(lightTile);
        currentTheme = "light";
    } else {
        vehicleMap.removeLayer(lightTile);
        vehicleMap.addLayer(darkTile);
        currentTheme = "dark";
    }
}
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
