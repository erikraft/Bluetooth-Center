# Aplicación Web para Transferencia de Archivos Bluetooth <img src="brand-assets\Bluetooth_Icon2.png" align="right" width="175">
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/erikraft/Bluetooth-Center?utm_source=oss&utm_medium=github&utm_campaign=erikraft%2FBluetooth-Center&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
<br>
Esta es una aplicación moderna de **Bluetooth Web** que permite:

- Conectar dos dispositivos Bluetooth usando servicios BLE personalizados
- Transferir archivos (divididos en partes de 512 bytes) entre dispositivos
- Ver el **Historial de Transferencias** (el historial es temporal y se elimina después de 20 días)
- Consultar el **Historial de Dispositivos** con todos los dispositivos conectados previamente
- Reproducir un sonido al emparejar o desconectar
- Usar la app sin conexión (PWA)
- Reproducir música directamente en el navegador (para auriculares)
- Monitorear datos de salud (para relojes)
- Jugar minijuegos (para controles)
- Interfaz compatible con móvil y escritorio

> <img src="brand-assets\Use Bluetooth Web System.svg" align="right" width="175"> ⚠️ Este proyecto utiliza la **API Web Bluetooth** experimental, que solo funciona en navegadores compatibles como **Chrome** y únicamente bajo **HTTPS** o `localhost`.

---

## 🔧 Funcionalidades

- 📂 Seleccionar y enviar archivos por Bluetooth (en partes de 512 bytes)
- 🕒 Pestaña de Historial de Transferencias (el historial se elimina automáticamente después de 20 días)
- 📋 Pestaña de Historial de Dispositivos (ver todos los dispositivos conectados)
- 🔊 Sonido al conectar o desconectar
- 🎵 Reproductor de música para auriculares
- 🩺 Monitoreo de salud para relojes
- 🎮 Minijuegos para controles
- 📥 Recibir datos mediante notificaciones BLE
- 📱 Compatible con dispositivos móviles y de escritorio
- ⚡ Funciona sin conexión (PWA)

---

## 📦 UUIDs Utilizados

<details>
<summary>👀 Ver UUIDs</summary>

### Servicio Principal
```js
// Servicio de Transferencia de Archivos
const SERVICE_UUID     = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID  = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

### Dispositivos de Audio (Auriculares/Altavoces)
```js
// Audio Sink (A2DP)
const AUDIO_SINK_UUID = '0000110b-0000-1000-8000-00805f9b34fb';

// Audio Source (A2DP Source)
const AUDIO_SOURCE_UUID = '0000110a-0000-1000-8000-00805f9b34fb';

// Perfil de Auriculares (HSP)
const HEADSET_HS_UUID = '00001108-0000-1000-8000-00805f9b34fb'; // Auriculares
const HEADSET_AG_UUID = '00001112-0000-1000-8000-00805f9b34fb'; // Puerta de enlace de audio

// Perfil Manos Libres (HFP)
const HANDSFREE_HS_UUID = '0000111e-0000-1000-8000-00805f9b34fb'; // Manos libres
const HANDSFREE_AG_UUID = '0000111f-0000-1000-8000-00805f9b34fb'; // Puerta de enlace de audio

// AVRCP (Control Remoto de Audio/Video)
const AVRCP_UUID = '0000110e-0000-1000-8000-00805f9b34fb';
```

### Mandos de Juego
```js
// Dispositivo de Interfaz Humana (HID)
const HID_SERVICE_UUID = '00001812-0000-1000-8000-00805f9b34fb';

// Información HID
const HID_INFO_UUID = '00002a4a-0000-1000-8000-00805f9b34fb';

// Punto de Control HID
const HID_CONTROL_POINT_UUID = '00002a4c-0000-1000-8000-00805f9b34fb';

// Mapa de Informe HID
const HID_REPORT_MAP_UUID = '00002a4b-0000-1000-8000-00805f9b34fb';

// Informe HID
const HID_REPORT_UUID = '00002a4d-0000-1000-8000-00805f9b34fb';

// Modo de Protocolo HID
const HID_PROTOCOL_MODE_UUID = '00002a4e-0000-1000-8000-00805f9b34fb';
```

### Servicios BLE Estándar
```js
// Audio
const AUDIO_SINK_UUID = '0000110b-0000-1000-8000-00805f9b34fb';

// Servicio de Batería
const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';

// Información del Dispositivo
const DEVICE_INFO_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';

// Frecuencia Cardíaca
const HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_MEASUREMENT_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

// Dispositivo de Interfaz Humana
const HID_SERVICE_UUID = '00001812-0000-1000-8000-00805f9b34fb';

// Máquina de Ejercicios
const FITNESS_MACHINE_SERVICE_UUID = '00001816-0000-1000-8000-00805f9b34fb';
const STEP_COUNT_UUID = '00002a5b-0000-1000-8000-00805f9b34fb';
```

### Servicios de Dispositivos Inteligentes (Xiaomi, Huawei, etc.)
```js
// Xiaomi/Realme/Oppo
const XIAOMI_SERVICE_UUID_1 = '0000fee0-0000-1000-8000-00805f9b34fb';
const XIAOMI_SERVICE_UUID_2 = '0000fee1-0000-1000-8000-00805f9b34fb';

// Huawei
const HUAWEI_SERVICE_UUID = '0000fee9-0000-1000-8000-00805f9b34fb';

// Características Comunes
const COMMON_CHAR_1 = '0000ff07-0000-1000-8000-00805f9b34fb';
const COMMON_CHAR_2 = '0000ff06-0000-1000-8000-00805f9b34fb';
const COMMON_CHAR_3 = '0000ff04-0000-1000-8000-00805f9b34fb';

// Específico de Mi Band
const MI_BAND_ACTIVITY_DATA_UUID = '00000007-0000-3512-2118-0009af100700';
const MI_BAND_BATTERY_UUID = '00000006-0000-3512-2118-0009af100700';
```
</details>

## 🙏 ¡Gracias por el apoyo de todos!

[![Star History Chart](https://api.star-history.com/svg?repos=erikraft/Bluetooth-Center&type=Date)](https://star-history.com/#erikraft/Bluetooth-Center&Date)

---

## 💰 Soporte
<a href="https://ko-fi.com/erikraft" target="_blank">
<img src="./brand-assets/support_me_on_kofi_badge_blue.png" width="170" alt="Donate"/>
</a>
<br />
<br />

Bluetooth Center es libre, y siempre lo será. \
Si te resulta útil y quieres apoyar el software libre y de código abierto, considera donar usando el botón de arriba. \
Yo pagué el dominio y el servidor, y puedes ayudar a crear y mantener un gran software apoyándome. \
¡Muchas gracias por tu contribución!

---

## 🌐 Idiomas Disponibles

<img src="brand-assets\Translate.svg" align="left" width="120">

🇧🇷 [Português (PT-BR)](README-ptbr.md) | 🇺🇸 [English (EN)](README.md) | 🇪🇸 [Español (ES)](README-es.md) | 🇨🇳 [中文 (ZH)](README-zh.md) | 🇫🇷 [Français (FR)](README-fr.md)

---