export type DeviceProfileType =
  | "xbox-controller"
  | "playstation-controller"
  | "nintendo-controller"
  | "universal-controller"
  | "tv"
  | "tv-remote"
  | "headphones"
  | "speaker"
  | "smartwatch"
  | "keyboard"
  | "mouse"
  | "phone"
  | "laptop"
  | "tablet"
  | "medical"
  | "iot"
  | "unknown";

export interface DeviceProfile {
  id: string;
  title: string;
  type: DeviceProfileType;
  keywords: string[];
  features: string[];
}

export interface BluetoothDetectionResult {
  profile: DeviceProfile;
  confidence: number;
  reasons: string[];
  discoveredServices: string[];
  capabilityFlags: string[];
  warnings: string[];
}

export interface GamepadProfile {
  id: string;
  index: number;
  mapping: string;
  name: string;
  profile: DeviceProfile;
  connected: boolean;
  buttons: number;
  axes: number;
}

export interface BluetoothEnvironmentReport {
  webBluetooth: boolean;
  gamepadApi: boolean;
  webHid: boolean;
  webSerial: boolean;
  mediaDevices: boolean;
}

export const DEVICE_PROFILES: DeviceProfile[] = [
  {
    id: "profile-xbox",
    title: "Xbox Controller",
    type: "xbox-controller",
    keywords: ["xbox", "xinput", "microsoft"],
    features: ["D-pad", "Analog sticks", "Triggers", "Vibration"],
  },
  {
    id: "profile-playstation",
    title: "PlayStation Controller",
    type: "playstation-controller",
    keywords: ["playstation", "dualshock", "dualsense", "sony", "ps5", "ps4"],
    features: ["D-pad", "Analog sticks", "Touchpad", "Adaptive profile"],
  },
  {
    id: "profile-nintendo",
    title: "Nintendo Controller",
    type: "nintendo-controller",
    keywords: ["switch", "joy-con", "pro controller", "nintendo"],
    features: ["Motion capable", "D-pad", "Analog sticks"],
  },
  {
    id: "profile-universal",
    title: "Universal Gamepad",
    type: "universal-controller",
    keywords: ["gamepad", "controller", "wireless controller", "joystick"],
    features: ["Standard mapping", "Cross-platform", "Gamepad API"],
  },
  {
    id: "profile-tv",
    title: "Smart TV",
    type: "tv",
    keywords: ["tv", "smart tv", "android tv", "webos", "tizen", "chromecast", "roku", "bravia", "fire tv"],
    features: ["Media playback", "Cast target", "Remote pairing"],
  },
  {
    id: "profile-tv-remote",
    title: "TV Remote",
    type: "tv-remote",
    keywords: ["remote", "tv remote", "media remote", "roku remote"],
    features: ["Media keys", "Directional control", "Voice trigger"],
  },
  {
    id: "profile-headphones",
    title: "Headphones",
    type: "headphones",
    keywords: ["headphone", "buds", "earbuds", "headset", "airpods"],
    features: ["A2DP", "Playback control", "Hands-free"],
  },
  {
    id: "profile-speaker",
    title: "Speaker",
    type: "speaker",
    keywords: ["speaker", "soundbar", "boom", "alexa"],
    features: ["Audio sink", "Media control"],
  },
  {
    id: "profile-watch",
    title: "Smartwatch",
    type: "smartwatch",
    keywords: ["watch", "wear", "smartwatch", "fit", "fitbit", "amazfit", "galaxy watch", "mi band", "garmin"],
    features: ["Health telemetry", "Notifications", "Sensors"],
  },
  {
    id: "profile-keyboard",
    title: "Keyboard",
    type: "keyboard",
    keywords: ["keyboard"],
    features: ["HID input", "Low latency"],
  },
  {
    id: "profile-mouse",
    title: "Mouse",
    type: "mouse",
    keywords: ["mouse", "trackpad"],
    features: ["HID pointer", "Scroll wheel"],
  },
  {
    id: "profile-phone",
    title: "Phone",
    type: "phone",
    keywords: ["phone", "iphone", "android", "pixel", "galaxy"],
    features: ["File transfer", "Tether controls", "Notifications"],
  },
  {
    id: "profile-laptop",
    title: "Laptop",
    type: "laptop",
    keywords: ["laptop", "notebook", "pc", "macbook"],
    features: ["File transfer", "Peripheral bridge"],
  },
  {
    id: "profile-tablet",
    title: "Tablet",
    type: "tablet",
    keywords: ["tablet", "ipad"],
    features: ["File transfer", "Remote media"],
  },
  {
    id: "profile-medical",
    title: "Medical Device",
    type: "medical",
    keywords: ["glucose", "thermometer", "blood", "health"],
    features: ["Medical telemetry", "Secure BLE data"],
  },
  {
    id: "profile-iot",
    title: "IoT Device",
    type: "iot",
    keywords: ["sensor", "tag", "beacon", "iot", "tracker", "lock"],
    features: ["Telemetry", "Automation", "Beaconing"],
  },
];

