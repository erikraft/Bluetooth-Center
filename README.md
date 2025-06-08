
# Bluetooth File Transfer Web App <img src="./public/favicon-32x32.png" align="right" width="100">
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

> ⚠️ This project uses the experimental **Web Bluetooth API**, which only works on supported browsers like **Chrome** and only under **HTTPS** or `localhost`.

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

Make sure your BLE peripheral uses the same UUIDs below:

```js
const SERVICE_UUID        = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID     = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID    = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

---

## 🌐 Available Languages

🇧🇷 [Português (PT-BR)](README-ptbr.md) | 🇺🇸 [English (EN)](README.md) | 🇪🇸 [Español (ES)](README-es.md) | 🇨🇳 [中文 (ZH)](README-zh.md) | 🇫🇷 [Français (FR)](README-fr.md)

---


## 🙏 Thank you for everyone's support

[![Star History Chart](https://api.star-history.com/svg?repos=erikraft/Bluetooth-Center&type=Date)](https://star-history.com/#erikraft/Bluetooth-Center&Date)

---

## 📞 Support
<a href="https://ko-fi.com/erikraft" target="_blank">
<img src="./brand-assets/support_me_on_kofi_badge_blue.png" width="150" alt="Donate"/>
</a>
<br />
<br />

ErikrafT Drop is libre, and always will be. \
If you find it useful and want to support free and open-source software, please consider donating using the button above. \
I footed the bill for the domain and the server, and you can help create and maintain great software by supporting me. \
Thank you very much for your contribution!
