# Application Web de Transfert de Fichiers Bluetooth <img src="./public/favicon-32x32.png" align="right" width="100">
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

> ⚠️ Ce projet utilise l'API **Web Bluetooth** expérimentale, qui ne fonctionne que sur certains navigateurs comme **Chrome**, et uniquement sous **HTTPS** ou `localhost`.

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

Assurez-vous que votre périphérique BLE utilise les UUIDs suivants :

```js
const SERVICE_UUID        = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID     = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID    = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

---

## 🌐 Langues Disponibles

🇧🇷 [Portugais (PT-BR)](README-ptbr.md) | 🇺🇸 [Anglais (EN)](README.md) | 🇪🇸 [Espagnol (ES)](README-es.md) | 🇨🇳 [Chinois (ZH)](README-zh.md) | 🇫🇷 [Français (FR)](README-fr.md)

---

## 🙏 Merci pour le soutien de tous

[![Star History Chart](https://api.star-history.com/svg?repos=erikraft/Bluetooth-Center&type=Date)](https://star-history.com/#erikraft/Bluetooth-Center&Date)

---

## 💰 Support
<a href="https://ko-fi.com/erikraft" target="_blank">
<img src="./brand-assets/support_me_on_kofi_badge_blue.png" width="150" alt="Donate"/>
</a>
<br />
<br />

Bluetooth Center est libre, et le restera toujours. \
Si vous le trouvez utile et souhaitez soutenir les logiciels libres et open source, merci de faire un don avec le bouton ci-dessus. \
J'ai payé le domaine et le serveur, et vous pouvez aider à créer et maintenir d'excellents logiciels en me soutenant. \
Merci beaucoup pour votre contribution !

