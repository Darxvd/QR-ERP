let html5QrCode;

document.getElementById("btnCam").addEventListener("click", async () => {
  const readerElem = document.getElementById("reader");
  readerElem.style.display = "block";

  html5QrCode = new Html5Qrcode("reader");

  try {
    await html5QrCode.start(
      { facingMode: "environment" }, // cámara trasera
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        document.getElementById("resultado").innerHTML =
          `<em>QR detectado: ${decodedText}</em>`;
        consultarAPI(decodedText);
        html5QrCode.stop(); // detener tras primer QR
      }
    );
  } catch (err) {
    document.getElementById("resultado").innerHTML =
      `<span class="error">No se pudo abrir la cámara: ${err}</span>`;
  }
});

async function consultarAPI(dni) {
  try {
    const response = await fetch(
      `https://qrescueladerefri-dhh3cda4hggacgam.brazilsouth-01.azurewebsites.net/checkin/${dni}`
    );
    if (!response.ok) throw new Error("Participante no encontrado");

    const data = await response.json();
    document.getElementById("resultado").innerHTML = `
      <strong>Nombre:</strong> ${data.nombre}<br>
      <strong>Mensaje:</strong> <span class="${data.asistio ? 'success' : 'error'}">${data.mensaje}</span><br>
      <strong>Asistencia:</strong> ${data.asistio ? "✅ Sí" : "❌ No"}
    `;
  } catch (error) {
    document.getElementById("resultado").innerHTML =
      `<span class="error">${error.message}</span>`;
  }
}
