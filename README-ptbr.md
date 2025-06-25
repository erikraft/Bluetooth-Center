# Bluetooth File Transfer Web App <img src="brand-assets\Bluetooth_Icon2.png" align="right" width="175">
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

> <img src="brand-assets\Use Bluetooth Web System.svg" align="right" width="175"> ⚠️ Este projeto utiliza a **API Web Bluetooth** experimental, que só funciona em navegadores compatíveis como o **Chrome** e apenas sob **HTTPS** ou `localhost`.

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

<details>
<summary>👀 Ver UUIDs</summary>

### Serviço Principal
```js
// Serviço de Transferência de Arquivos
const SERVICE_UUID     = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID  = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

### Dispositivos de Áudio (Fones/Caixas de Som)
```js
// Audio Sink (A2DP)
const AUDIO_SINK_UUID = '0000110b-0000-1000-8000-00805f9b34fb';

// Audio Source (A2DP Source)
const AUDIO_SOURCE_UUID = '0000110a-0000-1000-8000-00805f9b34fb';

// Perfil de Headset (HSP)
const HEADSET_HS_UUID = '00001108-0000-1000-8000-00805f9b34fb'; // Headset
const HEADSET_AG_UUID = '00001112-0000-1000-8000-00805f9b34fb'; // Audio Gateway

// Perfil Mãos-Livres (HFP)
const HANDSFREE_HS_UUID = '0000111e-0000-1000-8000-00805f9b34fb'; // Handsfree
const HANDSFREE_AG_UUID = '0000111f-0000-1000-8000-00805f9b34fb'; // Audio Gateway

// AVRCP (Controle Remoto de Áudio/Video)
const AVRCP_UUID = '0000110e-0000-1000-8000-00805f9b34fb';
```

### Controles de Jogo
```js
// Dispositivo de Interface Humana (HID)
const HID_SERVICE_UUID = '00001812-0000-1000-8000-00805f9b34fb';

// Informações HID
const HID_INFO_UUID = '00002a4a-0000-1000-8000-00805f9b34fb';

// Ponto de Controle HID
const HID_CONTROL_POINT_UUID = '00002a4c-0000-1000-8000-00805f9b34fb';

// Mapa de Relatório HID
const HID_REPORT_MAP_UUID = '00002a4b-0000-1000-8000-00805f9b34fb';

// Relatório HID
const HID_REPORT_UUID = '00002a4d-0000-1000-8000-00805f9b34fb';

// Modo de Protocolo HID
const HID_PROTOCOL_MODE_UUID = '00002a4e-0000-1000-8000-00805f9b34fb';
```

### Serviços BLE Padrão
```js
// Áudio
const AUDIO_SINK_UUID = '0000110b-0000-1000-8000-00805f9b34fb';

// Serviço de Bateria
const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';

// Informações do Dispositivo
const DEVICE_INFO_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';

// Frequência Cardíaca
const HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_MEASUREMENT_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

// Dispositivo de Interface Humana
const HID_SERVICE_UUID = '00001812-0000-1000-8000-00805f9b34fb';

// Máquina de Exercícios
const FITNESS_MACHINE_SERVICE_UUID = '00001816-0000-1000-8000-00805f9b34fb';
const STEP_COUNT_UUID = '00002a5b-0000-1000-8000-00805f9b34fb';
```

### Serviços de Dispositivos Inteligentes (Xiaomi, Huawei, etc.)
```js
// Xiaomi/Realme/Oppo
const XIAOMI_SERVICE_UUID_1 = '0000fee0-0000-1000-8000-00805f9b34fb';
const XIAOMI_SERVICE_UUID_2 = '0000fee1-0000-1000-8000-00805f9b34fb';

// Huawei
const HUAWEI_SERVICE_UUID = '0000fee9-0000-1000-8000-00805f9b34fb';

// Características Comuns
const COMMON_CHAR_1 = '0000ff07-0000-1000-8000-00805f9b34fb';
const COMMON_CHAR_2 = '0000ff06-0000-1000-8000-00805f9b34fb';
const COMMON_CHAR_3 = '0000ff04-0000-1000-8000-00805f9b34fb';

// Mi Band Específico
const MI_BAND_ACTIVITY_DATA_UUID = '00000007-0000-3512-2118-0009af100700';
const MI_BAND_BATTERY_UUID = '00000006-0000-3512-2118-0009af100700';
```
</details>

---

## 🙏 Obrigado pelo apoio de todos

[![Star History Chart](https://api.star-history.com/svg?repos=erikraft/Bluetooth-Center&type=Date)](https://star-history.com/#erikraft/Bluetooth-Center&Date)

---

## 💰 Suporte
<a href="https://ko-fi.com/erikraft" target="_blank">
<img src="./brand-assets/support_me_on_kofi_badge_blue.png" width="170" alt="Donate"/>
</a>
<br />
<br />

O Bluetooth Center é livre, e sempre será. \
Se você acha útil e quer apoiar software livre e de código aberto, considere doar usando o botão acima. \
Eu banquei o domínio e o servidor, e você pode ajudar a criar e manter ótimos softwares me apoiando. \
Muito obrigado pela sua contribuição!

---
## 🌐 Idiomas Disponíveis

<img src="brand-assets\Translate.svg" align="left" width="120">

🇧🇷 [Português (PT-BR)](README-ptbr.md) | 🇺🇸 [English (EN)](README.md) | 🇪🇸 [Español (ES)](README-es.md) | 🇨🇳 [中文 (ZH)](README-zh.md) | 🇫🇷 [Français (FR)](README-fr.md)

---