const API_BASE = "http://qrescueladerefri-dhh3cda4hggacgam.brazilsouth-01.azurewebsites.net";

const diasSelect = document.getElementById("dias");
const eventosSelect = document.getElementById("eventos");
const btnScanner = document.getElementById("btnScanner");
const preview = document.getElementById("preview");

let diaSeleccionado = null;
let eventoSeleccionado = null;
let scanner = null;

// 🔹 Cargar días desde el backend
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

// 🔹 Cuando cambia el día, cargar eventos
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

// 🔹 Escaneo QR
btnScanner.addEventListener("click", function () {
  if (!eventoSeleccionado) {
    alert("Selecciona un evento primero");
    return;
  }

  preview.style.display = "block";

  if (!scanner) {
    scanner = new Instascan.Scanner({ video: preview });
    scanner.addListener("scan", async function (content) {
      const dni = content.trim();
      alert(`📷 QR detectado: ${dni}`);

      try {
        const res = await fetch(`${API_BASE}/checkin/${dni}/${eventoSeleccionado}`, {
          method: "POST"
        });

        const data = await res.json();
        if (res.ok) {
          alert(`✅ Asistencia registrada: ${data.mensaje}`);
        } else {
          alert(`❌ Error: ${data.detail || "No se pudo registrar asistencia"}`);
        }
      } catch (err) {
        alert("Error al registrar asistencia: " + err.message);
      }
    });
  }

  // Iniciar cámara
  Instascan.Camera.getCameras().then(cameras => {
    if (cameras.length > 0) {
      scanner.start(cameras[0]); // Usa la primera cámara
    } else {
      alert("No se encontró cámara en este dispositivo");
    }
  }).catch(err => {
    alert("Error accediendo a la cámara: " + err);
  });
});

// Iniciar carga
cargarDias();