const UNKNOWN_PROFILE: DeviceProfile = {
  id: "profile-unknown",
  title: "Unknown Device",
  type: "unknown",
  keywords: [],
  features: ["Basic Bluetooth support"],
};

const SERVICE_SIGNATURES: Record<DeviceProfileType, string[]> = {
  "xbox-controller": ["00001812-0000-1000-8000-00805f9b34fb"],
  "playstation-controller": ["00001812-0000-1000-8000-00805f9b34fb"],
  "nintendo-controller": ["00001812-0000-1000-8000-00805f9b34fb"],
  "universal-controller": ["00001812-0000-1000-8000-00805f9b34fb"],
  tv: [],
  "tv-remote": ["00001812-0000-1000-8000-00805f9b34fb"],
  headphones: ["00001848-0000-1000-8000-00805f9b34fb", "00001849-0000-1000-8000-00805f9b34fb"],
  speaker: ["00001848-0000-1000-8000-00805f9b34fb", "00001849-0000-1000-8000-00805f9b34fb"],
  smartwatch: [
    "0000180d-0000-1000-8000-00805f9b34fb",
    "0000180f-0000-1000-8000-00805f9b34fb",
    "00001805-0000-1000-8000-00805f9b34fb",
  ],
  keyboard: ["00001812-0000-1000-8000-00805f9b34fb"],
  mouse: ["00001812-0000-1000-8000-00805f9b34fb"],
  phone: ["00001800-0000-1000-8000-00805f9b34fb", "00001801-0000-1000-8000-00805f9b34fb"],
  laptop: ["00001800-0000-1000-8000-00805f9b34fb", "00001801-0000-1000-8000-00805f9b34fb"],
  tablet: ["00001800-0000-1000-8000-00805f9b34fb", "00001801-0000-1000-8000-00805f9b34fb"],
  medical: ["00001808-0000-1000-8000-00805f9b34fb", "00001809-0000-1000-8000-00805f9b34fb"],
  iot: ["0000181a-0000-1000-8000-00805f9b34fb"],
  unknown: [],
};

function normalizeService(uuid: string): string {
  return uuid.toLowerCase();
}

function profileByType(type: DeviceProfileType): DeviceProfile {
  return DEVICE_PROFILES.find((profile) => profile.type === type) ?? UNKNOWN_PROFILE;
}

export function detectDeviceProfile(name: string): DeviceProfile {
  const normalized = name.toLowerCase();

  let best: DeviceProfile = UNKNOWN_PROFILE;
  let bestHits = 0;

  DEVICE_PROFILES.forEach((profile) => {
    const hits = profile.keywords.filter((keyword) => normalized.includes(keyword)).length;
    if (hits > bestHits) {
      best = profile;
      bestHits = hits;
    }
  });

  return best;
}

function scoreNameSignals(name: string, profile: DeviceProfile): number {
  if (profile.type === "unknown") return 0.18;
  const normalized = name.toLowerCase();
  const hits = profile.keywords.filter((keyword) => normalized.includes(keyword)).length;
  return Math.min(0.4 + hits * 0.12, 0.82);
}

function scoreServiceSignals(services: string[], profileType: DeviceProfileType): number {
  const signatures = SERVICE_SIGNATURES[profileType] ?? [];
  if (signatures.length === 0) return 0;

  const matched = signatures.filter((signature) => services.includes(signature)).length;
  if (matched === 0) return 0;

  return Math.min(0.2 + (matched / signatures.length) * 0.65, 0.92);
}

function hasService(services: string[], uuid: string): boolean {
  return services.includes(uuid);
}

