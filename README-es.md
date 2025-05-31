# Aplicación Web para Transferencia de Archivos Bluetooth <img src="./public/favicon-32x32.png" align="right" width="100">

Esta es una aplicación sencilla de **Bluetooth Web** que permite que dos dispositivos con Bluetooth:

- Conectarse usando servicios personalizados Bluetooth Low Energy (BLE)
- Transferir archivos en partes (chunks)
- Reproducir un sonido cuando los dispositivos se emparejan exitosamente

> ⚠️ Este proyecto usa la **API Web Bluetooth**, que aún es experimental y solo funciona en navegadores compatibles como **Chrome**, bajo **HTTPS** o `localhost`.

---

## 🔧 Funcionalidades

- 📂 Seleccionar y enviar archivos por Bluetooth (dividido en partes de 512 bytes)
- 🔊 Reproducir un sonido cuando los dispositivos se conectan con éxito
- 📥 Recibir datos mediante notificaciones de característica BLE
- 📱 Compatible con dispositivos móviles y de escritorio

---

## 📦 UUIDs Utilizados

Asegúrese de que su dispositivo BLE use los mismos UUIDs a continuación:

```js
const SERVICE_UUID        = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID     = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID    = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
