// ===================================================
// VEHICLES.JS - Sistema Completo Bloque 4
// ===================================================

// Mapa global
let map;
let vehicleMarkers = {}; // para actualizar íconos en vivo

// ===================================================
// 1) Inicializar mapa
// ===================================================
function initMap() {
    map = L.map("map").setView([-33.45, -70.65], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
    }).addTo(map);

    loadVehiclesOnMap();
    updateVehicleList();
    subscribeRealtime();
}

document.addEventListener("DOMContentLoaded", initMap);

// ===================================================
// 2) Obtener vehículos
// ===================================================
async function getVehicles() {
    const { data, error } = await supabaseClient
        .from("vehicles")
        .select("*")
        .eq("active", true);

    if (error) {
        console.error("Error cargando vehículos:", error);
        return [];
    }
    return data;
}

// ===================================================
// 3) Obtener cuarteles
// ===================================================
async function getStations() {
    const { data, error } = await supabaseClient
        .from("stations")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error cargando cuarteles:", error);
        return [];
    }
    return data;
}

// ===================================================
// 4) COLORES por estado operacional
// ===================================================
function getOperationalColor(status) {
    switch (status) {
        case "en_servicio": return "#28a745";
        case "en_llamado": return "#007bff";
        case "disponible": return "#ffc107";
        case "fuera_servicio": return "#dc3545";
        default: return "#6c757d";
    }
}

// ===================================================
// 5) COLORES por estado RADIAL
// ===================================================
function getRadialColor(radial) {
    switch (radial) {
        case "6-3": return "#dc3545";  // rojo
        case "6-8": return "#ffc107";  // amarillo
        case "6-9": return "#28a745";  // verde
        case "6-10": return "#007bff"; // azul
        default: return "#6c757d";
    }
}

// ===================================================
// 6) ÍCONOS para el mapa según estado operacional
// ===================================================
function getVehicleIconByStatus(status) {
    const color =
        status === "en_servicio" ? "green" :
        status === "en_llamado" ? "blue" :
        status === "disponible" ? "yellow" :
        status === "fuera_servicio" ? "red" : "gray";

    return L.icon({
        iconUrl: `../icons/${color}.png`,
        iconSize: [32, 32]
    });
}

// ===================================================
// 7) Dibujar vehículos en el mapa
// ===================================================
async function loadVehiclesOnMap() {
    const vehicles = await getVehicles();

    vehicles.forEach(v => {
        if (!vehicleMarkers[v.id]) {
            const marker = L.marker([v.lat, v.lon], {
                icon: getVehicleIconByStatus(v.service_status)
            }).addTo(map);

            marker.bindPopup(`
                <b>${v.callsign} - ${v.name}</b><br>
                Radial: ${v.state}<br>
                Estado: ${v.service_status}<br>
                Último cambio: ${new Date(v.last_update).toLocaleString()}
            `);

            vehicleMarkers[v.id] = marker;
        } else {
            const marker = vehicleMarkers[v.id];
            marker.setLatLng([v.lat, v.lon]);
            marker.setIcon(getVehicleIconByStatus(v.service_status));
        }
    });
}

// ===================================================
// 8) Listado lateral de vehículos
// ===================================================
async function updateVehicleList() {
    const list = document.getElementById("vehicleList");
    list.innerHTML = "";

    const vehicles = await getVehicles();

    vehicles.forEach(v => {
        const div = document.createElement("div");

        div.innerHTML = `
            <div style="
                background:#1c1c1c;
                border-left:8px solid ${getOperationalColor(v.service_status)};
                padding:10px;
                margin-bottom:10px;
                border:1px solid #444;
            ">
                <strong>${v.callsign} - ${v.name}</strong><br>
                Radial: <span style="color:${getRadialColor(v.state)}">${v.state}</span><br>
                Estado: <span style="color:${getOperationalColor(v.service_status)}">${v.service_status}</span><br>
                Última act: ${new Date(v.last_update).toLocaleString()}<br><br>

                <button onclick="openStationSelector('${v.id}')"
                        style="padding:6px 10px; background:#007bff; 
                        color:white; border:1px solid #0056b3;">
                    Cambiar Cuartel
                </button>
            </div>
        `;

        list.appendChild(div);
    });
}

// ===================================================
// 9) Selector de cuartel (opción 2)
// ===================================================
let selectedVehicleForStationChange = null;

async function openStationSelector(vehicleId) {
    selectedVehicleForStationChange = vehicleId;

    const stations = await getStations();

    let html = `
        <div style="
            background:#222; padding:15px; border:1px solid #444; 
            margin:10px 0; border-radius:6px;">
            <h3 style="margin-top:0;">Cambiar Cuartel</h3>
            <select id="stationSelector" 
                    style="padding:8px; width:100%; background:#333; color:white;">
    `;

    stations.forEach(s => {
        html += `<option value="${s.id}">${s.name}</option>`;
    });

    html += `
            </select><br><br>
            <button onclick="applyStationChange()" 
                    style="padding:8px 12px; background:#28a745; border:1px solid #444;">
                Guardar Cambio
            </button>
        </div>
    `;

    document.getElementById("stationChangePanel").innerHTML = html;
}

// ===================================================
// 10) Guardar cambio de cuartel
// ===================================================
async function applyStationChange() {
    const stationId = document.getElementById("stationSelector").value;

    const { error } = await supabaseClient
        .from("vehicles")
        .update({
            station_id: stationId,
            last_update: new Date().toISOString()
        })
        .eq("id", selectedVehicleForStationChange);

    if (error) {
        alert("Error al cambiar cuartel");
        return;
    }

    document.getElementById("stationChangePanel").innerHTML = "";

    updateVehicleList();
    loadVehiclesOnMap();

    alert("Cuartel actualizado correctamente");
}

// ===================================================
// 11) Lógica 6-X para estados RADIALES y OPERACIONALES
// ===================================================
function determineOperationalStatus(radial, operational) {
    if (operational === "fuera_servicio") return "fuera_servicio";

    switch (radial) {
        case "6-3": return "en_llamado";
        case "6-8": return "disponible";
        case "6-9": return "en_servicio";
        case "6-10": return "en_servicio";
        default: return operational;
    }
}

async function setVehicleState(vehicleId, radial) {
    const { data } = await supabaseClient
        .from("vehicles")
        .select("service_status")
        .eq("id", vehicleId)
        .single();

    const newOperational = determineOperationalStatus(radial, data.service_status);

    await supabaseClient
        .from("vehicles")
        .update({
            state: radial,
            service_status: newOperational,
            last_update: new Date().toISOString()
        })
        .eq("id", vehicleId);

    updateVehicleList();
    loadVehiclesOnMap();
}

// ===================================================
// 12) Realtime
// ===================================================
function subscribeRealtime() {
    supabaseClient
        .channel("vehicles-changes")
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