async function safeDiscoverServices(device: BluetoothDevice): Promise<{ discoveredServices: string[]; warnings: string[] }> {
  const warnings: string[] = [];
  const services: string[] = [];

  if (!device.gatt) {
    warnings.push("Dispositivo sem interface GATT no navegador.");
    return { discoveredServices: services, warnings };
  }

  const shouldDisconnect = !device.gatt.connected;

  try {
    const server = shouldDisconnect ? await device.gatt.connect() : device.gatt;
    const primaryServices = await server.getPrimaryServices();
    primaryServices.forEach((service) => services.push(normalizeService(service.uuid)));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao consultar servicos.";
    warnings.push(message);
  } finally {
    if (shouldDisconnect && device.gatt.connected) {
      try {
        device.gatt.disconnect();
      } catch {
        warnings.push("Nao foi possivel encerrar a conexao apos a analise.");
      }
    }
  }

  return { discoveredServices: Array.from(new Set(services)), warnings };
}

export async function autoDetectBluetoothDevice(
  device: BluetoothDevice,
  options?: { probeServices?: boolean },
): Promise<BluetoothDetectionResult> {
  const name = device.name || "Dispositivo sem nome";
  const nameProfile = detectDeviceProfile(name);
  const reasons: string[] = [];
  const capabilityFlags: string[] = [];
  const warnings: string[] = [];
  let discoveredServices: string[] = [];

  let bestProfile = nameProfile;
  let bestScore = scoreNameSignals(name, nameProfile);

  reasons.push(`Nome analisado: ${name}`);
  reasons.push(`Perfil inicial: ${nameProfile.title}`);

  if (name.toLowerCase().includes("ble")) {
    capabilityFlags.push("BLE")
  }

  if (options?.probeServices) {
    const probe = await safeDiscoverServices(device);
    discoveredServices = probe.discoveredServices;
    warnings.push(...probe.warnings);

    if (discoveredServices.length > 0) {
      reasons.push(`Servicos GATT detectados: ${discoveredServices.length}`);
    }

    DEVICE_PROFILES.forEach((profile) => {
      const serviceScore = scoreServiceSignals(discoveredServices, profile.type);
      if (serviceScore > bestScore) {
        bestScore = serviceScore;
        bestProfile = profile;
      }
    });

    if (discoveredServices.some((uuid) => uuid === "00001812-0000-1000-8000-00805f9b34fb")) {
      capabilityFlags.push("HID");
    }

    if (discoveredServices.some((uuid) => uuid === "0000180f-0000-1000-8000-00805f9b34fb")) {
      capabilityFlags.push("Battery");
    }

    if (discoveredServices.some((uuid) => uuid === "00001805-0000-1000-8000-00805f9b34fb")) {
      capabilityFlags.push("CurrentTime");
    }

    if (discoveredServices.some((uuid) => uuid === "0000180d-0000-1000-8000-00805f9b34fb")) {
      capabilityFlags.push("HeartRate");
    }

    if (
      discoveredServices.some(
        (uuid) => uuid === "00001848-0000-1000-8000-00805f9b34fb" || uuid === "00001849-0000-1000-8000-00805f9b34fb",
      )
    ) {
      capabilityFlags.push("MediaControl");
    }

    const healthSignals =
      hasService(discoveredServices, "0000180d-0000-1000-8000-00805f9b34fb") ||
      hasService(discoveredServices, "00001805-0000-1000-8000-00805f9b34fb");

    if (healthSignals && bestProfile.type !== "smartwatch" && bestProfile.type !== "medical") {
      bestProfile = profileByType("smartwatch");
      bestScore = Math.max(bestScore, 0.74);
      reasons.push("Sinal de servicos de saude/relogio detectado; perfil ajustado para Smartwatch.");
    }
  }

  return {
    profile: bestProfile,
    confidence: Number(bestScore.toFixed(2)),
    reasons,
    discoveredServices,
    capabilityFlags,
    warnings,
  };
}

export function getBluetoothEnvironmentReport(): BluetoothEnvironmentReport {
  const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { hid?: unknown; serial?: unknown }) : undefined;

  return {
    webBluetooth: !!nav && "bluetooth" in nav,
    gamepadApi: !!nav && typeof nav.getGamepads === "function",
    webHid: !!nav && "hid" in nav,
    webSerial: !!nav && "serial" in nav,
    mediaDevices: !!nav?.mediaDevices,
  };
}
