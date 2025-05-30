// UUIDs gerados
const SERVICE_UUID        = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID     = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID    = '4dd9a968-c64b-41cd-822c-b9e723582c4e';

const CHUNK_SIZE = 512;

let bluetoothDevice;
let writeCharacteristic;
let notifyCharacteristic;

const logEl = document.getElementById('log');
function log(msg) {
  logEl.textContent += msg + '\n';
  logEl.scrollTop = logEl.scrollHeight;
}

async function connectBluetooth() {
  try {
    log('Solicitando dispositivo BLE...');
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: [ SERVICE_UUID ] }]
    });

    log('Conectando ao GATT Server...');
    const server = await bluetoothDevice.gatt.connect();

    log('Obtendo serviço...');
    const service = await server.getPrimaryService(SERVICE_UUID);

    log('Obtendo características...');
    writeCharacteristic  = await service.getCharacteristic(WRITE_CHAR_UUID);
    notifyCharacteristic = await service.getCharacteristic(NOTIFY_CHAR_UUID);

    await notifyCharacteristic.startNotifications();
    notifyCharacteristic.addEventListener('characteristicvaluechanged', onReceiveData);

    log('Conectado! Tocar som de conexão.');
    playConnectedSound();

    document.getElementById('btn-send').disabled = false;

  } catch (error) {
    log('Erro ao conectar: ' + error);
  }
}

function playConnectedSound() {
  const audio = document.getElementById('connected-sound');
  audio.currentTime = 0;
  audio.play().catch(err => {
    log('Não foi possível tocar o som automaticamente: ' + err);
  });
}

async function sendFile() {
  const input = document.getElementById('file-input');
  if (!input.files.length) return alert('Selecione um arquivo.');

  const file = input.files[0];
  const buffer = await file.arrayBuffer();
  log(`Enviando ${file.name} (${buffer.byteLength} bytes) em chunks de ${CHUNK_SIZE}…`);

  for (let offset = 0; offset < buffer.byteLength; offset += CHUNK_SIZE) {
    const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
    await writeCharacteristic.writeValue(chunk);
    log(`→ Enviado bytes ${offset} a ${offset + chunk.byteLength}`);
  }

  log('Transferência concluída!');
}

function onReceiveData(event) {
  const data = event.target.value;
  log(`← Recebido ${data.byteLength} bytes`);
}

document.getElementById('btn-connect').addEventListener('click', connectBluetooth);
document.getElementById('btn-send').addEventListener('click', sendFile);
