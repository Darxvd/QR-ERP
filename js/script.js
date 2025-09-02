let html5QrCode;
let idDiaSeleccionado = null;
let idEventoSeleccionado = null;

// Seleccionar Día
document.getElementById("btnSeleccionarDia").addEventListener("click", async () => {
  try {
    const res = await fetch("https://qrescueladerefri-dhh3cda4hggacgam.brazilsouth-01.azurewebsites.net/dias");
    const dias = await res.json();

    const opciones = dias.map((d, i) => `${i + 1}. ${d.nombreDia} (${d.fecha})`).join("\n");
    const elegido = prompt("Seleccione un día:\n\n" + opciones);

    const index = parseInt(elegido) - 1;
    if (!isNaN(index) && dias[index]) {
      idDiaSeleccionado = dias[index].idDia;
      document.getElementById("diaSeleccionado").textContent = "📅 Día: " + dias[index].nombreDia;
      document.getElementById("btnSeleccionarEvento").disabled = false;
    }
  } catch (err) {
    alert("Error cargando días: " + err);
  }
});

// Seleccionar Evento
document.getElementById("btnSeleccionarEvento").addEventListener("click", async () => {
  if (!idDiaSeleccionado) return alert("Seleccione un día primero");

  try {
    const res = await fetch(`https://qrescueladerefri-dhh3cda4hggacgam.brazilsouth-01.azurewebsites.net/eventos/${idDiaSeleccionado}`);
    const eventos = await res.json();

    const opciones = eventos.map((e, i) => `${i + 1}. ${e.nombreEvento}`).join("\n");
    const elegido = prompt("Seleccione un evento:\n\n" + opciones);

    const index = parseInt(elegido) - 1;
    if (!isNaN(index) && eventos[index]) {
      idEventoSeleccionado = eventos[index].idEvento;
      document.getElementById("eventoSeleccionado").textContent = "🎤 Evento: " + eventos[index].nombreEvento;
      document.getElementById("btnScanner").disabled = false;
    }
  } catch (err) {
    alert("Error cargando eventos: " + err);
  }
});

// Escanear QR
document.getElementById("btnScanner").addEventListener("click", async () => {
  const readerElem = document.getElementById("reader");
  readerElem.style.display = "block";

  html5QrCode = new Html5Qrcode("reader");

  try {
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        document.getElementById("resultado").innerHTML = `<em>QR detectado: ${decodedText}</em>`;
        enviarCheckin(decodedText);
        html5QrCode.stop();
      }
    );
  } catch (err) {
    document.getElementById("resultado").innerHTML =
      `<span class="error">No se pudo abrir la cámara: ${err}</span>`;
  }
});

// Enviar Check-in
async function enviarCheckin(dni) {
  if (!idEventoSeleccionado) {
    alert("Seleccione un evento primero");
    return;
  }

  try {
    const res = await fetch(
      `https://qrescueladerefri-dhh3cda4hggacgam.brazilsouth-01.azurewebsites.net/checkin/${dni}/${idEventoSeleccionado}`,
      { method: "POST" }
    );

    if (!res.ok) throw new Error("Error: " + res.status);

    const data = await res.json();

    document.getElementById("respuesta").innerHTML = `
      <strong>Participante:</strong> ${data.participante}<br>
      <strong>Evento:</strong> ${data.evento}<br>
      <span class="${data.mensaje.includes("ok") ? 'success' : 'error'}">${data.mensaje}</span>
    `;
  } catch (err) {
    document.getElementById("respuesta").innerHTML = `<span class="error">${err.message}</span>`;
  }
}

// Borrar selección
document.getElementById("btnBorrar").addEventListener("click", () => {
  idDiaSeleccionado = null;
  idEventoSeleccionado = null;

  document.getElementById("diaSeleccionado").textContent = "";
  document.getElementById("eventoSeleccionado").textContent = "";
  document.getElementById("btnSeleccionarEvento").disabled = true;
  document.getElementById("btnScanner").disabled = true;

  document.getElementById("resultado").innerHTML = "";
  document.getElementById("respuesta").innerHTML = "";

  alert("Selección borrada");
});
