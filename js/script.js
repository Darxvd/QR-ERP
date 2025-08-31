function onScanSuccess(decodedText, decodedResult) {
  document.getElementById("resultado").innerHTML = `<em>QR detectado: ${decodedText}</em>`;
  consultarAPI(decodedText);
  html5QrcodeScanner.clear();
}

function onScanFailure(error) {
  // Ignorar errores de escaneo
}

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

try {
  const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
  html5QrcodeScanner.render(onScanSuccess, onScanFailure);
} catch (err) {
  document.getElementById("reader").innerHTML = `
    <p style="color:red; font-weight:bold;">
      ❌ No se detectó cámara disponible en este dispositivo.
    </p>
  `;
}
