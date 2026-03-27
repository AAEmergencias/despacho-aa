// ========================================================
// VEHICLES.JS - Sistema CAD con etiquetas tipo “chip”
// Compatible con Operador, Admin y Visor (Public)
// ========================================================

// Mapa global
let map;
let vehicleMarkers = {};
let selectedVehicleForStationChange = null;

// ========================================================
// 1. Inicializar mapa
// ========================================================
function initMap() {
    map = L.map("map").setView([-33.45, -70.65], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
    }).addTo(map);

    loadVehiclesOnMap();
    updateVehicleList();
    subscribeRealtime();
}

document.addEventListener("DOMContentLoaded", initMap);

// ========================================================
// 2. Obtener datos desde Supabase
// ========================================================
async function getVehicles() {
    const { data, error } = await supabaseClient
        .from("vehicles")
        .select("*")
        .eq("active", true);

    if (error) console.error("Error cargando vehículos:", error);
    return data;
}

async function getStations() {
    const { data } = await supabaseClient
        .from("stations")
        .select("*")
        .order("name");

    return data || [];
}

// ========================================================
// 3. Colores según estado 6-X
// ========================================================
function getStateColor(radial) {
    switch (radial) {
        case "6-3": return "red";     // En el lugar
        case "6-8": return "yellow";  // Disponible
        case "6-9": return "green";   // Se retira / en servicio
        case "6-10": return "blue";   // En base
        default: return "gray";
    }
}

// ========================================================
// 4. Crear etiqueta tipo “chip” como icono Leaflet
// ========================================================
function getVehicleLabelIcon(texto, color) {

    const labelClass = {
        red: "vehicle-label-red",
        yellow: "vehicle-label-yellow",
        green: "vehicle-label-green",
        blue: "vehicle-label-blue",
        gray: "vehicle-label-gray"
    }[color];

    return L.divIcon({
        className: "vehicle-label " + labelClass,
        html: `<div class="vehicle-label ${labelClass}">${texto}</div>`,
        iconSize: null,
        iconAnchor: [20, 10]
    });
}

// ========================================================
// 5. Pintar vehículos en el mapa
// ========================================================
async function loadVehiclesOnMap() {
    const vehicles = await getVehicles();

    vehicles.forEach(v => {
        const color = getStateColor(v.state);
        const icon = getVehicleLabelIcon(v.callsign, color);

        if (!vehicleMarkers[v.id]) {
            vehicleMarkers[v.id] = L.marker([v.lat, v.lon], { icon }).addTo(map);
        } else {
            vehicleMarkers[v.id].setLatLng([v.lat, v.lon]);
            vehicleMarkers[v.id].setIcon(icon);
        }
    });
}

// ========================================================
// 6. Panel lateral — Lista de vehículos
// ========================================================
async function updateVehicleList() {
    const list = document.getElementById("vehicleList");
    if (!list) return; // Public puede no tener sidebar

    list.innerHTML = "";

    const vehicles = await getVehicles();

    vehicles.forEach(v => {
        const color = getStateColor(v.state);

        const div = document.createElement("div");
        div.innerHTML = `
            <div style="
                background:#1c1c1c;
                border-left:8px solid ${
                    color === 'red' ? '#dc3545' :
                    color === 'yellow' ? '#ffc107' :
                    color === 'green' ? '#28a745' :
                    color === 'blue' ? '#007bff' : '#6c757d'
                };
                padding:10px;
                margin-bottom:12px;
                border:1px solid #444;
            ">
                <strong>${v.callsign} - ${v.name}</strong><br>
                Radial: <span style="color:${color}">${v.state}</span><br>
                Última act: ${new Date(v.last_update).toLocaleString()}<br><br>

                <!-- Botones solo si la vista tiene privilegio -->
                <button onclick="setVehicleState('${v.id}','6-3')"
                        style="padding:4px;background:#dc3545;color:white;margin-right:4px;">
                    6-3
                </button>

                <button onclick="setVehicleState('${v.id}','6-8')"
                        style="padding:4px;background:#ffc107;color:black;margin-right:4px;">
                    6-8
                </button>

                <button onclick="setVehicleState('${v.id}','6-9')"
                        style="padding:4px;background:#28a745;color:white;margin-right:4px;">
                    6-9
                </button>

                <button onclick="setVehicleState('${v.id}','6-10')"
                        style="padding:4px;background:#007bff;color:white;margin-right:4px;">
                    6-10
                </button>

                <br><br>

                <button onclick="openStationSelector('${v.id}')"
                        style="padding:6px;background:#007bff;color:white;">
                    Cambiar Cuartel
                </button>
            </div>
        `;

        list.appendChild(div);
    });
}

// ========================================================
// 7. Selector de cuartel
// ========================================================
async function openStationSelector(vehicleId) {
    selectedVehicleForStationChange = vehicleId;

    const stations = await getStations();

    let html = `
        <div style="background:#222; padding:15px; border:1px solid #444; border-radius:6px; margin-top:15px;">
            <h3>Cambiar Cuartel</h3>
            <select id="stationSelector"
                    style="padding:8px; width:100%; background:#333; color:white;">
    `;

    stations.forEach(s => {
        html += `<option value="${s.id}">${s.name}</option>`;
    });

    html += `
            </select><br><br>
            <button onclick="applyStationChange()"
                    style="padding:8px;background:#28a745;color:white;">
                Guardar Cambio
            </button>
        </div>
    `;

    const panel = document.getElementById("stationChangePanel");
    if (panel) panel.innerHTML = html;
}

// ========================================================
// 8. Guardar cambio de cuartel
// ========================================================
async function applyStationChange() {
    const stationId = document.getElementById("stationSelector").value;

    await supabaseClient
        .from("vehicles")
        .update({
            station_id: stationId,
            last_update: new Date().toISOString()
        })
        .eq("id", selectedVehicleForStationChange);

    const panel = document.getElementById("stationChangePanel");
    if (panel) panel.innerHTML = "";

    updateVehicleList();
    loadVehiclesOnMap();

    alert("Cuartel actualizado");
}

// ========================================================
// 9. Cambiar estado radial (6‑X)
// ========================================================
async function setVehicleState(id, radial) {
    await supabaseClient
        .from("vehicles")
        .update({
            state: radial,
            last_update: new Date().toISOString()
        })
        .eq("id", id);

    updateVehicleList();
    loadVehiclesOnMap();
}

// ========================================================
// 10. Realtime (actualiza mapa/lista automáticamente)
// ========================================================
function subscribeRealtime() {
    supabaseClient
        .channel("vehicles-realtime")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "vehicles" },
            () => {
                updateVehicleList();
                loadVehiclesOnMap();
            }
        )
        .subscribe();
}
