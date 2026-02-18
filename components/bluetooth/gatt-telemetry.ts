export interface GattReadableSample {
  serviceUuid: string;
  characteristicUuid: string;
  label: string;
  value: string;
}

export interface GattTelemetrySnapshot {
  timestamp: string;
  serviceCount: number;
  characteristicCount: number;
  batteryLevel?: number;
  heartRateBpm?: number;
  deviceTime?: string;
  supportsHeartRateNotify: boolean;
  readableSamples: GattReadableSample[];
  warnings: string[];
}

export type MediaControlAction = "play" | "pause" | "next" | "previous";

const SERVICE_BATTERY = "0000180f-0000-1000-8000-00805f9b34fb";
const SERVICE_HEART_RATE = "0000180d-0000-1000-8000-00805f9b34fb";
const SERVICE_CURRENT_TIME = "00001805-0000-1000-8000-00805f9b34fb";
const SERVICE_MEDIA_CONTROL = "00001848-0000-1000-8000-00805f9b34fb";

const CHAR_BATTERY_LEVEL = "00002a19-0000-1000-8000-00805f9b34fb";
const CHAR_HEART_RATE_MEASUREMENT = "00002a37-0000-1000-8000-00805f9b34fb";
const CHAR_CURRENT_TIME = "00002a2b-0000-1000-8000-00805f9b34fb";
const CHAR_MEDIA_CONTROL_POINT = "00002ba4-0000-1000-8000-00805f9b34fb";

function nowIso(): string {
  return new Date().toISOString();
}

function normalize(uuid: string): string {
  return uuid.toLowerCase();
}

function hexPreview(value: DataView): string {
  const max = Math.min(value.byteLength, 8);
  const bytes: string[] = [];
  for (let index = 0; index < max; index += 1) {
    bytes.push(value.getUint8(index).toString(16).padStart(2, "0"));
  }
  return bytes.join(" ");
}

function parseBatteryLevel(value: DataView): number | undefined {
  if (value.byteLength < 1) return undefined;
  const level = value.getUint8(0);
  if (level < 0 || level > 100) return undefined;
  return level;
}

function parseHeartRate(value: DataView): number | undefined {
  if (value.byteLength < 2) return undefined;
  const flags = value.getUint8(0);
  const isUint16 = (flags & 0x01) === 0x01;
  if (isUint16) {
    if (value.byteLength < 3) return undefined;
    return value.getUint16(1, true);
  }
  return value.getUint8(1);
}

