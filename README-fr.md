# Application Web de Transfert de Fichiers Bluetooth <img src="./public/favicon-32x32.png" align="right" width="100">

Ceci est une application simple **Web Bluetooth** qui permet à deux appareils Bluetooth de :

- Se connecter via des services Bluetooth Low Energy (BLE) personnalisés  
- Transférer des fichiers par morceaux  
- Jouer un son de connexion lorsque les appareils sont appairés avec succès

> ⚠️ Ce projet utilise l'API **Web Bluetooth** expérimentale, qui ne fonctionne que sur certains navigateurs comme **Chrome**, et uniquement sous **HTTPS** ou `localhost`.

---

## 🔧 Fonctionnalités

- 📂 Sélectionner et envoyer des fichiers via Bluetooth (découpés en blocs de 512 octets)  
- 🔊 Jouer un son lors de la connexion réussie des appareils  
- 📥 Recevoir des données via notifications de caractéristiques BLE  
- 📱 Compatible mobile et bureau

---

## 📦 UUIDs utilisés

Assurez-vous que votre périphérique BLE utilise les UUIDs suivants :

```js
const SERVICE_UUID        = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID     = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID    = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

---

## Thank you everyone's support :) 
[![Star History Chart](https://api.star-history.com/svg?repos=erikraft/Bluetooth-Center&type=Date)](https://star-history.com/#erikraft/Bluetooth-Center&Date)

