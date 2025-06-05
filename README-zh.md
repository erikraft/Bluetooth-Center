# 蓝牙文件传输网页应用 <img src="./public/favicon-32x32.png" align="right" width="100">

这是一个简单的**Web 蓝牙**应用程序，允许两个支持蓝牙的设备：

- 使用自定义的低功耗蓝牙（BLE）服务进行连接  
- 分块传输文件  
- 设备成功配对时播放连接音效

> ⚠️ 本项目使用实验性的**Web 蓝牙 API**，仅在支持的浏览器（如 **Chrome**）且在 **HTTPS** 或 `localhost` 环境下工作。

---

## 🔧 功能

- 📂 选择并通过蓝牙发送文件（分成512字节块）  
- 🔊 设备成功连接时播放声音  
- 📥 通过BLE特征通知接收数据  
- 📱 兼容移动设备和桌面

---

## 📦 使用的 UUID

确保您的BLE设备使用以下UUID：

```js
const SERVICE_UUID        = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
const WRITE_CHAR_UUID     = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
const NOTIFY_CHAR_UUID    = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
```

---

## Thank you everyone's support :) 
[![Star History Chart](https://api.star-history.com/svg?repos=erikraft/Bluetooth-Center&type=Date)](https://star-history.com/#erikraft/Bluetooth-Center&Date)
