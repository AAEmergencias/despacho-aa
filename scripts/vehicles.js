// ===============================
// MAPA UNICO - CARTO VOYAGER
// ===============================

let vehicleMarkers = {};

function initVehicleMap() {
    const map = L.map("map", {
        zoomControl: true,
        preferCanvas: true
    }).setView([-33.45, -70.66], 12);

    // Mapa estilo Voyager (como la imagen que enviaste)
    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
            maxZoom: 19,
            attribution: "&copy; CARTO – Voyager"
        }
    ).addTo(map);

    return map;
}

let vehicleMap = initVehicleMap();


// ===============================
// BLOQUE 4 — Cargar vehículos desde Supabase
// ===============================

let vehicles = [];

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


// ===============================
// BLOQUE 5 — Mostrar vehículos en el mapa
// ===============================

function getVehicleIcon(state) {
    let color = "white";

    switch (state) {
        case "6-3": color = "blue"; break;
        case "6-8": color = "green"; break;
        case "6-9": color = "yellow"; break;
        case "6-10": color = "gray"; break;
        default: color = "red"; break;
    }

    return L.divIcon({
        className: "vehicle-icon",
        html: `
            <div style="
                width:20px;
                height:20px;
                border-radius:50%;
                background:${color};
                border:2px solid white;
            "></div>
        `
    });
}

function renderVehiclesOnMap() {
    // eliminar marcadores anteriores
    for (const id in vehicleMarkers)
        vehicleMap.removeLayer(vehicleMarkers[id]);

    vehicleMarkers = {};

    // agregar nuevos
    for (const v of vehicles) {
        if (!v.lat || !v.lng) continue;

        const marker = L.marker([v.lat, v.lng], {
            icon: getVehicleIcon(v.status)
        }).addTo(vehicleMap);

        marker.bindPopup(`
            <b>${v.name}</b><br>
            Estado: ${v.status}<br>
            Conductor: ${v.conductor || "N/A"}<br>
            Tipo: ${v.type || "N/A"}
        `);

        vehicleMarkers[v.id] = marker;
    }
}


// ===============================
// BLOQUE 6 — Lista lateral
// ===============================

function renderVehicleList() {
    const cont = document.getElementById("vehicleList");
    if (!cont) return;

    cont.innerHTML = "";

    for (const v of vehicles) {
        const item = document.createElement("div");
        item.style.padding = "6px";
        item.style.marginBottom = "4px";
        item.style.borderBottom = "1px solid #444";
        item.innerHTML = `
            <b>${v.name}</b><br>
            Estado: ${v.status}<br>
            <small>Conductor: ${v.conductor || "N/A"}</small>
        `;
        cont.appendChild(item);
    }
}


// ===============================
// INICIALIZAR
// ===============================

loadVehicles();
