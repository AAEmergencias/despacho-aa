// ======================
// CONFIGURACIÓN DEL MAPA
// ======================
const map = L.map('map').setView([-33.45, -70.66], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
}).addTo(map);

// ======================
// VEHÍCULOS PRE-CARGADOS
// ======================
const vehicles = [
    { id: "B-1", type: "Bomba", sector: "Norte", coords: [-33.42, -70.65], status: "Disponible" },
    { id: "RX-7", type: "Rescate", sector: "Centro", coords: [-33.47, -70.66], status: "Disponible" },
    { id: "Q-10", type: "Carro Escala", sector: "Sur", coords: [-33.49, -70.68], status: "Fuera de Servicio" },
];

const vehicleMarkers = {};

function loadVehicles() {
    const list = document.getElementById("vehicleList");
    list.innerHTML = "";

    vehicles.forEach(v => {
        const li = document.createElement("li");
        li.textContent = `${v.id} – ${v.type} (${v.status})`;
        list.appendChild(li);

        // Crear marcadores
        const marker = L.marker(v.coords, { title: v.id }).addTo(map);
        marker.bindPopup(
            `<b>${v.id}</b><br>
             Tipo: ${v.type}<br>
             Sector: ${v.sector}<br>
             Estado: ${v.status}`
        );
        vehicleMarkers[v.id] = marker;
    });
}

// ======================
// EMERGENCIAS
// ======================
let incidents = [];
let incidentCounter = 1;

map.on("click", function (e) {
    const coords = e.latlng;

    const incident = {
        id: "INC-" + incidentCounter++,
        coords,
        time: new Date().toLocaleString(),
        assigned: [],
    };

    incidents.push(incident);
    renderIncidents();

    const marker = L.marker(coords, { icon: redIcon })
        .addTo(map)
        .bindPopup(`<b>${incident.id}</b><br>${incident.time}`)
        .openPopup();
});

// Icono rojo para emergencias
const redIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/463/463292.png",
    iconSize: [32, 32],
});

// Mostrar emergencias en sidebar
function renderIncidents() {
    const list = document.getElementById("incidentList");
    list.innerHTML = "";

    incidents.forEach(inc => {
        const li = document.createElement("li");
        li.textContent = `${inc.id} – ${inc.time}`;
        list.appendChild(li);
    });
}

// ======================
loadVehicles();