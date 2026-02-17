# 蓝牙文件传输网页应用 <img src="brand-assets\Bluetooth_Icon2.png" align="right" width="175">
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

> <img src="brand-assets\Use Bluetooth Web System.svg" align="right" width="175"> ⚠️ 本项目使用实验性的 **Web 蓝牙 API**，仅在支持的浏览器（如 **Chrome**）且在 **HTTPS** 或 `localhost` 下可用。

## 本地运行

```bash
pnpm install
pnpm run dev
```

然后打开 `http://localhost:3000`。

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

<details>
<summary>👀 查看 UUID</summary>

### 主服务
```js
// 文件传输服务
const SERVICE_UUID     = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID  = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

### 音频设备（耳机/扬声器）
```js
// 音频接收器 (A2DP)
const AUDIO_SINK_UUID = '0000110b-0000-1000-8000-00805f9b34fb';

// 音频源 (A2DP 源)
const AUDIO_SOURCE_UUID = '0000110a-0000-1000-8000-00805f9b34fb';

// 耳机配置 (HSP)
const HEADSET_HS_UUID = '00001108-0000-1000-8000-00805f9b34fb'; // 耳机
const HEADSET_AG_UUID = '00001112-0000-1000-8000-00805f9b34fb'; // 音频网关

// 免提配置 (HFP)
const HANDSFREE_HS_UUID = '0000111e-0000-1000-8000-00805f9b34fb'; // 免提
const HANDSFREE_AG_UUID = '0000111f-0000-1000-8000-00805f9b34fb'; // 音频网关

// AVRCP (音视频远程控制)
const AVRCP_UUID = '0000110e-0000-1000-8000-00805f9b34fb';
```

### 游戏控制器
```js
// 人机接口设备 (HID)
const HID_SERVICE_UUID = '00001812-0000-1000-8000-00805f9b34fb';

// HID 信息
const HID_INFO_UUID = '00002a4a-0000-1000-8000-00805f9b34fb';

// HID 控制点
const HID_CONTROL_POINT_UUID = '00002a4c-0000-1000-8000-00805f9b34fb';

// HID 报告映射
const HID_REPORT_MAP_UUID = '00002a4b-0000-1000-8000-00805f9b34fb';

// HID 报告
const HID_REPORT_UUID = '00002a4d-0000-1000-8000-00805f9b34fb';

// HID 协议模式
const HID_PROTOCOL_MODE_UUID = '00002a4e-0000-1000-8000-00805f9b34fb';
```

### 标准 BLE 服务
```js
// 音频
const AUDIO_SINK_UUID = '0000110b-0000-1000-8000-00805f9b34fb';

// 电池服务
const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';

// 设备信息服务
const DEVICE_INFO_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';

// 心率服务
const HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_MEASUREMENT_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

// 人机接口设备
const HID_SERVICE_UUID = '00001812-0000-1000-8000-00805f9b34fb';

// 健身设备
const FITNESS_MACHINE_SERVICE_UUID = '00001816-0000-1000-8000-00805f9b34fb';
const STEP_COUNT_UUID = '00002a5b-0000-1000-8000-00805f9b34fb';
```

### 智能设备服务 (小米, 华为等)
```js
// 小米/Realme/Oppo
const XIAOMI_SERVICE_UUID_1 = '0000fee0-0000-1000-8000-00805f9b34fb';
const XIAOMI_SERVICE_UUID_2 = '0000fee1-0000-1000-8000-00805f9b34fb';

// 华为
const HUAWEI_SERVICE_UUID = '0000fee9-0000-1000-8000-00805f9b34fb';

// 通用特征
const COMMON_CHAR_1 = '0000ff07-0000-1000-8000-00805f9b34fb';
const COMMON_CHAR_2 = '0000ff06-0000-1000-8000-00805f9b34fb';
const COMMON_CHAR_3 = '0000ff04-0000-1000-8000-00805f9b34fb';

// 小米手环专用
const MI_BAND_ACTIVITY_DATA_UUID = '00000007-0000-3512-2118-0009af100700';
const MI_BAND_BATTERY_UUID = '00000006-0000-3512-2118-0009af100700';
```
</details>

## 🙏 感谢大家的支持

[![Star History Chart](https://api.star-history.com/svg?repos=erikraft/Bluetooth-Center&type=Date)](https://star-history.com/#erikraft/Bluetooth-Center&Date)

---

## 💰 支持
<a href="https://ko-fi.com/erikraft" target="_blank">
<img src="./brand-assets/support_me_on_kofi_badge_blue.png" width="170" alt="Donate"/>
</a>
<br />
<br />

Bluetooth Center 是自由的，并且永远如此。\
如果你觉得它有用并希望支持自由和开源软件，请考虑使用上面的按钮捐赠。\
我自掏腰包支付了域名和服务器，你可以通过支持我来帮助创建和维护优秀的软件。\
非常感谢你的贡献！


---

## 🌐 多语言支持

<img src="brand-assets\Translate.svg" align="left" width="120">

🇧🇷 [葡萄牙语 (PT-BR)](README-ptbr.md) | 🇺🇸 [英语 (EN)](README.md) | 🇪🇸 [西班牙语 (ES)](README-es.md) | 🇨🇳 [中文 (ZH)](README-zh.md) | 🇫🇷 [法语 (FR)](README-fr.md)

---
