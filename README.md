# Bluetooth File Transfer Web App

This is a simple **Web Bluetooth application** that allows two Bluetooth-enabled devices to:

- Connect using custom Bluetooth Low Energy (BLE) services
- Transfer files in chunks
- Play a connection sound when devices pair successfully

> ⚠️ This project uses experimental **Web Bluetooth API** which only works on supported browsers like **Chrome** and only under **HTTPS** or `localhost`.

---

## 🔧 Features

- 📂 Select and send files over Bluetooth (split into 512-byte chunks)
- 🔊 Play a sound when devices are successfully connected
- 📥 Receive data via BLE characteristic notifications
- 📱 Mobile-friendly and works on desktop as well

---

## 📦 UUIDs Used

Make sure your BLE peripheral uses the same UUIDs below:

```js
const SERVICE_UUID        = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID     = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID    = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

📘 This project is available in multiple languages:  
🇧🇷 [Português (PT-BR)](README-ptbr.md) | 🇺🇸 [English (EN)](README.md) | 🇪🇸 [Español (ES)](README-es.md) | 🇨🇳 [中文 (ZH)](README-zh.md) | 🇫🇷 [Français (FR)](README-fr.md)
