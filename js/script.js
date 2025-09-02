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

// 🔹 Mostrar mensajes bonitos en el cuadro de respuesta
function mostrarRespuesta(mensaje, tipo = "info") {
  respuestaDiv.innerHTML = mensaje; // Permitir formateo
  respuestaDiv.style.display = "block";

  if (tipo === "ok") {
    respuestaDiv.style.background = "#e6ffed";
    respuestaDiv.style.borderLeft = "4px solid #28a745";
  } else if (tipo === "error") {
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
    mostrarRespuesta("❌ Error al cargar días: " + err.message, "error");
  }
}

// 🔹 Cuando cambia día
diasSelect.addEventListener("change", async function () {
  diaSeleccionado = this.value;
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
    mostrarRespuesta("❌ Error al cargar eventos: " + err.message, "error");
  }
});

// 🔹 Cuando selecciona evento
eventosSelect.addEventListener("change", function () {
  eventoSeleccionado = this.value;
  btnScanner.disabled = !eventoSeleccionado;
});

// 🔹 Botón Escanear QR
btnScanner.addEventListener("click", function () {
  if (!eventoSeleccionado) {
    mostrarRespuesta("⚠️ Selecciona un evento primero", "error");
    return;
  }

  preview.style.display = "block";
  respuestaDiv.style.display = "none";

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("preview");
  }

  html5QrCode.start(
    { facingMode: "environment" }, // Cámara trasera
    { fps: 10, qrbox: { width: 250, height: 250 } },
    async content => {
      try {
        const url = `${API_BASE}/checkin/${content}/${eventoSeleccionado}`;
        const res = await fetch(url, { method: "POST" });
        const data = await res.json();

        // ✅ Mostrar JSON bonito en el cuadro
        mostrarRespuesta(
          `<strong>Respuesta del servidor:</strong><pre>${JSON.stringify(data, null, 2)}</pre>`,
          "ok"
        );

        await html5QrCode.stop();
        preview.style.display = "none";
        html5QrCode = null;
      } catch (err) {
        mostrarRespuesta("❌ Error en check-in: " + err.message, "error");
      }
    },
    () => {} // ignorar errores de escaneo
  );
});

// 🔹 Botón Borrar Selección
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
