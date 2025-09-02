// ✅ Usar siempre HTTPS
const API_BASE = "https://qrescueladerefri-dhh3cda4hggacgam.brazilsouth-01.azurewebsites.net";

const diasSelect = document.getElementById("dias");
const eventosSelect = document.getElementById("eventos");
const btnScanner = document.getElementById("btnScanner");
const btnBorrar = document.getElementById("btnBorrar");
const preview = document.getElementById("preview");
const respuestaDiv = document.getElementById("respuesta");

let diaSeleccionado = null;
let eventoSeleccionado = null;
let html5QrCode = null;

// 🔹 Mostrar cualquier JSON de forma ordenada en el div
function mostrarRespuestaJSON(data) {
  if (!data || typeof data !== "object") {
    respuestaDiv.innerHTML = data;
    respuestaDiv.style.display = "block";
    respuestaDiv.style.background = "#eef6ff";
    respuestaDiv.style.borderLeft = "4px solid #007bff";
    return;
  }

  let html = "<ul style='padding-left:18px; margin:0'>";
  for (const [key, value] of Object.entries(data)) {
    html += `<li><strong>${key}:</strong> ${value}</li>`;
  }
  html += "</ul>";

  respuestaDiv.innerHTML = html;
  respuestaDiv.style.display = "block";

  // Determinar color según estado
  if (data.estado === "ok") {
    respuestaDiv.style.background = "#e6ffed";
    respuestaDiv.style.borderLeft = "4px solid #28a745";
  } else if (data.estado === "error") {
    respuestaDiv.style.background = "#ffe6e6";
    respuestaDiv.style.borderLeft = "4px solid #dc3545";
  } else {
    respuestaDiv.style.background = "#eef6ff";
    respuestaDiv.style.borderLeft = "4px solid #007bff";
  }
}

// 🔹 Cargar días
async function cargarDias() {
  try {
    const res = await fetch(`${API_BASE}/dias`);
    if (!res.ok) throw new Error("Error cargando días");
    const dias = await res.json();
    dias.forEach(d => {
      const option = document.createElement("option");
      option.value = d.idDia;
      option.textContent = `${d.nombreDia} (${d.fecha})`;
      diasSelect.appendChild(option);
    });
  } catch (err) {
    mostrarRespuestaJSON({ estado: "error", mensaje: `Error al cargar días: ${err.message}` });
  }
}

// 🔹 Cuando cambia día
diasSelect.addEventListener("change", async () => {
  diaSeleccionado = diasSelect.value;
  eventosSelect.innerHTML = `<option value="">-- Selecciona un evento --</option>`;
  eventosSelect.disabled = true;
  btnScanner.disabled = true;

  if (!diaSeleccionado) return;

  try {
    const res = await fetch(`${API_BASE}/eventos/${diaSeleccionado}`);
    if (!res.ok) throw new Error("Error cargando eventos");
    const eventos = await res.json();
    eventos.forEach(e => {
      const option = document.createElement("option");
      option.value = e.idEvento;
      option.textContent = e.nombreEvento;
      eventosSelect.appendChild(option);
    });
    eventosSelect.disabled = false;
  } catch (err) {
    mostrarRespuestaJSON({ estado: "error", mensaje: `Error al cargar eventos: ${err.message}` });
  }
});

// 🔹 Cuando selecciona evento
eventosSelect.addEventListener("change", () => {
  eventoSeleccionado = eventosSelect.value;
  btnScanner.disabled = !eventoSeleccionado;
});

// 🔹 Escanear QR
btnScanner.addEventListener("click", () => {
  if (!eventoSeleccionado) {
    mostrarRespuestaJSON({ estado: "error", mensaje: "Selecciona un evento primero" });
    return;
  }

  preview.style.display = "block";
  respuestaDiv.style.display = "none";

  if (!html5QrCode) html5QrCode = new Html5Qrcode("preview");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    async content => {
      try {
        const res = await fetch(`${API_BASE}/checkin/${content}/${eventoSeleccionado}`, { method: "POST" });
        const data = await res.json();
        mostrarRespuestaJSON(data);
      } catch (err) {
        mostrarRespuestaJSON({ estado: "error", mensaje: `Error en check-in: ${err.message}` });
      } finally {
        // ✅ Solo detener si existe
        if (html5QrCode) {
          try {
            await html5QrCode.stop();
          } catch (_) {}
          preview.style.display = "none";
          html5QrCode = null;
        }
      }
    },
    () => {} // ignorar errores de escaneo
  );
});

// 🔹 Botón Borrar
btnBorrar.addEventListener("click", () => {
  diasSelect.value = "";
  eventosSelect.innerHTML = `<option value="">-- Selecciona un evento --</option>`;
  eventosSelect.disabled = true;
  btnScanner.disabled = true;
  preview.style.display = "none";
  respuestaDiv.style.display = "none";

  if (html5QrCode) {
    html5QrCode.stop().catch(() => {});
    html5QrCode = null;
  }
});

// Inicializar
cargarDias();
