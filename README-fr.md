# Application Web de Transfert de Fichiers Bluetooth <img src="brand-assets\Bluetooth_Icon2.png" align="right" width="175">
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/erikraft/Bluetooth-Center?utm_source=oss&utm_medium=github&utm_campaign=erikraft%2FBluetooth-Center&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
<br>
Il s'agit d'une application **Web Bluetooth** moderne qui permet :

- De connecter deux appareils Bluetooth via des services BLE personnalisés
- De transférer des fichiers (découpés en blocs de 512 octets) entre appareils
- De consulter l'**historique des transferts** (les historiques sont temporaires et supprimés après 20 jours)
- De voir l'**historique des appareils** avec tous les appareils connectés précédemment
- De jouer un son lors de l'appairage ou de la déconnexion
- D'utiliser l'application hors ligne (PWA)
- D'écouter de la musique dans le navigateur (pour les écouteurs)
- De surveiller la santé (pour les montres connectées)
- De jouer à des mini-jeux (pour les manettes)
- Interface compatible mobile et bureau

> <img src="brand-assets\Use Bluetooth Web System.svg" align="right" width="175"> ⚠️ Ce projet utilise l'API **Web Bluetooth** expérimentale, qui ne fonctionne que sur certains navigateurs comme **Chrome**, et uniquement sous **HTTPS** ou `localhost`.

---

## 🔧 Fonctionnalités

- 📂 Sélectionner et envoyer des fichiers via Bluetooth (par blocs de 512 octets)
- 🕒 Onglet Historique des Transferts (suppression automatique après 20 jours)
- 📋 Onglet Historique des Appareils (voir tous les appareils connectés)
- 🔊 Son lors de la connexion ou déconnexion
- 🎵 Lecteur de musique pour écouteurs
- 🩺 Suivi santé pour montres connectées
- 🎮 Mini-jeux pour manettes
- 📥 Recevoir des données via notifications BLE
- 📱 Compatible mobile et bureau
- ⚡ Fonctionne hors ligne (PWA)

---

## 📦 UUIDs utilisés

<details>
<summary>👀 Voir les UUIDs</summary>

### Service Principal
```js
// Service de Transfert de Fichiers
const SERVICE_UUID     = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID  = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

### Périphériques Audio (Écouteurs/Enceintes)
```js
// Audio Sink (A2DP)
const AUDIO_SINK_UUID = '0000110b-0000-1000-8000-00805f9b34fb';

// Audio Source (A2DP Source)
const AUDIO_SOURCE_UUID = '0000110a-0000-1000-8000-00805f9b34fb';

// Profil Casque (HSP)
const HEADSET_HS_UUID = '00001108-0000-1000-8000-00805f9b34fb'; // Casque
const HEADSET_AG_UUID = '00001112-0000-1000-8000-00805f9b34fb'; // Passerelle audio

// Profil Mains Libres (HFP)
const HANDSFREE_HS_UUID = '0000111e-0000-1000-8000-00805f9b34fb'; // Mains libres
const HANDSFREE_AG_UUID = '0000111f-0000-1000-8000-00805f9b34fb'; // Passerelle audio

// AVRCP (Télécommande Audio/Video)
const AVRCP_UUID = '0000110e-0000-1000-8000-00805f9b34fb';
```

### Manettes de Jeu
```js
// Périphérique d'Interface Humaine (HID)
const HID_SERVICE_UUID = '00001812-0000-1000-8000-00805f9b34fb';

// Informations HID
const HID_INFO_UUID = '00002a4a-0000-1000-8000-00805f9b34fb';

// Point de Contrôle HID
const HID_CONTROL_POINT_UUID = '00002a4c-0000-1000-8000-00805f9b34fb';

// Carte de Rapport HID
const HID_REPORT_MAP_UUID = '00002a4b-0000-1000-8000-00805f9b34fb';

// Rapport HID
const HID_REPORT_UUID = '00002a4d-0000-1000-8000-00805f9b34fb';

// Mode Protocole HID
const HID_PROTOCOL_MODE_UUID = '00002a4e-0000-1000-8000-00805f9b34fb';
```

### Services BLE Standard
```js
// Audio
const AUDIO_SINK_UUID = '0000110b-0000-1000-8000-00805f9b34fb';

// Service de Batterie
const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';

// Informations sur le Périphérique
const DEVICE_INFO_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';

// Fréquence Cardiaque
const HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_MEASUREMENT_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

// Périphérique d'Interface Humaine
const HID_SERVICE_UUID = '00001812-0000-1000-8000-00805f9b34fb';

// Machine de Fitness
const FITNESS_MACHINE_SERVICE_UUID = '00001816-0000-1000-8000-00805f9b34fb';
const STEP_COUNT_UUID = '00002a5b-0000-1000-8000-00805f9b34fb';
```

### Services des Appareils Intelligents (Xiaomi, Huawei, etc.)
```js
// Xiaomi/Realme/Oppo
const XIAOMI_SERVICE_UUID_1 = '0000fee0-0000-1000-8000-00805f9b34fb';
const XIAOMI_SERVICE_UUID_2 = '0000fee1-0000-1000-8000-00805f9b34fb';

// Huawei
const HUAWEI_SERVICE_UUID = '0000fee9-0000-1000-8000-00805f9b34fb';

// Caractéristiques Communes
const COMMON_CHAR_1 = '0000ff07-0000-1000-8000-00805f9b34fb';
const COMMON_CHAR_2 = '0000ff06-0000-1000-8000-00805f9b34fb';
const COMMON_CHAR_3 = '0000ff04-0000-1000-8000-00805f9b34fb';

// Spécifique à la Mi Band
const MI_BAND_ACTIVITY_DATA_UUID = '00000007-0000-3512-2118-0009af100700';
const MI_BAND_BATTERY_UUID = '00000006-0000-3512-2118-0009af100700';
```
</details>

---

## 🙏 Merci pour le soutien de tous

[![Star History Chart](https://api.star-history.com/svg?repos=erikraft/Bluetooth-Center&type=Date)](https://star-history.com/#erikraft/Bluetooth-Center&Date)

---

## 💰 Support
<a href="https://ko-fi.com/erikraft" target="_blank">
<img src="./brand-assets/support_me_on_kofi_badge_blue.png" width="170" alt="Donate"/>
</a>
<br />
<br />

Bluetooth Center est libre, et le restera toujours. \
Si vous le trouvez utile et souhaitez soutenir les logiciels libres et open source, merci de faire un don avec le bouton ci-dessus. \
J'ai payé le domaine et le serveur, et vous pouvez aider à créer et maintenir d'excellents logiciels en me soutenant. \
Merci beaucoup pour votre contribution !

---

## 🌐 Langues Disponibles

<img src="brand-assets\Translate.svg" align="left" width="120">

🇧🇷 [Portugais (PT-BR)](README-ptbr.md) | 🇺🇸 [Anglais (EN)](README.md) | 🇪🇸 [Espagnol (ES)](README-es.md) | 🇨🇳 [Chinois (ZH)](README-zh.md) | 🇫🇷 [Français (FR)](README-fr.md)

---
