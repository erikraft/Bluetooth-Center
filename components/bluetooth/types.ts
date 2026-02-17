export type LogLevel = "info" | "success" | "warning" | "error" | "command";

export interface TerminalLog {
  id: string;
  timestamp: string;
  message: string;
  level: LogLevel;
}

export interface BluetoothDeviceEntry {
  id: string;
  name: string;
  profileTitle: string;
  profileType: string;
  detectionConfidence: number;
  detectionReasons: string[];
  discoveredServices: string[];
  capabilityFlags: string[];
  connected: boolean;
  lastSeen: string;
  nativeDevice: BluetoothDevice;
}

export interface TransferEntry {
  id: string;
  fileName: string;
  deviceName: string;
  progress: number;
  status: "waiting" | "transferring" | "done" | "error";
}
