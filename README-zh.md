# 蓝牙文件传输网页应用 <img src="./public/favicon-32x32.png" align="right" width="100">
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/erikraft/Bluetooth-Center?utm_source=oss&utm_medium=github&utm_campaign=erikraft%2FBluetooth-Center&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
<br>
这是一个现代化的**Web 蓝牙**应用，支持：

- 使用自定义 BLE 服务连接两个蓝牙设备
- 在设备间传输文件（分为 512 字节块）
- 查看**传输历史**（历史记录为临时，20 天后自动删除）
- 查看**设备历史**，显示所有已连接过的设备
- 设备配对或断开时播放提示音
- 支持离线使用（PWA）
- 浏览器内音乐播放器（适用于耳机）
- 健康数据监测（适用于手表）
- 控制器小游戏
- 移动端和桌面端兼容

> ⚠️ 本项目使用实验性的 **Web 蓝牙 API**，仅在支持的浏览器（如 **Chrome**）且在 **HTTPS** 或 `localhost` 下可用。

---

## 🔧 功能

- 📂 选择并通过蓝牙发送文件（分为 512 字节块）
- 🕒 传输历史标签页（20 天后自动删除）
- 📋 设备历史标签页（显示所有已连接设备）
- 🔊 连接或断开时播放提示音
- 🎵 音乐播放器（耳机）
- 🩺 健康监测（手表）
- 🎮 控制器小游戏
- 📥 通过 BLE 特征通知接收数据
- 📱 移动端和桌面端兼容
- ⚡ 支持离线（PWA）

---

## 📦 使用的 UUID

请确保您的 BLE 设备使用以下 UUID：

```js
const SERVICE_UUID        = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID     = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID    = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

---

## 🌐 多语言支持

🇧🇷 [葡萄牙语 (PT-BR)](README-ptbr.md) | 🇺🇸 [英语 (EN)](README.md) | 🇪🇸 [西班牙语 (ES)](README-es.md) | 🇨🇳 [中文 (ZH)](README-zh.md) | 🇫🇷 [法语 (FR)](README-fr.md)

---

## 🙏 感谢大家的支持

[![Star History Chart](https://api.star-history.com/svg?repos=erikraft/Bluetooth-Center&type=Date)](https://star-history.com/#erikraft/Bluetooth-Center&Date)

---

## 📞 支持
<a href="https://ko-fi.com/erikraft" target="_blank">
<img src="./brand-assets/support_me_on_kofi_badge_blue.png" width="150" alt="Donate"/>
</a>
<br />
<br />

Bluetooth Center 是自由的，并且永远如此。\
如果你觉得它有用并希望支持自由和开源软件，请考虑使用上面的按钮捐赠。\
我自掏腰包支付了域名和服务器，你可以通过支持我来帮助创建和维护优秀的软件。\
非常感谢你的贡献！
