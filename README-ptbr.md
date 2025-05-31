# Bluetooth File Transfer Web App <img src="./public/favicon-32x32.png" align="right" width="100">

Este é um aplicativo simples de **Bluetooth via Web** que permite que dois dispositivos com Bluetooth:

- Conectem-se usando serviços personalizados Bluetooth Low Energy (BLE)
- Transfiram arquivos em partes (chunks)
- Reproduzam um som ao emparelhar com sucesso

> ⚠️ Este projeto usa a **API Web Bluetooth**, que ainda é experimental e só funciona em navegadores compatíveis como o **Chrome**, sob **HTTPS** ou `localhost`.

---

## 🔧 Funcionalidades

- 📂 Selecionar e enviar arquivos via Bluetooth (dividido em partes de 512 bytes)
- 🔊 Reproduzir um som quando os dispositivos conectarem com sucesso
- 📥 Receber dados por notificações de característica BLE
- 📱 Compatível com dispositivos móveis e desktops

---

## 📦 UUIDs Utilizados

Certifique-se de que seu dispositivo BLE usa os mesmos UUIDs abaixo:

```js
const SERVICE_UUID        = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID     = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID    = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
