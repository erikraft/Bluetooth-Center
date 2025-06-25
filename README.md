
# Bluetooth File Transfer Web App <img src="brand-assets\Bluetooth_Icon2.png" align="right" width="175">
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/erikraft/Bluetooth-Center?utm_source=oss&utm_medium=github&utm_campaign=erikraft%2FBluetooth-Center&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
<br>
This is a modern **Web Bluetooth application** that allows you to:

- Connect two Bluetooth-enabled devices using custom Bluetooth Low Energy (BLE) services
- Transfer files (split into 512-byte chunks) between devices
- View a **Transfer History** (history is temporary and will be deleted after 20 days)
- See a **Device History** with all previously connected devices
- Play a sound when devices pair or disconnect
- Use the app offline (PWA support)
- Play music directly in the browser (for headphones)
- Monitor health data (for smartwatches)
- Play minigames (for controllers)
- Enjoy a mobile-friendly and desktop-compatible interface


> <img src="brand-assets\Use Bluetooth Web System.svg" align="right" width="175"> ⚠️ This project uses the experimental **Web Bluetooth API**, which only works on supported browsers like **Chrome** and only under **HTTPS** or `localhost`.

---

## 🔧 Features

- 📂 Select and send files over Bluetooth (split into 512-byte chunks)
- 🕒 Transfer History tab (history auto-deletes after 20 days)
- 📋 Device History tab (see all previously connected devices)
- 🔊 Play a sound when devices connect or disconnect
- 🎵 Music player for headphones
- 🩺 Health monitoring for smartwatches
- 🎮 Minigames for controllers
- 📥 Receive data via BLE characteristic notifications
- 📱 Mobile-friendly and works on desktop
- ⚡ Works offline (PWA)

---

## 📦 UUIDs Used

<details>
<summary>👀 View UUIDs</summary>

### Main Service and Characteristics
```js
// File Transfer Service
const SERVICE_UUID     = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID  = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

### Audio Devices (Fones/Caixas de Som)
```js
// Audio Sink (A2DP)
const AUDIO_SINK_UUID = '0000110b-0000-1000-8000-00805f9b34fb';

// Audio Source (A2DP Source)
const AUDIO_SOURCE_UUID = '0000110a-0000-1000-8000-00805f9b34fb';

// Headset Profile (HSP)
const HEADSET_HS_UUID = '00001108-0000-1000-8000-00805f9b34fb'; // Headset
const HEADSET_AG_UUID = '00001112-0000-1000-8000-00805f9b34fb'; // Audio Gateway

// Hands-Free Profile (HFP)
const HANDSFREE_HS_UUID = '0000111e-0000-1000-8000-00805f9b34fb'; // Handsfree
const HANDSFREE_AG_UUID = '0000111f-0000-1000-8000-00805f9b34fb'; // Audio Gateway

// AVRCP (Audio/Video Remote Control)
const AVRCP_UUID = '0000110e-0000-1000-8000-00805f9b34fb';
```

### Game Controllers (Controles de Jogo)
```js
// Human Interface Device (HID)
const HID_SERVICE_UUID = '00001812-0000-1000-8000-00805f9b34fb';

// HID Information
const HID_INFO_UUID = '00002a4a-0000-1000-8000-00805f9b34fb';

// HID Control Point
const HID_CONTROL_POINT_UUID = '00002a4c-0000-1000-8000-00805f9b34fb';

// HID Report Map
const HID_REPORT_MAP_UUID = '00002a4b-0000-1000-8000-00805f9b34fb';

// HID Report
const HID_REPORT_UUID = '00002a4d-0000-1000-8000-00805f9b34fb';

// HID Protocol Mode
const HID_PROTOCOL_MODE_UUID = '00002a4e-0000-1000-8000-00805f9b34fb';
```

### Standard BLE Services
```js
// Audio
const AUDIO_SINK_UUID = '0000110b-0000-1000-8000-00805f9b34fb';

// Battery Service
const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';

// Device Information
const DEVICE_INFO_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';

// Heart Rate
const HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_MEASUREMENT_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

// Human Interface Device
const HID_SERVICE_UUID = '00001812-0000-1000-8000-00805f9b34fb';

// Fitness Machine
const FITNESS_MACHINE_SERVICE_UUID = '00001816-0000-1000-8000-00805f9b34fb';
const STEP_COUNT_UUID = '00002a5b-0000-1000-8000-00805f9b34fb';
```

### Smart Device Services (Xiaomi, Huawei, etc.)
```js
// Xiaomi/Realme/Oppo
const XIAOMI_SERVICE_UUID_1 = '0000fee0-0000-1000-8000-00805f9b34fb';
const XIAOMI_SERVICE_UUID_2 = '0000fee1-0000-1000-8000-00805f9b34fb';

// Huawei
const HUAWEI_SERVICE_UUID = '0000fee9-0000-1000-8000-00805f9b34fb';

// Common Characteristics
const COMMON_CHAR_1 = '0000ff07-0000-1000-8000-00805f9b34fb';
const COMMON_CHAR_2 = '0000ff06-0000-1000-8000-00805f9b34fb';
const COMMON_CHAR_3 = '0000ff04-0000-1000-8000-00805f9b34fb';

// Mi Band Specific
const MI_BAND_ACTIVITY_DATA_UUID = '00000007-0000-3512-2118-0009af100700';
const MI_BAND_BATTERY_UUID = '00000006-0000-3512-2118-0009af100700';
```
</details>

## 🙏 Thank you for everyone's support

[![Star History Chart](https://api.star-history.com/svg?repos=erikraft/Bluetooth-Center&type=Date)](https://star-history.com/#erikraft/Bluetooth-Center&Date)

---

## 💰 Support
<a href="https://ko-fi.com/erikraft" target="_blank">
<img src="./brand-assets/support_me_on_kofi_badge_blue.png" width="170" alt="Donate"/>
</a>
<br />
<br />

Bluetooth Center is libre, and always will be. \
If you find it useful and want to support free and open-source software, please consider donating using the button above. \
I footed the bill for the domain and the server, and you can help create and maintain great software by supporting me. \
Thank you very much for your contribution!

---

## 🌐 Available Languages

<img src="brand-assets\Translate.svg" align="left" width="120">

🇧🇷 [Português (PT-BR)](README-ptbr.md) | 🇺🇸 [English (EN)](README.md) | 🇪🇸 [Español (ES)](README-es.md) | 🇨🇳 [中文 (ZH)](README-zh.md) | 🇫🇷 [Français (FR)](README-fr.md)

---