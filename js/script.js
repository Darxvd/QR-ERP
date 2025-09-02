// ✅ Usar siempre HTTPS
const API_BASE = "https://qrescueladerefri-dhh3cda4hggacgam.brazilsouth-01.azurewebsites.net";

const diasSelect = document.getElementById("dias");
const eventosSelect = document.getElementById("eventos");
const btnScanner = document.getElementById("btnScanner");
const btnBorrar = document.getElementById("btnBorrar");
const preview = document.getElementById("preview");

let diaSeleccionado = null;
let eventoSeleccionado = null;
let html5QrCode = null;

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
    alert("Error al cargar días: " + err.message);
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
    alert("Error al cargar eventos: " + err.message);
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
    alert("Selecciona un evento primero");
    return;
  }

  preview.style.display = "block";
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("preview");
  }

  html5QrCode.start(
    { facingMode: "environment" }, // Cámara trasera en móvil
    { fps: 10, qrbox: 250 },
    async content => {
      try {
        const url = `${API_BASE}/checkin/${content}/${eventoSeleccionado}`;
        const res = await fetch(url, { method: "POST" });
        const data = await res.json();
        alert(JSON.stringify(data));
        await html5QrCode.stop();
        preview.style.display = "none";
      } catch (err) {
        alert("Error en check-in: " + err.message);
      }
    },
    errorMessage => {
      // console.log("Error escaneo: ", errorMessage);
    }
  );
});

// 🔹 Botón Borrar Selección
btnBorrar.addEventListener("click", () => {
  diasSelect.value = "";
  eventosSelect.innerHTML = `<option value="">-- Selecciona un evento --</option>`;
  eventosSelect.disabled = true;
  btnScanner.disabled = true;
  preview.style.display = "none";

  if (html5QrCode) {
    html5QrCode.stop().catch(() => {});
    html5QrCode = null;
  }
});

// Inicializar
cargarDias();
