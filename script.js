
let writeCharacteristic;

async function connectBluetooth() {
  const serviceUuid = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
  const writeUuid = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
  const notifyUuid = '4dd9a968-c64b-41cd-822c-b9e723582c4e';

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [serviceUuid] }]
  });

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(serviceUuid);
  writeCharacteristic = await service.getCharacteristic(writeUuid);
  const notifyCharacteristic = await service.getCharacteristic(notifyUuid);
  await notifyCharacteristic.startNotifications();

  notifyCharacteristic.addEventListener('characteristicvaluechanged', event => {
    const value = new TextDecoder().decode(event.target.value);
    log(`← Recebido: ${value}`);
  });

  document.getElementById('btn-send').disabled = false;
  document.getElementById('btn-send-text').disabled = false;
  document.getElementById('connected-sound').play();
  log('✅ Dispositivo conectado');
}

async function sendFile() {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];
  if (!file) return alert('Selecione um arquivo primeiro.');

  const chunkSize = 512;
  const reader = new FileReader();
  reader.onload = async () => {
    const data = new Uint8Array(reader.result);
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await writeCharacteristic.writeValue(chunk);
    }
    log(`→ Arquivo "${file.name}" enviado (${data.length} bytes)`);
  };
  reader.readAsArrayBuffer(file);
}

async function sendText() {
  const input = document.getElementById('text-input');
  const text = input.value.trim();
  if (!text) return alert('Digite algo antes de enviar.');

  const data = new TextEncoder().encode(text);
  await writeCharacteristic.writeValue(data);
  log(`→ Enviado texto: "${text}" (${data.byteLength} bytes)`);
}

function log(message) {
  const div = document.getElementById('log');
  const entry = document.createElement('div');
  entry.textContent = message;
  div.appendChild(entry);
}

document.getElementById('btn-connect').addEventListener('click', connectBluetooth);
document.getElementById('btn-send').addEventListener('click', sendFile);
document.getElementById('btn-send-text').addEventListener('click', sendText);
