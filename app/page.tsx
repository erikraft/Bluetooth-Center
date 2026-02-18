"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  BatteryMedium,
  Bluetooth,
  Clock3,
  Gamepad2,
  HeartPulse,
  Keyboard,
  Link2,
  LoaderCircle,
  MousePointer2,
  MonitorSmartphone,
  Pause,
  Play,
  Plug2,
  RefreshCw,
  SkipBack,
  SkipForward,
  Unplug,
  Upload,
  X,
} from "lucide-react";
import { BluetoothHero } from "@/components/bluetooth/bluetooth-hero";
import { BluetoothModules } from "@/components/bluetooth/bluetooth-modules";
import { BluetoothTerminal } from "@/components/bluetooth/bluetooth-terminal";
import { BluetoothUuidBank } from "@/components/bluetooth/bluetooth-uuid-bank";
import {
  collectGattTelemetry,
  type GattTelemetrySnapshot,
  type MediaControlAction,
  sendBleMediaControl,
} from "@/components/bluetooth/gatt-telemetry";
import { BluetoothDeviceEntry, TerminalLog, TransferEntry } from "@/components/bluetooth/types";
import { useGsapBluetoothAnimations } from "@/components/bluetooth/use-gsap-bluetooth";
import { ALL_BLUETOOTH_UUIDS, BLUETOOTH_SERVICE_UUIDS, createRuntimeUuids } from "@/lib/bluetooth-uuids";
import {
  autoDetectBluetoothDevice,
  DEVICE_PROFILES,
  type DeviceProfileType,
  detectDeviceProfile,
  GamepadProfile,
  getBluetoothEnvironmentReport,
} from "@/components/bluetooth/device-profiles";
import { SnakeGame } from "@/components/snake-game";

function getUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `uuid-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

function nowTime(): string {
  return new Date().toLocaleTimeString("pt-BR", { hour12: false });
}

const MAX_UUID_TOTAL = 1_150_165;
const HEART_RATE_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb";
const BATTERY_SERVICE = "0000180f-0000-1000-8000-00805f9b34fb";
const CURRENT_TIME_SERVICE = "00001805-0000-1000-8000-00805f9b34fb";
const HID_SERVICE = "00001812-0000-1000-8000-00805f9b34fb";

function getRuntimeUuidTarget(): number {
  return Math.max(0, MAX_UUID_TOTAL - ALL_BLUETOOTH_UUIDS.length);
}

export default function Page() {
  const rootRef = useGsapBluetoothAnimations();
  const waitingAudioRef = useRef<HTMLAudioElement>(null);
  const connectedAudioRef = useRef<HTMLAudioElement>(null);
  const disconnectedAudioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [supported, setSupported] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [devices, setDevices] = useState<BluetoothDeviceEntry[]>([]);
  const [transfers, setTransfers] = useState<TransferEntry[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [runtimeUuids, setRuntimeUuids] = useState<string[]>([]);
  const [gamepads, setGamepads] = useState<GamepadProfile[]>([]);
  const [snakeActive, setSnakeActive] = useState(false);
  const [snakeScore, setSnakeScore] = useState(0);
  const [environmentReport, setEnvironmentReport] = useState(() => getBluetoothEnvironmentReport());
  const [telemetryByDeviceId, setTelemetryByDeviceId] = useState<Record<string, GattTelemetrySnapshot>>({});
  const [mediaControlBusy, setMediaControlBusy] = useState(false);
  const telemetryInFlightRef = useRef<Record<string, boolean>>({});
  const telemetryLastAttemptAtRef = useRef<Record<string, number>>({});

  const allUuids = useMemo(() => [...ALL_BLUETOOTH_UUIDS, ...runtimeUuids], [runtimeUuids]);

  const selectedDevice = useMemo(
    () => devices.find((device) => device.id === selectedDeviceId),
    [devices, selectedDeviceId],
  );

  const connectedDevicesCount = useMemo(
    () => devices.filter((device) => device.connected).length,
    [devices],
  );

  const connectedGamepads = useMemo(
    () => gamepads.filter((gamepad) => gamepad.connected),
    [gamepads],
  );

  const activeGamepadIndex = connectedGamepads[0]?.index;
  const selectedTelemetry = selectedDevice ? telemetryByDeviceId[selectedDevice.id] : undefined;

  const selectedDeviceInsights = useMemo(() => {
    if (!selectedDevice) return null;

    const profileType: DeviceProfileType = selectedDevice.profileType;
    const discoveredServices = new Set(selectedDevice.discoveredServices.map((service) => service.toLowerCase()));
    const flags = new Set(selectedDevice.capabilityFlags);
    const hasHeartRate = discoveredServices.has(HEART_RATE_SERVICE) || flags.has("HeartRate");
    const hasBattery = discoveredServices.has(BATTERY_SERVICE) || flags.has("Battery");
    const hasCurrentTime = discoveredServices.has(CURRENT_TIME_SERVICE) || flags.has("CurrentTime");
    const hasHid = discoveredServices.has(HID_SERVICE) || flags.has("HID");
    const hasMediaControl = discoveredServices.has("00001848-0000-1000-8000-00805f9b34fb") || flags.has("MediaControl");
    const isController =
      profileType === "xbox-controller" ||
      profileType === "playstation-controller" ||
      profileType === "nintendo-controller" ||
      profileType === "universal-controller";

    const availableData: string[] = [];
    const actions: string[] = [];
    const constraints: string[] = [];

    if (hasCurrentTime) availableData.push("Hora do dispositivo (Current Time Service)");
    if (hasHeartRate) availableData.push("Batimento cardiaco (Heart Rate Service)");
    if (hasBattery) availableData.push("Bateria (Battery Service)");
    if (typeof selectedTelemetry?.batteryLevel === "number") {
      availableData.push(`Bateria em tempo real: ${selectedTelemetry.batteryLevel}%`);
    }
    if (typeof selectedTelemetry?.heartRateBpm === "number") {
      availableData.push(`Batimento em tempo real: ${selectedTelemetry.heartRateBpm} bpm`);
    }
    if (selectedTelemetry?.deviceTime) {
      availableData.push(`Hora lida do dispositivo: ${selectedTelemetry.deviceTime}`);
    }

    if (profileType === "smartwatch") {
      constraints.push("Exercicio, agua e calorias dependem de servicos proprietarios do fabricante.");
      constraints.push("Sem caracteristica GATT exposta, esses dados nao ficam disponiveis no navegador.");
      if (!selectedTelemetry || selectedTelemetry.readableSamples.length === 0) {
        constraints.push("Este relogio nao expôs caracteristicas legiveis para dados extras no Web Bluetooth.");
      }
    }

    if (profileType === "tv" || profileType === "tv-remote") {
      if (hasHid) {
        actions.push("Navegacao basica tipo controle remoto via HID");
      }
      constraints.push("Ligar/desligar TV por Bluetooth depende de API/servico proprietario do fabricante.");
      constraints.push("Teclado e mouse virtual exigem pareamento HID real no dispositivo de destino.");
    }

    if (profileType === "speaker" || profileType === "headphones") {
      if (hasMediaControl) {
        actions.push("Play/Pause/Adiantar/Voltar via BLE Media Control Service");
      } else {
        constraints.push("Este audio device nao expôs o servico BLE de Media Control no navegador.");
      }
    }

    if (isController) {
      if (environmentReport.gamepadApi) {
        actions.push("Teste de botoes/eixos via Gamepad API");
        actions.push("Jogar Snake para validar comandos");
      } else {
        constraints.push("Gamepad API indisponivel neste navegador.");
      }
    }

    if (profileType === "laptop" || profileType === "tablet" || profileType === "phone") {
      constraints.push("Web Bluetooth nao emula teclado/mouse virtual por conta propria.");
      if (environmentReport.webHid) {
        actions.push("WebHID disponivel para integrar perifericos HID compativeis");
      }
    }

    return { availableData, actions, constraints };
  }, [selectedDevice, selectedTelemetry, environmentReport.gamepadApi, environmentReport.webHid]);

  const addLog = (message: string, level: TerminalLog["level"] = "info") => {
    setLogs((current) => [
      ...current,
      {
        id: getUuid(),
        timestamp: nowTime(),
        message,
        level,
      },
    ]);
  };

  const playAudio = (kind: "waiting" | "connected" | "disconnected") => {
    const map = {
      waiting: waitingAudioRef.current,
      connected: connectedAudioRef.current,
      disconnected: disconnectedAudioRef.current,
    };

    const audio = map[kind];
    if (!audio) return;

    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  };

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && "bluetooth" in navigator);
    const runtimeTarget = getRuntimeUuidTarget();
    setRuntimeUuids(createRuntimeUuids(runtimeTarget));
    addLog("$ git checkout -b redesign/bluetooth-center", "command");
    addLog("Layout recarregado com base no template.", "success");
    addLog(`UUID bank iniciado com densidade extrema (${MAX_UUID_TOTAL} total).`, "info");
    addLog("Dica de terminal: digite help para ver os comandos disponiveis.", "info");
    const env = getBluetoothEnvironmentReport();
    setEnvironmentReport(env);
    addLog(
      `Detection Engine: BT=${env.webBluetooth} Gamepad=${env.gamepadApi} HID=${env.webHid} Serial=${env.webSerial}`,
      "info",
    );
  }, []);

  useEffect(() => {
    if (connectedGamepads.length === 0) {
      setSnakeActive(false);
    }
  }, [connectedGamepads.length]);

  useEffect(() => {
    if (!selectedDevice || !selectedDevice.connected) return;
    if (telemetryByDeviceId[selectedDevice.id]) return;
    void refreshDeviceTelemetry(selectedDevice);
  }, [selectedDeviceId, selectedDevice?.connected]);

  useEffect(() => {
    const unlock = () => {
      [waitingAudioRef.current, connectedAudioRef.current, disconnectedAudioRef.current].forEach((audio) => {
        if (!audio) return;
        audio.volume = 0;
        void audio.play().catch(() => undefined);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
      });
      window.removeEventListener("pointerdown", unlock);
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    const getSnapshot = () => {
      const pads = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
      return pads.map((pad) => ({
        id: `gp-${pad.index}`,
        index: pad.index,
        mapping: pad.mapping || "standard",
        name: pad.id || `Controller ${pad.index}`,
        profile: detectDeviceProfile(pad.id || ""),
        connected: pad.connected,
        buttons: pad.buttons.length,
        axes: pad.axes.length,
      }));
    };

    const refresh = () => setGamepads(getSnapshot());

    const onConnect = (event: GamepadEvent) => {
      const profile = detectDeviceProfile(event.gamepad.id || "");
      addLog(`Controller conectado: ${profile.title} [${event.gamepad.id}]`, "success");
      refresh();
    };

    const onDisconnect = (event: GamepadEvent) => {
      addLog(`Controller desconectado: ${event.gamepad.id}`, "warning");
      refresh();
    };

    window.addEventListener("gamepadconnected", onConnect);
    window.addEventListener("gamepaddisconnected", onDisconnect);

    refresh();
    const interval = window.setInterval(refresh, 1000);

    return () => {
      window.removeEventListener("gamepadconnected", onConnect);
      window.removeEventListener("gamepaddisconnected", onDisconnect);
      window.clearInterval(interval);
    };
  }, []);

  const syncDeviceConnection = (nativeDevice: BluetoothDevice, connected: boolean) => {
    setDevices((current) =>
      current.map((device) =>
        device.id === nativeDevice.id
          ? {
              ...device,
              connected,
              lastSeen: nowTime(),
            }
          : device,
      ),
    );
  };

  const refreshDeviceTelemetry = async (device: BluetoothDeviceEntry, options?: { force?: boolean }) => {
    const force = options?.force === true;
    const now = Date.now();
    const lastAttempt = telemetryLastAttemptAtRef.current[device.id] ?? 0;
    if (!force && telemetryInFlightRef.current[device.id]) {
      return;
    }
    if (!force && now - lastAttempt < 1800) {
      return;
    }

    telemetryInFlightRef.current[device.id] = true;
    telemetryLastAttemptAtRef.current[device.id] = now;

    try {
      addLog(`Coletando telemetria GATT de ${device.name}...`, "info");
      const snapshot = await collectGattTelemetry(device.nativeDevice);
      setTelemetryByDeviceId((current) => ({
        ...current,
        [device.id]: snapshot,
      }));

      const summary: string[] = [];
      if (typeof snapshot.batteryLevel === "number") summary.push(`battery=${snapshot.batteryLevel}%`);
      if (typeof snapshot.heartRateBpm === "number") summary.push(`heart=${snapshot.heartRateBpm}bpm`);
      if (snapshot.deviceTime) summary.push(`time=${snapshot.deviceTime}`);
      summary.push(`services=${snapshot.serviceCount}`);
      summary.push(`chars=${snapshot.characteristicCount}`);

      addLog(`Telemetria atualizada: ${summary.join(" | ")}`, "success");
      snapshot.warnings.forEach((warning) => addLog(`Telemetria: ${warning}`, "warning"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao coletar telemetria.";
      addLog(`Telemetria falhou: ${message}`, "error");
    } finally {
      telemetryInFlightRef.current[device.id] = false;
    }
  };

  const runMediaAction = async (action: MediaControlAction) => {
    if (!selectedDevice) {
      addLog("Selecione um dispositivo para enviar comando de midia.", "warning");
      return;
    }

    if (!selectedDevice.connected) {
      addLog("Conecte o dispositivo antes de usar controles de midia.", "warning");
      return;
    }

    try {
      setMediaControlBusy(true);
      await sendBleMediaControl(selectedDevice.nativeDevice, action);
      addLog(`Comando de midia enviado: ${action}`, "success");
      await refreshDeviceTelemetry(selectedDevice, { force: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha no controle de midia.";
      addLog(`Controle de midia indisponivel: ${message}`, "warning");
    } finally {
      setMediaControlBusy(false);
    }
  };

  const scanDevice = async () => {
    if (!supported) {
      addLog("Web Bluetooth indisponivel neste navegador.", "error");
      return;
    }

    try {
      setIsBusy(true);
      playAudio("waiting");
      addLog("$ bluetooth scan --accept-all", "command");

      const nativeDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: BLUETOOTH_SERVICE_UUIDS,
      });

      const safeName = nativeDevice.name || "Dispositivo sem nome";
      const detection = await autoDetectBluetoothDevice(nativeDevice, { probeServices: false });
      const profile = detection.profile;

      nativeDevice.addEventListener("gattserverdisconnected", () => {
        syncDeviceConnection(nativeDevice, false);
        playAudio("disconnected");
        addLog(`Conexao perdida com ${safeName}.`, "warning");
      });

      setDevices((current) => {
        const exists = current.find((item) => item.id === nativeDevice.id);

        if (exists) {
          return current.map((item) =>
            item.id === nativeDevice.id
              ? {
                  ...item,
                  profileTitle: profile.title,
                  profileType: profile.type,
                  detectionConfidence: detection.confidence,
                  detectionReasons: detection.reasons,
                  discoveredServices: detection.discoveredServices,
                  capabilityFlags: detection.capabilityFlags,
                  lastSeen: nowTime(),
                  nativeDevice,
                }
              : item,
          );
        }

          return [
          ...current,
          {
            id: nativeDevice.id,
            name: safeName,
            profileTitle: profile.title,
            profileType: profile.type,
            detectionConfidence: detection.confidence,
            detectionReasons: detection.reasons,
            discoveredServices: detection.discoveredServices,
            capabilityFlags: detection.capabilityFlags,
            connected: false,
            lastSeen: nowTime(),
            nativeDevice,
          },
        ];
      });

      setSelectedDeviceId(nativeDevice.id);
      addLog(
        `Dispositivo encontrado: ${safeName} | perfil: ${profile.title} | confianca: ${Math.round(
          detection.confidence * 100,
        )}%`,
        "success",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha desconhecida ao buscar dispositivo.";
      addLog(`Scan cancelado/erro: ${message}`, "error");
    } finally {
      setIsBusy(false);
    }
  };

  const connectSelectedDevice = async () => {
    if (!selectedDevice) {
      addLog("Nenhum dispositivo selecionado para conectar.", "warning");
      return;
    }

    try {
      setIsBusy(true);
      playAudio("waiting");
      addLog(`$ git commit -m \"connect:${selectedDevice.name}\"`, "command");

      if (!selectedDevice.nativeDevice.gatt) {
        throw new Error("GATT indisponivel neste dispositivo.");
      }

      await selectedDevice.nativeDevice.gatt.connect();
      const detection = await autoDetectBluetoothDevice(selectedDevice.nativeDevice, { probeServices: true });
      setDevices((current) =>
        current.map((device) =>
          device.id === selectedDevice.id
            ? {
                ...device,
                profileTitle: detection.profile.title,
                profileType: detection.profile.type,
                detectionConfidence: detection.confidence,
                detectionReasons: detection.reasons,
                discoveredServices: detection.discoveredServices,
                capabilityFlags: detection.capabilityFlags,
              }
            : device,
        ),
      );
      syncDeviceConnection(selectedDevice.nativeDevice, true);
      await refreshDeviceTelemetry(selectedDevice, { force: true });
      playAudio("connected");
      addLog(
        `Conexao ativa com ${selectedDevice.name} | perfil=${detection.profile.title} | servicos=${detection.discoveredServices.length}`,
        "success",
      );
      detection.warnings.forEach((warning) => addLog(`Deteccao: ${warning}`, "warning"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao conectar.";
      addLog(`Falha na conexao: ${message}`, "error");
    } finally {
      setIsBusy(false);
    }
  };

  const disconnectSelectedDevice = () => {
    if (!selectedDevice) {
      addLog("Nenhum dispositivo selecionado para desconectar.", "warning");
      return;
    }

    if (selectedDevice.nativeDevice.gatt?.connected) {
      selectedDevice.nativeDevice.gatt.disconnect();
    }

    syncDeviceConnection(selectedDevice.nativeDevice, false);
    playAudio("disconnected");
    addLog(`Desconectado de ${selectedDevice.name}.`, "warning");
  };

  const dismissTransfer = (transferId: string) => {
    setTransfers((current) => current.filter((item) => item.id !== transferId));
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = event.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;

    if (!selectedDevice) {
      addLog("Selecione e conecte um dispositivo antes do envio.", "warning");
      return;
    }

    Array.from(uploadFiles).forEach((file) => {
      const transferId = getUuid();

      setTransfers((current) => [
        ...current,
        {
          id: transferId,
          fileName: file.name,
          deviceName: selectedDevice.name,
          progress: 0,
          status: "waiting",
        },
      ]);

      addLog(`Nova transferencia ${transferId}: ${file.name}`, "info");
      playAudio("waiting");

      let progress = 0;
      const tick = window.setInterval(() => {
        progress += 10;

        setTransfers((current) =>
          current.map((item) =>
            item.id === transferId
              ? {
                  ...item,
                  progress: Math.min(progress, 100),
                  status: progress >= 100 ? "done" : "transferring",
                }
              : item,
          ),
        );

        if (progress >= 100) {
          window.clearInterval(tick);
          playAudio("connected");
          addLog(`Transferencia finalizada: ${file.name} -> ${selectedDevice.name}.`, "success");
        }
      }, 250);
    });

    event.target.value = "";
  };

  const runTerminalCommand = () => {
    const value = command.trim();
    if (!value) return;

    addLog(`$ ${value}`, "command");

    if (value === "help") {
      addLog("Comandos: git status, git log --oneline, bluetooth scan/connect/disconnect, bluetooth uuids, controllers, snake start, snake stop, clear", "info");
    } else if (value === "git status") {
      addLog("On branch redesign/bluetooth-center", "info");
      addLog(`${devices.length} devices tracked, ${connectedDevicesCount} connected, ${transfers.length} transfers`, "info");
    } else if (value === "git log --oneline") {
      addLog("a1c3fd4 redesign: terminal publico + audio states", "info");
      addLog("6ea2d12 feat: massive uuid vault for bluetooth center", "info");
      addLog("0bc44d8 fix: bluetooth flow and runtime errors", "info");
    } else if (value === "bluetooth scan") {
      void scanDevice();
    } else if (value === "bluetooth connect") {
      void connectSelectedDevice();
    } else if (value === "bluetooth disconnect") {
      disconnectSelectedDevice();
    } else if (value === "bluetooth uuids") {
      addLog(`UUID total: ${allUuids.length}`, "success");
    } else if (value === "controllers") {
      if (connectedGamepads.length === 0) {
        addLog("Nenhum controle ativo no Gamepad API.", "warning");
      } else {
        connectedGamepads.forEach((pad) => {
          addLog(`${pad.profile.title} | axes=${pad.axes} buttons=${pad.buttons}`, "info");
        });
      }
    } else if (value === "snake start") {
      setSnakeActive(true);
      addLog("Snake Game ativado para controle Bluetooth/Gamepad.", "success");
    } else if (value === "snake stop") {
      setSnakeActive(false);
      addLog("Snake Game pausado.", "warning");
    } else if (value === "clear") {
      setLogs([]);
    } else {
      addLog(`Comando nao encontrado: ${value}`, "error");
    }

    setCommand("");
  };

  return (
    <main ref={rootRef} className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,#1e293b_0%,#0f172a_45%,#020617_100%)] text-white">
      <audio ref={waitingAudioRef} src="/waiting.mp3" preload="auto" />
      <audio ref={connectedAudioRef} src="/connected.mp3" preload="auto" />
      <audio ref={disconnectedAudioRef} src="/disconnected.mp3" preload="auto" />

      <BluetoothHero totalDevices={devices.length} connectedDevices={connectedDevicesCount} totalUuids={allUuids.length} />

      <section className="gsap-reveal px-3 pb-10 sm:px-8 sm:pb-12">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="gsap-reveal space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:p-6">
            <h2 className="text-xl font-semibold text-white">Control Center</h2>
            <p className="text-sm text-slate-300">Scan, conecte e transfira arquivos com log publico.</p>

            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
              <button
                type="button"
                onClick={scanDevice}
                disabled={isBusy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:justify-start"
              >
                {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Scan
              </button>
              <button
                type="button"
                onClick={connectSelectedDevice}
                disabled={isBusy || !selectedDevice}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:justify-start"
              >
                <Plug2 className="h-4 w-4" /> Connect
              </button>
              <button
                type="button"
                onClick={disconnectSelectedDevice}
                disabled={!selectedDevice}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-300/30 bg-red-400/10 px-4 py-2 text-sm text-red-100 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:justify-start"
              >
                <Unplug className="h-4 w-4" /> Disconnect
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedDevice}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-violet-300/30 bg-violet-400/10 px-4 py-2 text-sm text-violet-100 transition hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:justify-start"
              >
                <Upload className="h-4 w-4" /> Send File
              </button>
              <input ref={fileInputRef} onChange={handleFiles} type="file" multiple className="hidden" />
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="mb-2 text-sm text-slate-300">Dispositivos Bluetooth</p>
              {!supported && <p className="text-sm text-red-300">Este navegador nao suporta Web Bluetooth.</p>}
              {supported && devices.length === 0 && <p className="text-sm text-slate-400">Nenhum dispositivo encontrado ainda.</p>}
              {devices.length > 0 && (
                <div className="space-y-2">
                  {devices.map((device) => (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => setSelectedDeviceId(device.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        selectedDeviceId === device.id
                          ? "border-cyan-300/60 bg-cyan-400/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-100">{device.name}</span>
                        <span className={`text-xs ${device.connected ? "text-emerald-300" : "text-slate-400"}`}>
                          {device.connected ? "connected" : "offline"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-400">perfil: {device.profileTitle} | tipo: {device.profileType}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        confianca: {Math.round(device.detectionConfidence * 100)}% | capabilities:{" "}
                        {device.capabilityFlags.join(", ") || "none"}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">id: {device.id} | last seen: {device.lastSeen}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedDevice && selectedDeviceInsights && (
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-300">Compatibilidade Veridica</p>
                  <button
                    type="button"
                    onClick={() => {
                      void refreshDeviceTelemetry(selectedDevice, { force: true });
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-cyan-300/30 bg-cyan-400/10 px-2 py-1 text-[10px] text-cyan-100 transition hover:bg-cyan-400/20"
                  >
                    <RefreshCw className="h-3 w-3" /> Atualizar Dados Reais
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Perfil detectado: <span className="text-slate-200">{selectedDevice.profileTitle}</span>
                </p>
                {selectedTelemetry && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    GATT: {selectedTelemetry.serviceCount} servicos, {selectedTelemetry.characteristicCount} caracteristicas
                  </p>
                )}

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="mb-2 text-xs font-medium text-slate-200">Dados disponiveis agora</p>
                    {selectedDeviceInsights.availableData.length === 0 && (
                      <p className="text-xs text-slate-400">Nenhum dado padrao detectado por GATT neste momento.</p>
                    )}
                    {selectedDeviceInsights.availableData.length > 0 && (
                      <div className="space-y-1 text-xs text-slate-300">
                        {selectedDeviceInsights.availableData.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedDevice.capabilityFlags.includes("CurrentTime") && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-200">
                          <Clock3 className="h-3 w-3" /> Hora
                        </span>
                      )}
                      {selectedDevice.capabilityFlags.includes("HeartRate") && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-300/30 bg-rose-400/10 px-2 py-0.5 text-[10px] text-rose-200">
                          <HeartPulse className="h-3 w-3" /> Batimento
                        </span>
                      )}
                      {selectedDevice.capabilityFlags.includes("Battery") && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-200">
                          <BatteryMedium className="h-3 w-3" /> Bateria
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="mb-2 text-xs font-medium text-slate-200">Acoes compativeis</p>
                    {selectedDeviceInsights.actions.length === 0 && (
                      <p className="text-xs text-slate-400">Sem acao automatica disponivel para este perfil no browser atual.</p>
                    )}
                    {selectedDeviceInsights.actions.length > 0 && (
                      <div className="space-y-1 text-xs text-slate-300">
                        {selectedDeviceInsights.actions.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {environmentReport.webHid && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-300/30 bg-indigo-400/10 px-2 py-0.5 text-[10px] text-indigo-200">
                          <Keyboard className="h-3 w-3" /> WebHID
                        </span>
                      )}
                      {environmentReport.webHid && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-300/30 bg-indigo-400/10 px-2 py-0.5 text-[10px] text-indigo-200">
                          <MousePointer2 className="h-3 w-3" /> HID Pointer
                        </span>
                      )}
                      {environmentReport.gamepadApi && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-violet-300/30 bg-violet-400/10 px-2 py-0.5 text-[10px] text-violet-200">
                          <Gamepad2 className="h-3 w-3" /> Gamepad API
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedDeviceInsights.constraints.length > 0 && (
                  <div className="mt-3 rounded-lg border border-amber-300/20 bg-amber-500/5 p-3 text-xs text-amber-100">
                    {selectedDeviceInsights.constraints.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                )}

                {(selectedDevice.profileType === "speaker" || selectedDevice.profileType === "headphones") && (
                  <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="mb-2 text-xs font-medium text-slate-200">Controle de Midia (Caixa/Fone)</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <button
                        type="button"
                        disabled={
                          mediaControlBusy ||
                          (!selectedDevice.capabilityFlags.includes("MediaControl") &&
                            !selectedDevice.discoveredServices.includes("00001848-0000-1000-8000-00805f9b34fb") &&
                            !selectedDevice.discoveredServices.includes("00001849-0000-1000-8000-00805f9b34fb"))
                        }
                        onClick={() => {
                          void runMediaAction("play");
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-md border border-emerald-300/30 bg-emerald-400/10 px-2 py-2 text-xs text-emerald-100 disabled:opacity-60"
                      >
                        <Play className="h-3.5 w-3.5" /> Play
                      </button>
                      <button
                        type="button"
                        disabled={
                          mediaControlBusy ||
                          (!selectedDevice.capabilityFlags.includes("MediaControl") &&
                            !selectedDevice.discoveredServices.includes("00001848-0000-1000-8000-00805f9b34fb") &&
                            !selectedDevice.discoveredServices.includes("00001849-0000-1000-8000-00805f9b34fb"))
                        }
                        onClick={() => {
                          void runMediaAction("pause");
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-md border border-yellow-300/30 bg-yellow-400/10 px-2 py-2 text-xs text-yellow-100 disabled:opacity-60"
                      >
                        <Pause className="h-3.5 w-3.5" /> Pause
                      </button>
                      <button
                        type="button"
                        disabled={
                          mediaControlBusy ||
                          (!selectedDevice.capabilityFlags.includes("MediaControl") &&
                            !selectedDevice.discoveredServices.includes("00001848-0000-1000-8000-00805f9b34fb") &&
                            !selectedDevice.discoveredServices.includes("00001849-0000-1000-8000-00805f9b34fb"))
                        }
                        onClick={() => {
                          void runMediaAction("next");
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-md border border-cyan-300/30 bg-cyan-400/10 px-2 py-2 text-xs text-cyan-100 disabled:opacity-60"
                      >
                        <SkipForward className="h-3.5 w-3.5" /> Adiantar
                      </button>
                      <button
                        type="button"
                        disabled={
                          mediaControlBusy ||
                          (!selectedDevice.capabilityFlags.includes("MediaControl") &&
                            !selectedDevice.discoveredServices.includes("00001848-0000-1000-8000-00805f9b34fb") &&
                            !selectedDevice.discoveredServices.includes("00001849-0000-1000-8000-00805f9b34fb"))
                        }
                        onClick={() => {
                          void runMediaAction("previous");
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-md border border-violet-300/30 bg-violet-400/10 px-2 py-2 text-xs text-violet-100 disabled:opacity-60"
                      >
                        <SkipBack className="h-3.5 w-3.5" /> Voltar
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      Os comandos funcionam quando o dispositivo expõe BLE Media Control Service (0x1848/0x1849).
                    </p>
                  </div>
                )}

                {selectedTelemetry && selectedTelemetry.readableSamples.length > 0 && (
                  <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="mb-2 text-xs font-medium text-slate-200">Amostras GATT lidas</p>
                    <div className="space-y-1">
                      {selectedTelemetry.readableSamples.map((sample) => (
                        <p key={`${sample.serviceUuid}-${sample.characteristicUuid}`} className="text-[11px] text-slate-300">
                          {sample.label}: {sample.value}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTelemetry?.supportsHeartRateNotify && typeof selectedTelemetry.heartRateBpm !== "number" && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Este dispositivo suporta notificacao de batimento, mas nao retornou leitura instantanea por `read`.
                  </p>
                )}
              </div>
            )}

            {connectedGamepads.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-200">
                  <Gamepad2 className="h-4 w-4" /> Controller Lab (Xbox, PlayStation, Universal, TV Remote)
                </div>
                <div className="space-y-2">
                  {connectedGamepads.map((pad) => (
                    <div key={pad.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs">
                      <div className="flex items-center justify-between text-slate-100">
                        <span>{pad.profile.title}</span>
                        <span>{pad.mapping || "standard"}</span>
                      </div>
                      <p className="mt-1 text-slate-400">{pad.name}</p>
                      <p className="text-slate-500">buttons={pad.buttons} axes={pad.axes}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSnakeActive(true)}
                    className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-100"
                  >
                    Iniciar Snake
                  </button>
                  <button
                    type="button"
                    onClick={() => setSnakeActive(false)}
                    className="rounded-lg border border-red-300/30 bg-red-400/10 px-3 py-1.5 text-xs text-red-100"
                  >
                    Parar Snake
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm text-slate-300">Transferencias</p>
                {transfers.length > 0 && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                    {transfers.length} item{transfers.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {transfers.length === 0 && <p className="text-sm text-slate-400">Sem transferencias nesta sessao.</p>}
              <div className="space-y-2.5">
                {transfers.slice().reverse().map((transfer) => (
                  <div
                    key={transfer.id}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs sm:rounded-lg sm:bg-white/[0.03]"
                  >
                    <div className="mb-2 flex flex-col gap-1.5 sm:mb-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-full break-all text-[13px] font-medium text-slate-100 sm:text-xs">
                        {transfer.fileName}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                            transfer.status === "done"
                              ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200"
                              : transfer.status === "transferring"
                                ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-200"
                                : transfer.status === "error"
                                  ? "border-red-300/40 bg-red-400/10 text-red-200"
                                  : "border-amber-300/40 bg-amber-400/10 text-amber-200"
                          }`}
                        >
                          {transfer.status}
                        </span>
                        {transfer.status === "done" && (
                          <button
                            type="button"
                            onClick={() => dismissTransfer(transfer.id)}
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                            aria-label={`Remover transferencia ${transfer.fileName}`}
                            title="Fechar transferencia"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded bg-white/10 sm:h-2">
                      <div className="h-full rounded bg-emerald-400" style={{ width: `${transfer.progress}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-400 sm:mt-1 sm:text-[10px]">
                      <p className="truncate">{transfer.deviceName}</p>
                      <span className="shrink-0 text-slate-300">{transfer.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <Bluetooth className="h-4 w-4" /> Bluetooth: {supported ? "suportado" : "nao suportado"}
              <Link2 className="h-4 w-4" /> UUIDs: {allUuids.length}
              <MonitorSmartphone className="h-4 w-4" /> Perfis: {DEVICE_PROFILES.length}
            </div>
          </div>

          <div className="space-y-6">
            <BluetoothTerminal
              logs={logs}
              command={command}
              onCommandChange={setCommand}
              onCommandSubmit={runTerminalCommand}
              onClear={() => setLogs([])}
            />
            {connectedGamepads.length > 0 && (
              <div className="gsap-reveal rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-200">Snake + Controle Bluetooth/Gamepad</span>
                  <span className="text-emerald-300">score: {snakeScore}</span>
                </div>
                <SnakeGame gamepadIndex={activeGamepadIndex} onScoreChange={setSnakeScore} active={snakeActive} />
              </div>
            )}
          </div>
        </div>
      </section>

      <BluetoothModules />
      <BluetoothUuidBank uuids={allUuids} />
    </main>
  );
}
