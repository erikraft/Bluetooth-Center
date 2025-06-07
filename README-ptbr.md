# Bluetooth File Transfer Web App <img src="./public/favicon-32x32.png" align="right" width="100">
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/erikraft/Bluetooth-Center?utm_source=oss&utm_medium=github&utm_campaign=erikraft%2FBluetooth-Center&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
<br>
Este é um aplicativo moderno de **Bluetooth via Web** que permite:

- Conectar dois dispositivos Bluetooth usando serviços BLE personalizados
- Transferir arquivos (divididos em partes de 512 bytes) entre dispositivos
- Visualizar o **Histórico de Transferências** (os registros são temporários e serão excluídos após 20 dias)
- Ver o **Histórico de Dispositivos** com todos os dispositivos conectados anteriormente
- Reproduzir um som ao emparelhar ou desconectar
- Usar o app offline (PWA)
- Tocar músicas diretamente no navegador (para fones/headphones)
- Monitorar dados de saúde (para relógios)
- Jogar minigames (para controles)
- Interface compatível com mobile e desktop

> ⚠️ Este projeto utiliza a **API Web Bluetooth** experimental, que só funciona em navegadores compatíveis como o **Chrome** e apenas sob **HTTPS** ou `localhost`.

---

## 🔧 Funcionalidades

- 📂 Selecionar e enviar arquivos via Bluetooth (em partes de 512 bytes)
- 🕒 Aba de Histórico de Transferências (autoexclusão após 20 dias)
- 📋 Aba de Histórico de Dispositivos (veja todos os dispositivos conectados)
- 🔊 Som ao conectar ou desconectar
- 🎵 Player de música para fones/headphones
- 🩺 Monitoramento de saúde para relógios
- 🎮 Minigames para controles
- 📥 Receber dados por notificações BLE
- 📱 Compatível com dispositivos móveis e desktops
- ⚡ Funciona offline (PWA)

---

## 📦 UUIDs Utilizados

Certifique-se de que seu dispositivo BLE utiliza os UUIDs abaixo:

```js
const SERVICE_UUID        = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID     = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID    = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

---

## 🌐 Idiomas Disponíveis

🇧🇷 [Português (PT-BR)](README-ptbr.md) | 🇺🇸 [English (EN)](README.md) | 🇪🇸 [Español (ES)](README-es.md) | 🇨🇳 [中文 (ZH)](README-zh.md) | 🇫🇷 [Français (FR)](README-fr.md)

---

## 🙏 Obrigado pelo apoio de todos

[![Star History Chart](https://api.star-history.com/svg?repos=erikraft/Bluetooth-Center&type=Date)](https://star-history.com/#erikraft/Bluetooth-Center&Date)