function parseCurrentTime(value: DataView): string | undefined {
  if (value.byteLength < 7) return undefined;
  const year = value.getUint16(0, true);
  const month = value.getUint8(2);
  const day = value.getUint8(3);
  const hours = value.getUint8(4);
  const minutes = value.getUint8(5);
  const seconds = value.getUint8(6);

  if (year < 2000 || month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  if (hours > 23 || minutes > 59 || seconds > 59) return undefined;

  const iso = `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hours
    .toString()
    .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  return iso;
}

export async function collectGattTelemetry(device: BluetoothDevice): Promise<GattTelemetrySnapshot> {
  const warnings: string[] = [];
  const readableSamples: GattReadableSample[] = [];
  let batteryLevel: number | undefined;
  let heartRateBpm: number | undefined;
  let deviceTime: string | undefined;
  let serviceCount = 0;
  let characteristicCount = 0;
  let supportsHeartRateNotify = false;

  if (!device.gatt) {
    return {
      timestamp: nowIso(),
      serviceCount: 0,
      characteristicCount: 0,
      supportsHeartRateNotify: false,
      readableSamples,
      warnings: ["Dispositivo sem interface GATT."],
    };
  }

  const shouldDisconnect = !device.gatt.connected;

  try {
    const server = shouldDisconnect ? await device.gatt.connect() : device.gatt;
    const services = await server.getPrimaryServices();
    serviceCount = services.length;

    for (const service of services) {
      const serviceUuid = normalize(service.uuid);
      const characteristics = await service.getCharacteristics();
      characteristicCount += characteristics.length;

      for (const characteristic of characteristics) {
        const characteristicUuid = normalize(characteristic.uuid);

        if (characteristicUuid === CHAR_HEART_RATE_MEASUREMENT && characteristic.properties.notify) {
          supportsHeartRateNotify = true;
        }

        if (!characteristic.properties.read) {
          continue;
        }

        try {
          const value = await characteristic.readValue();
          if (characteristicUuid === CHAR_BATTERY_LEVEL || serviceUuid === SERVICE_BATTERY) {
            batteryLevel = parseBatteryLevel(value) ?? batteryLevel;
          }
          if (characteristicUuid === CHAR_HEART_RATE_MEASUREMENT || serviceUuid === SERVICE_HEART_RATE) {
            heartRateBpm = parseHeartRate(value) ?? heartRateBpm;
          }
          if (characteristicUuid === CHAR_CURRENT_TIME || serviceUuid === SERVICE_CURRENT_TIME) {
            deviceTime = parseCurrentTime(value) ?? deviceTime;
          }

          const label =
            characteristicUuid === CHAR_BATTERY_LEVEL
              ? "Battery Level"
              : characteristicUuid === CHAR_HEART_RATE_MEASUREMENT
                ? "Heart Rate Measurement"
                : characteristicUuid === CHAR_CURRENT_TIME
                  ? "Current Time"
                  : "GATT Read";

          const parsedValue =
            characteristicUuid === CHAR_BATTERY_LEVEL && batteryLevel !== undefined
              ? `${batteryLevel}%`
              : characteristicUuid === CHAR_HEART_RATE_MEASUREMENT && heartRateBpm !== undefined
                ? `${heartRateBpm} bpm`
                : characteristicUuid === CHAR_CURRENT_TIME && deviceTime
                  ? deviceTime
                  : `0x${hexPreview(value)}`;

          readableSamples.push({
            serviceUuid,
            characteristicUuid,
            label,
            value: parsedValue,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Falha ao ler caracteristica.";
          warnings.push(`${characteristicUuid}: ${message}`);
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao coletar telemetria GATT.";
    warnings.push(message);
  } finally {
    if (shouldDisconnect && device.gatt.connected) {
      try {
        device.gatt.disconnect();
      } catch {
        warnings.push("Nao foi possivel desconectar apos telemetria.");
      }
    }
  }

  return {
    timestamp: nowIso(),
    serviceCount,
    characteristicCount,
    batteryLevel,
    heartRateBpm,
    deviceTime,
    supportsHeartRateNotify,
    readableSamples: readableSamples.slice(0, 12),
    warnings: Array.from(new Set(warnings)).slice(0, 8),
  };
}

async function resolveMediaControlPoint(
  device: BluetoothDevice,
): Promise<{ characteristic: BluetoothRemoteGATTCharacteristic; shouldDisconnect: boolean } | null> {
  if (!device.gatt) return null;

  const shouldDisconnect = !device.gatt.connected;
  const server = shouldDisconnect ? await device.gatt.connect() : device.gatt;
  const service = await server.getPrimaryService(SERVICE_MEDIA_CONTROL);
  const characteristic = await service.getCharacteristic(CHAR_MEDIA_CONTROL_POINT);
  return { characteristic, shouldDisconnect };
}

function mediaOpcode(action: MediaControlAction): number {
  switch (action) {
    case "play":
      return 0x01;
    case "pause":
      return 0x02;
    case "next":
      return 0x33;
    case "previous":
      return 0x32;
    default:
      return 0x01;
  }
}

export async function sendBleMediaControl(device: BluetoothDevice, action: MediaControlAction): Promise<void> {
  const resolved = await resolveMediaControlPoint(device);
  if (!resolved) {
    throw new Error("Dispositivo sem GATT para controle de midia.");
  }

  const { characteristic, shouldDisconnect } = resolved;
  const payload = new Uint8Array([mediaOpcode(action)]);

  try {
    if ("writeValueWithResponse" in characteristic && typeof characteristic.writeValueWithResponse === "function") {
      await characteristic.writeValueWithResponse(payload);
      return;
    }

    if ("writeValueWithoutResponse" in characteristic && typeof characteristic.writeValueWithoutResponse === "function") {
      await characteristic.writeValueWithoutResponse(payload);
      return;
    }

    await characteristic.writeValue(payload);
  } finally {
    if (shouldDisconnect && device.gatt?.connected) {
      try {
        device.gatt.disconnect();
      } catch {
        // no-op
      }
    }
  }
}
