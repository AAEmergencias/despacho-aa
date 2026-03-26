// Vehicles logic placeholder// ===============================
// vehicles.js - FASE 4 (Bloque 1)
// Sistema CAD estilo CBS
// ===============================

// Objeto global donde guardaremos marcadores en el mapa
let vehicleMarkers = {};

// Inicializar mapa Leaflet (oscuro estilo CBS)
function initVehicleMap() {
    const map = L.map("map", {
        zoomControl: true,
        preferCanvas: true,
    }).setView([-33.45, -70.66], 12);

    // Capa Carto Dark Matter
    L.tileLayer(
        https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png,
        {
            maxZoom: 19,
            attribution: "&copy; CARTO",
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
