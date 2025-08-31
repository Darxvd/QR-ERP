let html5QrCode;

document.getElementById("btnScan").addEventListener("click", () => {
  const readerElementId = "reader";

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode(readerElementId);
  }

  // iniciar cámara trasera (environment) si está disponible
  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      let cameraId = devices[0].id;
      // si hay más de una cámara, usar la trasera
      if (devices.length > 1) {
        const backCam = devices.find(d => d.label.toLowerCase().includes("back"));
        if (backCam) cameraId = backCam.id;
      }

      html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        decodedText => {
          document.getElementById("resultado").innerHTML = `<em>QR detectado: ${decodedText}</em>`;
          consultarAPI(decodedText);
          html5QrCode.stop(); // detener cámara tras leer
        },
        errorMessage => {
          // fallos de lectura se ignoran
        }
      );
    }
  }).catch(err => {
    document.getElementById("resultado").innerHTML = `<span class="error">❌ Error al acceder a la cámara: ${err}</span>`;
  });
});

async function consultarAPI(dni) {
  try {
    const response = await fetch(`https://qrescueladerefri-dhh3cda4hggacgam.brazilsouth-01.azurewebsites.net/checkin/${dni}`);
    if (!response.ok) throw new Error("Participante no encontrado");

    const data = await response.json();
    document.getElementById("resultado").innerHTML = `
      <strong>Nombre:</strong> ${data.nombre}<br>
      <strong>Mensaje:</strong> <span class="${data.asistio ? 'success' : 'error'}">${data.mensaje}</span><br>
      <strong>Asistencia:</strong> ${data.asistio ? "✅ Sí" : "❌ No"}
    `;
  } catch (error) {
    document.getElementById("resultado").innerHTML = `<span class="error">${error.message}</span>`;
  }
}
