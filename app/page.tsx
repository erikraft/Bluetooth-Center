"use client"

const NOTIFY_CHAR_UUID = '4dd9a968-c64b-41cd-822c-b9e723582c4e';
  // Recepção real de arquivo via BLE
  const receiveFileOverBluetooth = async (device: BluetoothDevice) => {
    setSuccess('Aguardando envio do arquivo via Bluetooth...');
if (audioRefWaiting.current) {
  try {
    audioRefWaiting.current.play();
  } catch {
    const playOnClick = () => {
      if (audioRefWaiting.current) audioRefWaiting.current.play().catch(() => {});
      document.removeEventListener('click', playOnClick);
    };
    document.addEventListener('click', playOnClick, { once: true });
  }
}
    setError(null);
    try {
      // Solicita o dispositivo Bluetooth novamente para garantir acesso ao GATT
      // @ts-ignore
      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
        filters: [{ name: device.name }],
        optionalServices: [SERVICE_UUID]
      });
      // @ts-ignore
      const server = await bluetoothDevice.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const notifyChar = await service.getCharacteristic(NOTIFY_CHAR_UUID);

      // Handler para cada notificação recebida
      const onNotification = (event: any) => {
        const value = event.target.value;
        const chunk = new Uint8Array(value.buffer);

        // Protocolo simples: primeiros 8 bytes = tamanho total, próximos 2 bytes = nome tamanho, depois nome, depois dados
        if (receivedBytes === 0) {
          expectedSize = new DataView(chunk.buffer).getUint32(0, true);
          const nameLen = new DataView(chunk.buffer).getUint16(4, true);
          fileName = new TextDecoder().decode(chunk.slice(6, 6 + nameLen));
          receivedChunks.push(chunk.slice(6 + nameLen));
          receivedBytes += chunk.length - (6 + nameLen);
          setFiles((prev: FileTransfer[]) => prev.map((f) => f.id === fileTransferId ? { ...f, name: fileName, size: expectedSize } : f));
        } else {
          receivedChunks.push(chunk);
          receivedBytes += chunk.length;
        }
        // Atualiza progresso
        setFiles((prev: FileTransfer[]) => prev.map((f) => f.id === fileTransferId ? { ...f, progress: Math.round((receivedBytes / (expectedSize || 1)) * 100) } : f));

        // Fim da transferência
        if (expectedSize > 0 && receivedBytes >= expectedSize) {
          notifyChar.removeEventListener('characteristicvaluechanged', onNotification);
          notifyChar.stopNotifications();
          const fileBlob = new Blob(receivedChunks, { type: 'application/octet-stream' });
          if (typeof window !== "undefined") {
            const now = Date.now();
            setFiles((prev: FileTransfer[]) => prev.map((f) => f.id === fileTransferId ? { ...f, status: 'completed', endTime: new Date(now) } : f));
            setHistory((prev: TransferHistory[]) => [
              {
                id: `hist-${now}`,
                fileName,
                fileSize: expectedSize,
                deviceName: device.name,
                direction: 'receive',
                status: 'completed',
                timestamp: new Date(now),
                duration: Math.floor((now - startTime.getTime()) / 1000),
              },
              ...prev
            ]);
            setSuccess(`Arquivo recebido: ${fileName}`);
            // Salva o blob para download
            const url = URL.createObjectURL(fileBlob);
            setFiles((prev: FileTransfer[]) => prev.map((f) => f.id === fileTransferId ? { ...f, downloadUrl: url } : f));
          }
        }
      };

      await notifyChar.startNotifications();
      notifyChar.addEventListener('characteristicvaluechanged', onNotification);
    } catch (err: any) {
      setError('Erro ao receber arquivo via Bluetooth: ' + (err instanceof Error ? err.message : String(err)));
      setTimeout(() => setError(null), 5000);
    }
  };

  // Função auxiliar para criar um manipulador de notificações BLE
const createNotificationHandler = (
  notifyChar: BluetoothRemoteGATTCharacteristic,
  fileTransferId: string,
  setFiles: React.Dispatch<React.SetStateAction<FileTransfer[]>>,
  setHistory: React.Dispatch<React.SetStateAction<TransferHistory[]>>,
  setSuccess: (message: string) => void,
  device: BluetoothDevice
) => {
  let receivedChunks: Uint8Array[] = [];
  let receivedBytes = 0;
  let expectedSize = 0;
  let fileName = typeof window !== "undefined" ? `arquivo-recebido-${Date.now()}` : "arquivo-recebido";
  const startTime = typeof window !== "undefined" ? new Date() : new Date(0);

  const onNotification = (event: any) => {
    const value = event.target.value;
    const chunk = new Uint8Array(value.buffer);

    if (receivedBytes === 0) {
      const parsed = parseInitialChunk(chunk, fileTransferId, setFiles);
      expectedSize = parsed.expectedSize;
      fileName = parsed.fileName;
      receivedChunks.push(parsed.remainingChunk);
      receivedBytes += parsed.remainingChunk.length;
    } else {
      receivedChunks.push(chunk);
      receivedBytes += chunk.length;
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileTransferId
          ? { ...f, progress: Math.round((receivedBytes / (expectedSize || 1)) * 100) }
          : f
      )
    );

    if (expectedSize > 0 && receivedBytes >= expectedSize && typeof window !== "undefined") {
      notifyChar.removeEventListener('characteristicvaluechanged', onNotification);
      notifyChar.stopNotifications();
      const fileBlob = new Blob(receivedChunks, { type: 'application/octet-stream' });
      const now = Date.now();
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileTransferId
            ? { ...f, status: 'completed', endTime: new Date(now), downloadUrl: URL.createObjectURL(fileBlob) }
            : f
        )
      );
      setHistory((prev) => [
        {
          id: `hist-${now}`,
          fileName,
          fileSize: expectedSize,
          deviceName: device.name,
          direction: 'receive',
          status: 'completed',
          timestamp: new Date(now),
          duration: Math.floor((now - startTime.getTime()) / 1000),
        },
        ...prev
      ]);
      setSuccess(`Arquivo recebido: ${fileName}`);
    }
  };

  return onNotification;
};

  // Handler para notificações BLE, tipado para evitar erro 'never'
  const onNotification = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;
    const chunk = new Uint8Array(value.buffer);

    // Restante do código do handler...
  };
  // Adiciona botão para receber arquivo na UI de dispositivos conectados (exemplo para laptop/phone)
  // (Você pode adaptar para outros tipos de dispositivo se desejar)
  // ...
  // No renderDeviceSpecificContent, adicione:
  // ...
  // Exemplo para laptop/phone:
  // Dentro do case "laptop":
  // <Button onClick={() => receiveFileOverBluetooth(device)} size="sm" className="w-full mt-2" variant="outline">
  //   <Download className="w-3 h-3 mr-1" /> Receber Arquivo
  // </Button>
  // ...



import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Bluetooth,
  Upload,
  Download,
  File,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  X,
  Settings,
  History,
  Info,
  Search,
  RefreshCw,
  Smartphone,
  Laptop,
  Headphones,
  Speaker,
  Watch,
  Gamepad2,
  Camera,
  Printer,
  Mouse,
  Keyboard,
  Monitor,
  Signal,
Battery,
Tv,
  Zap,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Heart,
  Activity,
  MessageSquare,
  Phone,
  Music,
  Edit3,
  Shield,
  Globe,
} from "lucide-react"


import { SnakeGame } from "@/components/snake-game"
import BleExplorer from "../ble-explorer"
import PwaInstallButton from "../components/pwa-install-button"

interface BluetoothDevice {
  id: string
  name: string
  connected: boolean
  type:
    | "phone"
    | "laptop"
    | "headphones"
    | "speaker"
    | "watch"
    | "gamepad"
    | "camera"
    | "printer"
    | "mouse"
    | "keyboard"
    | "monitor"
    | "tv"
    | "unknown"
  batteryLevel?: number
  signalStrength: number
  lastSeen: Date
  paired: boolean
  services: string[]
  capabilities?: string[]
  // Campos de saúde para relógios
  heartRate?: number
  steps?: number
  calories?: number
  notifications?: number
}

interface FileTransfer {
  id: string
  name: string
  size: number
  progress: number
  status: "pending" | "transferring" | "completed" | "error" | "paused"
  deviceId: string
  deviceName: string
  direction: "send" | "receive"
  startTime: Date
  endTime?: Date
  speed?: number
  downloadUrl?: string
}

interface TransferHistory {
  id: string
  fileName: string
  fileSize: number
  deviceName: string
  direction: "send" | "receive"
  status: "completed" | "failed"
  timestamp: Date
  duration: number
}

interface MusicTrack {
  id: string
  title: string
  artist: string
  duration: number
  currentTime: number
}

interface WatchData {
  heartRate: number
  steps: number
  calories: number
  notifications: number
}

interface GamepadState {
  id: string
  index: number
  connected: boolean
  buttons: boolean[]
  axes: number[]
  vibrationActuator?: GamepadHapticActuator
  timestamp: number
}

interface MiniGame {
  id: string
  name: string
  description: string
  active: boolean
  score: number
}

// Corrige escopo de updateInstallStatus para uso global no componente
function updateInstallStatus(setIsInstalled: (v: boolean) => void) {
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://"))
  setIsInstalled(isStandalone)
}

export default function BluetoothCenter() {
  // Audio feedback refs - declarado uma única vez no início do componente
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioRefWaiting = useRef<HTMLAudioElement>(null);
  const audioRefDisconnected = useRef<HTMLAudioElement>(null);
  // Garante renderização client-side para evitar hydration mismatch
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // Estado para o nome do sistema operacional detectado
  const [osName, setOsName] = useState("Desconhecido");
  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setOsName(
        (navigator as any).userAgentData?.platform ||
        navigator.platform ||
        "Desconhecido"
      );
    }
  }, []);

  // Desbloqueia os áudios no primeiro clique do usuário
  useEffect(() => {
    if (typeof window === "undefined") return;
    const unlockAudio = () => {
      try {
        if (audioRef.current) {
          audioRef.current.volume = 0;
          audioRef.current.play().catch(() => {});
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 1;
        }
        if (audioRefDisconnected.current) {
          audioRefDisconnected.current.volume = 0;
          audioRefDisconnected.current.play().catch(() => {});
          audioRefDisconnected.current.pause();
          audioRefDisconnected.current.currentTime = 0;
          audioRefDisconnected.current.volume = 1;
        }
        if (audioRefWaiting.current) {
          audioRefWaiting.current.volume = 0;
          audioRefWaiting.current.play().catch(() => {});
          audioRefWaiting.current.pause();
          audioRefWaiting.current.currentTime = 0;
          audioRefWaiting.current.volume = 1;
        }
      } catch {}
      document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('click', unlockAudio, { once: true });
    return () => document.removeEventListener('click', unlockAudio);
  }, []);
  const [isOnline, setIsOnline] = useState(true)
  const [bluetoothSupported, setBluetoothSupported] = useState(true)
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true)
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null)

  // Clear device cache when Bluetooth is turned off
  useEffect(() => {


    if (!bluetoothEnabled) {
      setDevices([])
      setDeviceCache([])
      setCustomDeviceNames({})
      try {
        localStorage.removeItem("bluetoothDeviceCache")
        localStorage.removeItem("customDeviceNames")
      } catch (error) {
        console.error("Erro ao limpar cache ao desligar Bluetooth:", error)
      }
    }
  }, [bluetoothEnabled])
  const [devices, setDevices] = useState<BluetoothDevice[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [files, setFiles] = useState<FileTransfer[]>([])
  const [history, setHistory] = useState<TransferHistory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("devices")
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  // Detecta se está rodando como PWA (standalone)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkStandalone = () => {
        const standalone =
          window.matchMedia("(display-mode: standalone)").matches ||
          window.matchMedia("(display-mode: minimal-ui)").matches ||
          window.matchMedia("(display-mode: fullscreen)").matches ||
          (window.navigator as any).standalone === true ||
          document.referrer.includes("android-app://");
        setIsStandalone(standalone);
      };
      checkStandalone();
      window.addEventListener("resize", checkStandalone);
      window.addEventListener("orientationchange", checkStandalone);
      // Também escuta mudanças de display-mode
      const mqlStandalone = window.matchMedia("(display-mode: standalone)");
      const mqlMinimal = window.matchMedia("(display-mode: minimal-ui)");
      const mqlFullscreen = window.matchMedia("(display-mode: fullscreen)");
      mqlStandalone.addEventListener("change", checkStandalone);
      mqlMinimal.addEventListener("change", checkStandalone);
      mqlFullscreen.addEventListener("change", checkStandalone);
      return () => {
        window.removeEventListener("resize", checkStandalone);
        window.removeEventListener("orientationchange", checkStandalone);
        mqlStandalone.removeEventListener("change", checkStandalone);
        mqlMinimal.removeEventListener("change", checkStandalone);
        mqlFullscreen.removeEventListener("change", checkStandalone);
      };
    }
  }, []);

  // Music Player State
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [sourceApp, setSourceApp] = useState("Spotify Web Player")
  const [playlist] = useState<MusicTrack[]>([
    { id: "1", title: "Música Exemplo 1", artist: "Artista 1", duration: 180, currentTime: 0 },
    { id: "2", title: "Música Exemplo 2", artist: "Artista 2", duration: 240, currentTime: 0 },
    { id: "3", title: "Música Exemplo 3", artist: "Artista 3", duration: 200, currentTime: 0 },
  ])

  // Watch Data State
  const [watchData, setWatchData] = useState<WatchData>({
    heartRate: 72,
    steps: 8543,
    calories: 342,
    notifications: 3,
  })

  // Settings
  const [autoAcceptFiles, setAutoAcceptFiles] = useState(false)
  const [showNotifications, setShowNotifications] = useState(true)
  const [maxFileSize, setMaxFileSize] = useState(100) // MB
  const [deviceName, setDeviceName] = useState("Meu Dispositivo")

  // Gamepad/Controller State
  const [connectedGamepads, setConnectedGamepads] = useState<GamepadState[]>([])
  const [gamepadTesting, setGamepadTesting] = useState(false)
  const [miniGames] = useState<MiniGame[]>([
    { id: "snake", name: "Snake Game", description: "Jogo da cobrinha com controle", active: false, score: 0 },
    { id: "pong", name: "Pong", description: "Ping pong clássico", active: false, score: 0 },
    {
      id: "button-test",
      name: "Teste de Botões",
      description: "Teste todos os botões do controle",
      active: false,
      score: 0,
    },
  ])
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [gameScore, setGameScore] = useState(0)

  // Adicionar após os outros estados
  const [deviceCache, setDeviceCache] = useState<BluetoothDevice[]>([])
  const [customDeviceNames, setCustomDeviceNames] = useState<Record<string, string>>({})
  const [editingDeviceName, setEditingDeviceName] = useState<string | null>(null)
  const [tempDeviceName, setTempDeviceName] = useState("")

  // Adicionar após as outras funções utilitárias
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem("bluetoothDeviceCache", JSON.stringify(deviceCache))
      localStorage.setItem("customDeviceNames", JSON.stringify(customDeviceNames))
      localStorage.setItem("deviceName", deviceName)
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const cachedDevices = localStorage.getItem("bluetoothDeviceCache")
      const cachedNames = localStorage.getItem("customDeviceNames")
      const cachedDeviceName = localStorage.getItem("deviceName")

      if (cachedDevices) {
        const parsedDevices = JSON.parse(cachedDevices)
        setDeviceCache(parsedDevices)
        setDevices(parsedDevices)
      }

      if (cachedNames) {
        setCustomDeviceNames(JSON.parse(cachedNames))
      }

      if (cachedDeviceName) {
        setDeviceName(cachedDeviceName)
      }
    } catch (error) {
      console.error("Erro ao carregar do localStorage:", error)
    }
  }

  const getDisplayName = (device: BluetoothDevice) => {
    return customDeviceNames[device.id] || device.name
  }

  const updateDeviceName = (deviceId: string, newName: string) => {
    const updatedNames = { ...customDeviceNames, [deviceId]: newName }
    setCustomDeviceNames(updatedNames)

    // Atualizar também no cache
    const updatedCache = deviceCache.map((d) => (d.id === deviceId ? { ...d, name: newName } : d))
    setDeviceCache(updatedCache)

    // Salvar no localStorage
    try {
      localStorage.setItem("customDeviceNames", JSON.stringify(updatedNames))
      localStorage.setItem("bluetoothDeviceCache", JSON.stringify(updatedCache))
    } catch (error) {
      console.error("Erro ao salvar nome personalizado:", error)
    }
  }

  const saveDeviceToCache = (device: BluetoothDevice) => {
    const updatedCache = [...deviceCache]
    const existingIndex = updatedCache.findIndex((d) => d.id === device.id)

    if (existingIndex >= 0) {
      updatedCache[existingIndex] = { ...device, lastSeen: new Date() }
    } else {
      updatedCache.push(device)
    }

    setDeviceCache(updatedCache)

    try {
      localStorage.setItem("bluetoothDeviceCache", JSON.stringify(updatedCache))
    } catch (error) {
      console.error("Erro ao salvar dispositivo no cache:", error)
    }
  }

  useEffect(() => {
    const updateOnlineStatus = () => {
      const wasOffline = !isOnline
      setIsOnline(navigator.onLine)

      if (navigator.onLine && wasOffline) {
        setSuccess("Conexão restaurada! Sincronizando dados...")
        // Tentar sincronizar dados quando voltar online
        setTimeout(() => {
          setSuccess("Dados sincronizados com sucesso!")
          setTimeout(() => setSuccess(null), 3000)
        }, 2000)
      } else if (!navigator.onLine) {
        setError("Modo offline ativo - Todas as funcionalidades disponíveis")
        setTimeout(() => setError(null), 5000)
      }
    }

    // Verificar status inicial
    setIsOnline(navigator.onLine)

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    // Verificar suporte ao Bluetooth
    if (typeof navigator !== "undefined" && (navigator as any).bluetooth) {
      setBluetoothSupported(true)
    } else {
      setBluetoothSupported(false)
    }

    // PWA Install Events e listeners
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      if (!navigator.onLine) {
        setSuccess("App pode ser instalado mesmo offline! Clique em 'Instalar'");
        setTimeout(() => setSuccess(null), 5000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setSuccess("App instalado! Agora funciona 100% offline 🎉");
      setTimeout(() => setSuccess(null), 4000);
    };

    if (typeof window !== "undefined") {
      updateInstallStatus(setIsInstalled);
      setIsInstallable(!(
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://")
      ));

      // Listeners para mudanças de display-mode
      const mqlStandalone = window.matchMedia("(display-mode: standalone)");
      const mqlMinimal = window.matchMedia("(display-mode: minimal-ui)");
      const mqlFullscreen = window.matchMedia("(display-mode: fullscreen)");
      const updateStatus = () => updateInstallStatus(setIsInstalled);
      mqlStandalone.addEventListener("change", updateStatus);
      mqlMinimal.addEventListener("change", updateStatus);
      mqlFullscreen.addEventListener("change", updateStatus);

      // Primeira visita offline
      const isFirstVisit = !localStorage.getItem("bluetoothCenterVisited");
      if (isFirstVisit) {
        localStorage.setItem("bluetoothCenterVisited", "true");
        if (!navigator.onLine) {
          setSuccess("Bem-vindo! Este app funciona completamente offline 🚀");
          setTimeout(() => setSuccess(null), 5000);
        }
      }

      // Remover listeners ao desmontar
      return () => {
        mqlStandalone.removeEventListener("change", updateStatus);
        mqlMinimal.removeEventListener("change", updateStatus);
        mqlFullscreen.removeEventListener("change", updateStatus);
      };
    }

    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);
      window.addEventListener("appinstalled", handleAppInstalled as any);
    }

    // Criar elemento de áudio
    audioRef.current = new Audio("/connected.mp3")
    audioRefDisconnected.current = new Audio("/disconnected.mp3")
    audioRefWaiting.current = new Audio("/waiting.mp3")

    // Carregar dados salvos
    loadFromLocalStorage()



    // Gamepad detection
    const detectGamepads = () => {
      const gamepads = navigator.getGamepads()
      const connectedPads: GamepadState[] = []

      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i]
        if (gamepad) {
          connectedPads.push({
            id: gamepad.id,
            index: gamepad.index,
            connected: gamepad.connected,
            buttons: gamepad.buttons.map((button) => button.pressed),
            axes: Array.from(gamepad.axes),
            vibrationActuator: gamepad.vibrationActuator,
            timestamp: gamepad.timestamp,
          })
        }
      }

      setConnectedGamepads(connectedPads)
    }

    // Gamepad event listeners
    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log("Gamepad connected:", e.gamepad)
      setSuccess(`Controle conectado: ${e.gamepad.id}`)
      setTimeout(() => setSuccess(null), 3000)
      detectGamepads()
    }

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log("Gamepad disconnected:", e.gamepad)
      setSuccess("Controle desconectado")
      setTimeout(() => setSuccess(null), 3000)
      detectGamepads()
    }

    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("gamepadconnected", handleGamepadConnected as any)
      window.addEventListener("gamepaddisconnected", handleGamepadDisconnected as any)
    }

    // Gamepad polling
    const gamepadInterval = setInterval(detectGamepads, 100)


    // Scan automático ao carregar a página (apenas se online)
    const autoScan = async () => {
      if (typeof window === "undefined") return;
      // @ts-ignore
      if ((navigator as any).bluetooth && navigator.onLine) {
        try {
          // @ts-ignore
          const availability = await (navigator as any).bluetooth.getAvailability();
          if (availability) {
            // Tentar carregar dispositivos pareados automaticamente
            try {
              // @ts-ignore
              const devices = await (navigator as any).bluetooth.getDevices();
              devices.forEach((device: any) => {
                const deviceType = detectDeviceType(device.name || "");
                const newDevice: BluetoothDevice = {
                  id: device.id,
                  name: device.name || "Dispositivo Desconhecido",
                  connected: false,
                  type: deviceType,
                  signalStrength: Math.floor(Math.random() * 5) + 1,
                  lastSeen: null, // Corrigido para evitar hydration mismatch
                  paired: true,
                  services: ["basic_connection"],
                  capabilities: getDeviceCapabilities(deviceType),
                };

                setDevices((prev) => {
                  const exists = prev.find((d) => d.id === newDevice.id);
                  if (exists) return prev;
                  return [...prev, newDevice];
                });
              });

              if (devices.length > 0) {
                setSuccess(`${devices.length} dispositivo(s) pareado(s) carregado(s) automaticamente!`);
                setTimeout(() => setSuccess(null), 3000);
              }
            } catch (err) {
              console.log("Não foi possível carregar dispositivos pareados automaticamente");
            }
          }
        } catch (err) {
          console.log("Bluetooth não disponível para scan automático");
        }
      } else if (!navigator.onLine) {
        // Se offline, mostrar mensagem informativa
        setSuccess("Modo offline: Dispositivos salvos carregados do cache local");
        setTimeout(() => setSuccess(null), 4000);
      }
    };

    // Executar scan automático após 1 segundo (apenas no client)
    if (typeof window !== "undefined") {
      setTimeout(autoScan, 1000);
    }


    // Disconnect all connected devices on page unload (NÃO limpa localStorage)
    const handleBeforeUnload = () => {
      devices.forEach((device) => {
        if (device.connected) {
          try {
            disconnectDevice(device.id)
          } catch (error) {
            console.error("Erro ao desconectar dispositivo no unload:", error)
          }
        }
      })
      // Não limpar localStorage aqui!
    }

    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("beforeunload", handleBeforeUnload as any)
    }

    // Add pagehide event for better unload handling (NÃO limpa localStorage)
    const handlePageHide = () => {
      setDevices([])
      setDeviceCache([])
      // Não limpar localStorage aqui!
    }

    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("pagehide", handlePageHide as any)
    }

    return () => {
      if (typeof window !== "undefined" && typeof window.removeEventListener === "function") {
        window.removeEventListener("online", updateOnlineStatus as any)
        window.removeEventListener("offline", updateOnlineStatus as any)
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any)
        window.removeEventListener("appinstalled", handleAppInstalled as any)
        window.removeEventListener("gamepadconnected", handleGamepadConnected as any)
        window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected as any)
        window.removeEventListener("beforeunload", handleBeforeUnload as any)
        window.removeEventListener("pagehide", handlePageHide as any)
      }
      if (watchInterval) clearInterval(watchInterval)
      if (gamepadInterval) clearInterval(gamepadInterval)
    }
  }, [devices])

  // Play waiting.mp3 when there is at least one available but not paired device
  useEffect(() => {
    if (!audioRefWaiting.current) return

    const hasAvailableNotPaired = devices.some((d) => !d.connected && !d.paired)
    console.log('[AUDIO] waiting.mp3 | hasAvailableNotPaired:', hasAvailableNotPaired, '| devices:', devices);

    if (hasAvailableNotPaired) {
      try {
        audioRefWaiting.current.currentTime = 0
        const playPromise = audioRefWaiting.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('[AUDIO] waiting.mp3 reproduzido com sucesso');
            })
            .catch(() => {
              console.log('[AUDIO] waiting.mp3 bloqueado, aguardando clique do usuário');
              const playOnClick = () => {
                if (audioRefWaiting.current) {
                  audioRefWaiting.current.play().then(() => {
                    console.log('[AUDIO] waiting.mp3 reproduzido após clique');
                  }).catch(console.error)
                }
                document.removeEventListener('click', playOnClick)
              }
              document.addEventListener('click', playOnClick, { once: true })
            })
        }
      } catch (error) {
        console.error('[AUDIO] Erro ao reproduzir som waiting.mp3:', error)
      }
    } else {
      audioRefWaiting.current.pause()
      audioRefWaiting.current.currentTime = 0
    }
  }, [devices])


  const getDeviceIcon = (type: BluetoothDevice["type"]) => {
    const iconMap = {
      phone: Smartphone,
      laptop: Laptop,
      headphones: Headphones,
      speaker: Speaker,
      watch: Watch,
      gamepad: Gamepad2,
      camera: Camera,
      printer: Printer,
      mouse: Mouse,
      keyboard: Keyboard,
      monitor: Monitor,
      tv: Tv,
      unknown: Bluetooth,
    }
    return iconMap[type] || Bluetooth
  }

  const getDeviceCapabilities = (type: BluetoothDevice["type"]): string[] => {
    const capabilityMap: Record<BluetoothDevice["type"], string[]> = {
      phone: ["file_transfer", "messaging", "calls"],
      laptop: ["file_transfer", "screen_sharing"],
      headphones: ["audio_playback", "music_control"],
      speaker: ["audio_playback"],
      watch: ["health_monitoring", "notifications", "fitness_tracking"],
      gamepad: ["gaming", "input_control", "vibration", "button_testing"],
      camera: ["photo_transfer", "remote_capture"],
      printer: ["document_printing"],
      mouse: ["input_control"],
      keyboard: ["input_control"],
      monitor: ["display_output"],
      tv: ["screen_casting"],
      unknown: ["basic_connection"],
    }
    return capabilityMap[type] || ["basic_connection"]
  }

  const scanForDevices = async () => {
    if (isScanning) {
      // Prevent multiple concurrent scans
      return
    }

    // @ts-ignore
    if (!(navigator as any).bluetooth) {
      setError("Bluetooth não é suportado neste navegador")
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      // Primeiro, verificar se o Bluetooth está disponível
      // @ts-ignore
      const availability = await (navigator as any).bluetooth.getAvailability()
      if (!availability) {
        setError("Bluetooth não está disponível neste dispositivo")
        setIsScanning(false)
        return
      }

      // Tentar obter dispositivos já pareados
      try {
        // @ts-ignore
        const devices = await (navigator as any).bluetooth.getDevices()
        console.log("Dispositivos pareados encontrados:", devices)

        devices.forEach((device: any) => {
          const deviceType = detectDeviceType(device.name || "")
          const newDevice: BluetoothDevice = {
            id: device.id,
            name: device.name || "Dispositivo Desconhecido",
            connected: false,
            type: deviceType,
            signalStrength: typeof window !== "undefined" ? Math.floor(Math.random() * 5) + 1 : 3,
            lastSeen: typeof window !== "undefined" ? new Date() : new Date(0),
            paired: true, // Dispositivos já pareados
            services: ["basic_connection"],
            capabilities: getDeviceCapabilities(deviceType),
          }

          setDevices((prev) => {
            const exists = prev.find((d) => d.id === newDevice.id)
            if (exists) return prev
            return [...prev, newDevice]
          })
        })

        if (devices.length > 0) {
          setSuccess(`${devices.length} dispositivo(s) pareado(s) encontrado(s)!`)
        }
      } catch (err) {
        console.log("Nenhum dispositivo pareado encontrado ou API não suportada")
      }

      // Scan por novos dispositivos próximos
      try {
        // @ts-ignore
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            "battery_service",
            "device_information",
            "heart_rate",
            "fitness_machine",
            "human_interface_device",
            "0000110b-0000-1000-8000-00805f9b34fb", // Audio Sink (corrigido para minúsculas)
            "generic_access",
            "generic_attribute",
            "0000180f-0000-1000-8000-00805f9b34fb", // Battery Service UUID
            "0000180a-0000-1000-8000-00805f9b34fb", // Device Information Service
            "0000180d-0000-1000-8000-00805f9b34fb", // Heart Rate Service
            "00001812-0000-1000-8000-00805f9b34fb", // Human Interface Device
          ],
        })

        if (device) {
          const deviceType = detectDeviceType(device.name || "")
          const newDevice: BluetoothDevice = {
            id: device.id,
            name: device.name || "Dispositivo Desconhecido",
            connected: false,
            type: deviceType,
            signalStrength: typeof window !== "undefined" ? Math.floor(Math.random() * 5) + 1 : 3,
            lastSeen: typeof window !== "undefined" ? new Date() : new Date(0),
            paired: false,
            services: ["basic_connection"],
            capabilities: getDeviceCapabilities(deviceType),
          }

          setDevices((prev) => {
            const exists = prev.find((d) => d.id === newDevice.id)
            if (exists) return prev
            return [...prev, newDevice]
          })

          saveDeviceToCache(newDevice)

          setSuccess("Novo dispositivo encontrado!")
        }
      } catch (err: any) {
        if (err.name === "NotFoundError") {
          setError("Nenhum dispositivo selecionado")
        } else if (err.name === "SecurityError") {
          setError("Acesso ao Bluetooth negado. Verifique as permissões.")
        } else {
          setError("Falha ao procurar dispositivos: " + err.message)
        }
        console.error("Bluetooth scan error:", err)
      }
    } catch (err) {
      setError("Erro ao verificar disponibilidade do Bluetooth")
      console.error("Bluetooth availability error:", err)
    } finally {
      setIsScanning(false)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  // Função auxiliar para detectar tipo de dispositivo
  const detectDeviceType = (deviceName: string): BluetoothDevice["type"] => {
    const name = deviceName.toLowerCase()

    if (
      name.includes("headphone") ||
      name.includes("earbuds") ||
      name.includes("airpods") ||
      name.includes("buds") ||
      name.includes("headset")
    ) {
      return "headphones"
    } else if (name.includes("watch") || name.includes("band") || name.includes("fit")) {
      return "watch"
    } else if (
      name.includes("phone") ||
      name.includes("iphone") ||
      name.includes("samsung") ||
      name.includes("galaxy") ||
      name.includes("pixel") ||
      name.includes("xiaomi") ||
      name.includes("redmi") ||
      name.includes("poco") ||
      name.includes("mi ") ||
      name.includes("mi_") ||
      name.includes("realme") ||
      name.includes("huawei") ||
      name.includes("nokia") ||
      name.includes("oneplus") ||
      name.includes("motorola") ||
      name.includes("moto") ||
      name.includes("lg") ||
      name.includes("htc") ||
      name.includes("oppo") ||
      name.includes("apple")
    ) {
      return "phone"
    } else if (
      name.includes("laptop") ||
      name.includes("macbook") ||
      name.includes("pc") ||
      name.includes("computer") ||
      name.includes("notebook") ||
      name.includes("dell") ||
      name.includes("hp") ||
      name.includes("lenovo") ||
      name.includes("asus") ||
      name.includes("acer") ||
      name.includes("thinkpad") ||
      name.includes("chromebook") ||
      name.includes("chromeos") ||
      name.includes("desktop") ||
      name.includes("windows") ||
      name.includes("surface")
    ) {
      return "laptop"
    } else if (name.includes("speaker") || name.includes("soundbar") || name.includes("boom")) {
      return "speaker"
    } else if (
      name.includes("gamepad") ||
      name.includes("controller") ||
      name.includes("xbox") ||
      name.includes("playstation") ||
      name.includes("ps4") ||
      name.includes("ps5") ||
      name.includes("ps6") ||
      name.includes("switch") ||
      name.includes("nintendo")
    ) {
      return "gamepad"
    } else if (name.includes("mouse")) {
      return "mouse"
    } else if (name.includes("keyboard")) {
      return "keyboard"
    } else if (name.includes("camera")) {
      return "camera"
    } else if (name.includes("printer")) {
      return "printer"
    } else if (name.includes("monitor") || name.includes("display")) {
      return "monitor"
    }

    return "unknown"
  }

  const connectDevice = async (deviceId: string) => {
  if (audioRef.current) {
    try {
      await audioRef.current.play();
    } catch (e) {
      // Se bloquear, tenta após clique
      const playOnClick = () => {
        if (audioRef.current) audioRef.current.play().catch(() => {});
        document.removeEventListener('click', playOnClick);
      };
      document.addEventListener('click', playOnClick, { once: true });
    }
  }
    if (connectingDeviceId) {
      // Prevent multiple concurrent connections
      return
    }

    setConnectingDeviceId(deviceId)

    const device = devices.find((d) => d.id === deviceId)
    if (!device) {
      setConnectingDeviceId(null)
      return
    }


    try {
      let wasJustPaired = false
      let batteryLevel: number | undefined = undefined
      let heartRate: number | undefined = undefined
      let steps: number | undefined = undefined
      let calories: number | undefined = undefined
      let notifications: number | undefined = undefined
      let signalStrength: number = 0;

      // Função para ler nível de bateria (BLE padrão + Smart Fit)
      const readBatteryLevel = async (gatt: any): Promise<number | undefined> => {
        // Lista de combinações de UUIDs para tentar (padrão e Smart Fit)
        const serviceUuids = [
          "battery_service",
          "0000180f-0000-1000-8000-00805f9b34fb", // BLE padrão (128 bits)
          "0000fee0-0000-1000-8000-00805f9b34fb", // Smart Fit/Xiaomi
          "0000fee1-0000-1000-8000-00805f9b34fb", // Alternativo
        ];
        const charUuids = [
          "battery_level",
          "00002a19-0000-1000-8000-00805f9b34fb", // BLE padrão
          "00000006-0000-3512-2118-0009af100700", // Mi Band 4/5/6
          "00002a1b-0000-1000-8000-00805f9b34fb", // Alternativo
        ];
        for (const serviceUuid of serviceUuids) {
          try {
            const service = await gatt.getPrimaryService(serviceUuid).catch(() => null);
            if (!service) continue;
            for (const charUuid of charUuids) {
              try {
                const characteristic = await service.getCharacteristic(charUuid).catch(() => null);
                if (!characteristic) continue;
                const value = await characteristic.readValue();
                const battery = value.getUint8(0);
                if (!isNaN(battery)) return battery;
              } catch (err) {
                // Continua tentando próximo UUID
              }
            }
          } catch (err) {
            // Continua tentando próximo serviceUuid
          }
        }
        return undefined;
      }

      // Função para ler batimentos cardíacos
      const readHeartRate = async (gatt: any) => {
        // 1. Tenta padrão BLE
        try {
          const service = await gatt.getPrimaryService("heart_rate").catch(() => null);
          if (service) {
            // 1a. Tenta characteristic padrão
            try {
              const char = await service.getCharacteristic("heart_rate_measurement");
              // Alguns dispositivos exigem ativar notificações
              try { await char.startNotifications(); } catch {}
              // Alguns exigem comando de start na characteristic de controle
              try {
                const ctrl = await service.getCharacteristic("heart_rate_control_point");
                // Comando para iniciar medição contínua (BLE padrão)
                await ctrl.writeValue(Uint8Array.of(1));
              } catch {}
              // Lê valor atual
              const value = await char.readValue();
              // O valor do heart rate está no segundo byte (padrão BLE)
              return value.getUint8(1);
            } catch {}
          }
        } catch {}
        // 2. Xiaomi/Realme/Oppo: FEE0/FEE1/FF07/FF06
        const proprietaryServices = [
          "0000fee0-0000-1000-8000-00805f9b34fb",
          "0000fee1-0000-1000-8000-00805f9b34fb",
          "0000ff07-0000-1000-8000-00805f9b34fb",
          "0000ff06-0000-1000-8000-00805f9b34fb"
        ];
        for (const uuid of proprietaryServices) {
          try {
            const service = await gatt.getPrimaryService(uuid).catch(() => null);
            if (service) {
              // Mi Band: characteristic de batimento pode ser 00002a37... ou custom
              const possibleChars = [
                "00002a37-0000-1000-8000-00805f9b34fb", // Heart Rate Measurement
                "0000ff06-0000-1000-8000-00805f9b34fb", // Notify/Alert
                "0000ff07-0000-1000-8000-00805f9b34fb"
              ];
              for (const charUuid of possibleChars) {
                try {
                  const char = await service.getCharacteristic(charUuid);
                  // Alguns modelos exigem ativar notificações
                  try { await char.startNotifications(); } catch {}
                  // Alguns exigem comando de start em characteristic de controle
                  try {
                    const ctrl = await service.getCharacteristic("00002a39-0000-1000-8000-00805f9b34fb");
                    // Comando para iniciar medição contínua (Mi Band)
                    await ctrl.writeValue(Uint8Array.of(0x15, 0x01, 0x01));
                  } catch {}
                  // Lê valor
                  const value = await char.readValue();
                  // Mi Band: geralmente no segundo byte, mas pode variar
                  if (value.byteLength >= 2) return value.getUint8(1);
                  if (value.byteLength >= 1) return value.getUint8(0);
                } catch {}
              }
            }
          } catch {}
        }
        return undefined;
      }

      // Função para ler passos (usando serviço fitness_machine ou custom)
      const readSteps = async (gatt: any) => {
        // 1. Serviços padrão BLE
        try {
          // fitness_machine
          const service = await gatt.getPrimaryService("fitness_machine").catch(() => null);
          if (service) {
            let char = null;
            try { char = await service.getCharacteristic("00002AC4-0000-1000-8000-00805f9b34fb"); } catch {}
            if (!char) try { char = await service.getCharacteristic("step_count"); } catch {}
            if (!char) try { char = await service.getCharacteristic("steps"); } catch {}
            if (char) {
              const value = await char.readValue();
              return value.getUint32 ? value.getUint32(0, true) : value.getUint16(0, true);
            }
          }
        } catch {}
        // 2. Cycling Speed and Cadence (pode conter passos)
        try {
          const service = await gatt.getPrimaryService("00001816-0000-1000-8000-00805f9b34fb").catch(() => null);
          if (service) {
            let char = null;
            try { char = await service.getCharacteristic("00002A5B-0000-1000-8000-00805f9b34fb"); } catch {}
            if (char) {
              const value = await char.readValue();
              return value.getUint32 ? value.getUint32(0, true) : value.getUint16(0, true);
            }
          }
        } catch {}
        // 3. Xiaomi/Realme/Oppo/Huawei: Serviços proprietários
        // Mi Band/Amazfit: FEE0, FEE1, FF07, FF06, FF04
        const proprietaryServices = [
          "0000fee0-0000-1000-8000-00805f9b34fb", // Xiaomi/Realme/Oppo
          "0000fee1-0000-1000-8000-00805f9b34fb",
          "0000fee9-0000-1000-8000-00805f9b34fb", // Huawei
          "0000ff07-0000-1000-8000-00805f9b34fb",
          "0000ff06-0000-1000-8000-00805f9b34fb",
          "0000ff04-0000-1000-8000-00805f9b34fb"
        ];
        for (const uuid of proprietaryServices) {
          try {
            const service = await gatt.getPrimaryService(uuid).catch(() => null);
            if (service) {
              // Características conhecidas de passos
              const possibleChars = [
                "00000007-0000-3512-2118-0009af100700", // Mi Band 3/4 Activity Data
                "0000ff07-0000-1000-8000-00805f9b34fb", // Activity Data
                "0000ff06-0000-1000-8000-00805f9b34fb", // Notify/Alert
                "0000ff04-0000-1000-8000-00805f9b34fb", // User Info/Settings
                "00002a53-0000-1000-8000-00805f9b34fb", // Step Count (alguns)
                "00002a5b-0000-1000-8000-00805f9b34fb"
              ];
              for (const charUuid of possibleChars) {
                try {
                  const char = await service.getCharacteristic(charUuid);
                  if (char) {
                    const value = await char.readValue();
                    // Tenta extrair passos (pode variar por modelo)
                    if (value.byteLength >= 4) return value.getUint32(0, true);
                    if (value.byteLength >= 2) return value.getUint16(0, true);
                  }
                } catch {}
              }
            }
          } catch {}
        }
        return undefined;
      }

      // Função para ler calorias (usando serviço fitness_machine ou custom)
      const readCalories = async (gatt: any) => {
        // 1. Serviço padrão fitness_machine
        try {
          const service = await gatt.getPrimaryService("fitness_machine").catch(() => null);
          if (service) {
            let char = null;
            try { char = await service.getCharacteristic("calories"); } catch {}
            try { if (!char) char = await service.getCharacteristic("00002A99-0000-1000-8000-00805f9b34fb"); } catch {}
            if (char) {
              const value = await char.readValue();
              return value.getUint16(0, true);
            }
          }
        } catch {}
        // 2. Serviços proprietários (Xiaomi, Huawei, etc)
        const proprietaryServices = [
          "0000fee0-0000-1000-8000-00805f9b34fb",
          "0000fee1-0000-1000-8000-00805f9b34fb",
          "0000fee9-0000-1000-8000-00805f9b34fb",
          "0000ff07-0000-1000-8000-00805f9b34fb",
          "0000ff06-0000-1000-8000-00805f9b34fb",
          "0000ff04-0000-1000-8000-00805f9b34fb"
        ];
        for (const uuid of proprietaryServices) {
          try {
            const service = await gatt.getPrimaryService(uuid).catch(() => null);
            if (service) {
              // Características conhecidas de calorias
              const possibleChars = [
                "00002a99-0000-1000-8000-00805f9b34fb", // BLE padrão
                "0000ff07-0000-1000-8000-00805f9b34fb",
                "0000ff06-0000-1000-8000-00805f9b34fb"
              ];
              for (const charUuid of possibleChars) {
                try {
                  const char = await service.getCharacteristic(charUuid);
                  if (char) {
                    const value = await char.readValue();
                    if (value.byteLength >= 2) return value.getUint16(0, true);
                  }
                } catch {}
              }
            }
          } catch {}
        }
        return undefined;
      }

      // Função para ler notificações (alguns relógios expõem isso)
      const readNotifications = async (gatt: any) => {
        // 1. Serviço padrão alert_notification
        try {
          const service = await gatt.getPrimaryService("alert_notification").catch(() => null);
          if (service) {
            let char = null;
            try { char = await service.getCharacteristic("new_alert"); } catch {}
            try { if (!char) char = await service.getCharacteristic("00002A46-0000-1000-8000-00805f9b34fb"); } catch {}
            if (char) {
              const value = await char.readValue();
              return value.getUint8(0);
            }
          }
        } catch {}
        // 2. Serviços proprietários (Xiaomi, Realme, etc)
        const proprietaryServices = [
          "0000fee0-0000-1000-8000-00805f9b34fb",
          "0000fee1-0000-1000-8000-00805f9b34fb",
          "0000fee9-0000-1000-8000-00805f9b34fb",
          "0000ff06-0000-1000-8000-00805f9b34fb",
          "0000ff07-0000-1000-8000-00805f9b34fb"
        ];
        for (const uuid of proprietaryServices) {
          try {
            const service = await gatt.getPrimaryService(uuid).catch(() => null);
            if (service) {
              // Características conhecidas de notificações
              const possibleChars = [
                "0000ff06-0000-1000-8000-00805f9b34fb", // Notify/Alert
                "0000ff07-0000-1000-8000-00805f9b34fb",
                "00002a46-0000-1000-8000-00805f9b34fb"
              ];
              for (const charUuid of possibleChars) {
                try {
                  const char = await service.getCharacteristic(charUuid);
                  if (char) {
                    const value = await char.readValue();
                    if (value.byteLength >= 1) return value.getUint8(0);
                  }
                } catch {}
              }
            }
          } catch {}
        }
        return undefined;
      }

      // Função para ler RSSI real (se disponível)
      const readSignalStrength = async (bluetoothDevice: any) => {
        // Web Bluetooth não expõe RSSI diretamente, mas alguns dispositivos expõem via characteristic
        // Exemplo: characteristic "rssi" ou "signal_strength" em algum serviço customizado
        try {
          if (bluetoothDevice.gatt) {
            // Tenta serviço customizado
            const services = await bluetoothDevice.gatt.getPrimaryServices();
            for (const service of services) {
              let char = null;
              try { char = await service.getCharacteristic("rssi"); } catch {}
              try { if (!char) char = await service.getCharacteristic("signal_strength"); } catch {}
              if (char) {
                const value = await char.readValue();
                return value.getInt8(0); // RSSI geralmente é int8
              }
            }
          }
        } catch {}
        // Se não conseguir, retorna 0
        return 0;
      }

      // Se o dispositivo já está pareado, tentar conectar diretamente
      if (device.paired) {
        // Conectar realmente ao dispositivo pareado via BLE
        try {
          const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
            filters: [{ name: device.name }],
            optionalServices: [
              "battery_service",
              "device_information",
              "heart_rate",
              "fitness_machine",
              "human_interface_device",
              "0000110b-0000-1000-8000-00805f9b34fb", // Audio Sink
              "0000180f-0000-1000-8000-00805f9b34fb", // Battery Service UUID
              "0000180a-0000-1000-8000-00805f9b34fb", // Device Information Service
              "0000180d-0000-1000-8000-00805f9b34fb", // Heart Rate Service
              "00001812-0000-1000-8000-00805f9b34fb", // Human Interface Device
              "alert_notification",
              "00001816-0000-1000-8000-00805f9b34fb", // Cycling Speed and Cadence
            ],
          });
          const server = await bluetoothDevice.gatt.connect();
          batteryLevel = await readBatteryLevel(server);
          if (device.type === "watch") {
            heartRate = await readHeartRate(server);
            steps = await readSteps(server);
            calories = await readCalories(server);
            notifications = await readNotifications(server);
          }
          signalStrength = await readSignalStrength(bluetoothDevice);
          setDevices((prev) => prev.map((d) => (d.id === deviceId ? {
            ...d,
            connected: true,
            paired: true,
            lastSeen: new Date(),
            batteryLevel,
            signalStrength: signalStrength !== 0 ? signalStrength : d.signalStrength,
            ...(device.type === "watch" ? {
              heartRate,
              steps,
              calories,
              notifications
            } : {})
          } : d)));
        } catch (err) {
          setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, connected: false } : d)));
        }
      } else {
        // Para novos dispositivos, usar requestDevice
        // @ts-ignore
        const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
          filters: [{ name: device.name }],
          optionalServices: [
            "battery_service",
            "device_information",
            "heart_rate",
            "fitness_machine",
            "human_interface_device",
            "0000110b-0000-1000-8000-00805f9b34fb", // Audio Sink (corrigido para minúsculas)
            "0000180f-0000-1000-8000-00805f9b34fb", // Battery Service UUID
            "0000180a-0000-1000-8000-00805f9b34fb", // Device Information Service
            "0000180d-0000-1000-8000-00805f9b34fb", // Heart Rate Service
            "00001812-0000-1000-8000-00805f9b34fb", // Human Interface Device
          ],
        })

        if (bluetoothDevice && bluetoothDevice.gatt) {
          const server = await bluetoothDevice.gatt.connect()
          if (server) {
            wasJustPaired = true // Dispositivo foi pareado agora
            batteryLevel = await readBatteryLevel(server)
            if (device.type === "watch") {
              heartRate = await readHeartRate(server)
              steps = await readSteps(server)
              calories = await readCalories(server)
              notifications = await readNotifications(server)
            }
            signalStrength = await readSignalStrength(bluetoothDevice);
            setDevices((prev) =>
              prev.map((d) =>
                d.id === deviceId
                  ? {
                      ...d,
                      connected: true,
                      paired: true,
                      lastSeen: new Date(),
                      batteryLevel,
                      signalStrength: signalStrength !== 0 ? signalStrength : d.signalStrength,
                      ...(device.type === "watch" ? {
                        heartRate,
                        steps,
                        calories,
                        notifications
                      } : {}),
                    }
                  : d
              )
            )
          }
        }
      }

      // Reproduzir som de conexão APENAS quando o dispositivo foi pareado agora
      if (wasJustPaired && audioRef.current) {
        try {
          console.log('[AUDIO] connected.mp3 | Tentando reproduzir');
          audioRef.current.currentTime = 0
          // Tentar reproduzir com interação do usuário
          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('[AUDIO] connected.mp3 reproduzido com sucesso')
              })
              .catch((error) => {
                console.log('[AUDIO] connected.mp3 bloqueado, aguardando clique do usuário', error)
                // Tentar reproduzir após interação do usuário
                const playOnClick = () => {
                  if (audioRef.current) {
                    audioRef.current.play().then(() => {
                      console.log('[AUDIO] connected.mp3 reproduzido após clique');
                    }).catch(console.error)
                  }
                  document.removeEventListener('click', playOnClick)
                }
                document.addEventListener('click', playOnClick, { once: true })
              })
          }
        } catch (error) {
          console.error('[AUDIO] Erro ao reproduzir som connected.mp3:', error)
        }
      }

      // Configurar funcionalidades específicas do dispositivo
      if (device.type === "headphones" && playlist.length > 0) {
        setCurrentTrack(playlist[0])
        setSuccess(wasJustPaired ? "Fones pareados e conectados! Player de música disponível." : "Fones conectados! Player de música disponível.")
      } else if (device.type === "watch") {
        setSuccess(wasJustPaired ? "Smartwatch pareado e conectado! Monitoramento de saúde ativo." : "Smartwatch conectado! Monitoramento de saúde ativo.")
      } else if (device.type === "gamepad") {
        setSuccess(wasJustPaired ? "Controle pareado e conectado! Jogos e testes disponíveis." : "Controle conectado! Jogos e testes disponíveis.")
      } else {
        setSuccess(wasJustPaired ? "Dispositivo pareado e conectado com sucesso!" : "Dispositivo conectado com sucesso!")
      }

      const updatedDevice = devices.find((d) => d.id === deviceId)
      if (updatedDevice) {
        saveDeviceToCache({
          ...updatedDevice,
          connected: true,
          paired: true,
          batteryLevel,
          signalStrength: signalStrength !== 0 ? signalStrength : updatedDevice.signalStrength,
          ...(device.type === "watch" ? {
            heartRate,
            steps,
            calories,
            notifications
          } : {})
        })
      }

      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(`Erro ao conectar: ${err.message}`)
      setTimeout(() => setError(null), 3000)
      console.error("Connection error:", err)
    } finally {
      setConnectingDeviceId(null)
    }
  }

  const disconnectDevice = (deviceId: string) => {
  if (audioRefDisconnected.current) {
    try {
      audioRefDisconnected.current.play();
    } catch {
      const playOnClick = () => {
        if (audioRefDisconnected.current) audioRefDisconnected.current.play().catch(() => {});
        document.removeEventListener('click', playOnClick);
      };
      document.addEventListener('click', playOnClick, { once: true });
    }
  }
    const device = devices.find((d) => d.id === deviceId)

    // Do NOT play audio during unload to avoid async errors
    const isUnloading = document.hidden || document.visibilityState === "hidden"

    setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, connected: false } : d)))

    // Parar música se desconectar fones
    if (device?.type === "headphones") {
      setIsPlaying(false)
      setCurrentTrack(null)
    }

    if (!isUnloading && audioRefDisconnected.current) {
      try {
        console.log('[AUDIO] disconnected.mp3 | Tentando reproduzir');
        audioRefDisconnected.current.currentTime = 0
        const playPromise = audioRefDisconnected.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('[AUDIO] disconnected.mp3 reproduzido com sucesso')
            })
            .catch(() => {
              console.log('[AUDIO] disconnected.mp3 bloqueado, aguardando clique do usuário');
              const playOnClick = () => {
                if (audioRefDisconnected.current) {
                  audioRefDisconnected.current.play().then(() => {
                    console.log('[AUDIO] disconnected.mp3 reproduzido após clique');
                  }).catch(console.error)
                }
                document.removeEventListener('click', playOnClick)
              }
              document.addEventListener('click', playOnClick, { once: true })
            })
        }
      } catch (error) {
        console.error('[AUDIO] Erro ao reproduzir som disconnected.mp3:', error)
      }
    }
  }

  const removeDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId))

    // Remove do cache e dos nomes personalizados
    const updatedCache = deviceCache.filter((d) => d.id !== deviceId)
    setDeviceCache(updatedCache)

    const updatedNames = { ...customDeviceNames }
    delete updatedNames[deviceId]
    setCustomDeviceNames(updatedNames)

    // Sempre persiste no localStorage
    try {
      localStorage.setItem("bluetoothDeviceCache", JSON.stringify(updatedCache))
      localStorage.setItem("customDeviceNames", JSON.stringify(updatedNames))
    } catch (error) {
      console.error("Erro ao remover do cache:", error)
    }
  }

  // Envio real de arquivo via BLE
  const SERVICE_UUID = '8e7c12e0-5f9b-4b57-b6e0-07c58b4fd328';
  const WRITE_CHAR_UUID = '77f57404-5e34-42e7-9502-3f6a3a0e091b';
  const CHUNK_SIZE = 512;

  const sendFileOverBluetooth = async (file: File, device: BluetoothDevice, fileTransferId: string) => {
    setFiles((prev: FileTransfer[]) => prev.map((f) => f.id === fileTransferId ? { ...f, status: "transferring", progress: 0 } : f));
    try {
      // Solicita o dispositivo Bluetooth novamente para garantir acesso ao GATT
      // (pode ser necessário ajustar para usar o device já conectado, se possível)
      // @ts-ignore
      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
        filters: [{ name: device.name }],
        optionalServices: [SERVICE_UUID]
      });
      // @ts-ignore
      const server = await bluetoothDevice.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(WRITE_CHAR_UUID);

      // Lê o arquivo em chunks
      const fileBuffer = await file.arrayBuffer();
      const totalChunks = Math.ceil(fileBuffer.byteLength / CHUNK_SIZE);
      let sentBytes = 0;
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileBuffer.byteLength);
        const chunk = fileBuffer.slice(start, end);
        await characteristic.writeValue(new Uint8Array(chunk));
        sentBytes = end;
        setFiles((prev: FileTransfer[]) => prev.map((f) =>
          f.id === fileTransferId
            ? { ...f, progress: Math.round((sentBytes / fileBuffer.byteLength) * 100) }
            : f
        ));
      }
      if (typeof window !== "undefined") {
        const now = Date.now();
        setFiles((prev: FileTransfer[]) => prev.map((f) => f.id === fileTransferId ? { ...f, progress: 100, status: "completed", endTime: new Date(now) } : f));
        setHistory((prev: TransferHistory[]) => [
          {
            id: `hist-${now}`,
            fileName: file.name,
            fileSize: file.size,
            deviceName: device.name,
            direction: "send",
            status: "completed",
            timestamp: new Date(now),
            duration: 0,
          },
          ...prev
        ]);
      }
    } catch (err) {
      setFiles((prev: FileTransfer[]) => prev.map((f) => f.id === fileTransferId ? { ...f, status: "error" } : f));
      setError("Erro ao transferir arquivo via Bluetooth: " + (err instanceof Error ? err.message : String(err)));
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || !selectedDevice) return;

    const device = devices.find((d) => d.id === selectedDevice);
    if (!device) return;

    Array.from(selectedFiles).forEach((file, index) => {
      if (typeof window === "undefined") return;
      const now = Date.now();
      const fileTransferId = `file-${now}-${index}`;
      const newFile: FileTransfer = {
        id: fileTransferId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "pending",
        deviceId: device.id,
        deviceName: device.name,
        direction: "send",
        startTime: new Date(now),
      };
      setFiles((prev: FileTransfer[]) => [...prev, newFile]);
      sendFileOverBluetooth(file, device, fileTransferId);
    });
  };



const formatFileSize = (bytes: number) => {
  if (typeof window === "undefined") return ""
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const formatDuration = (seconds: number) => {
  if (typeof window === "undefined") return ""
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const formatTime = (seconds: number) => {
  if (typeof window === "undefined") return ""
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

  // Botão de instalar/abrir PWA
  const installPWA = async () => {
    if (isInstalled) {
      // Tenta abrir o PWA instalado
      if (window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as any).standalone === true) {
        window.open(window.location.href, "_self");
      } else {
        // Tenta abrir via protocolo (Android Chrome)
        window.location.href = window.location.origin;
      }
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      setSuccess("Para instalar, use o menu do navegador: 'Adicionar à tela inicial'.");
      setTimeout(() => setSuccess(null), 8000);
    }
  };

  // Music Player Functions
  const playPause = () => {
    setIsPlaying(!isPlaying)
  }

  const nextTrack = () => {
    if (!currentTrack) return
    const currentIndex = playlist.findIndex((track) => track.id === currentTrack.id)
    const nextIndex = (currentIndex + 1) % playlist.length
    setCurrentTrack(playlist[nextIndex])
  }

  const prevTrack = () => {
    if (!currentTrack) return
    const currentIndex = playlist.findIndex((track) => track.id === currentTrack.id)
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
    setCurrentTrack(playlist[prevIndex])
  }

  // Gamepad Functions
  const testGamepadVibration = async (gamepadIndex: number) => {
    const gamepads = navigator.getGamepads()
    const gamepad = gamepads[gamepadIndex]

    if (gamepad && gamepad.vibrationActuator) {
      try {
        await gamepad.vibrationActuator.playEffect("dual-rumble", {
          startDelay: 0,
          duration: 500,
          weakMagnitude: 0.5,
          strongMagnitude: 1.0,
        })
        setSuccess("Vibração testada!")
      } catch (error) {
        setError("Vibração não suportada neste controle")
      }
    } else {
      setError("Vibração não disponível")
    }
    setTimeout(() => {
      setSuccess(null)
      setError(null)
    }, 2000)
  }

  const startMiniGame = (gameId: string) => {
    setActiveGame(gameId)
    setGameScore(0)
    setSuccess(`Jogo ${gameId} iniciado! Use o controle para jogar.`)
    setTimeout(() => setSuccess(null), 3000)
  }

  const stopMiniGame = () => {
    setActiveGame(null)
    setGameScore(0)
  }

  const getButtonName = (index: number): string => {
    const buttonNames = [
      "A/X",
      "B/Circle",
      "X/Square",
      "Y/Triangle",
      "LB/L1",
      "RB/R1",
      "LT/L2",
      "RT/R2",
      "Select/Share",
      "Start/Options",
      "L3",
      "R3",
      "D-Up",
      "D-Down",
      "D-Left",
      "D-Right",
      "Home/PS",
      "Touchpad",
    ]
    return buttonNames[index] || `Botão ${index}`
  }

  // Função auxiliar para processar o primeiro chunk recebido
const parseInitialChunk = (
  chunk: Uint8Array,
  fileTransferId: string,
  setFiles: React.Dispatch<React.SetStateAction<FileTransfer[]>>
) => {
  const expectedSize = new DataView(chunk.buffer).getUint32(0, true);
  const nameLen = new DataView(chunk.buffer).getUint16(4, true);
  const fileName = new TextDecoder().decode(chunk.slice(6, 6 + nameLen));
  const remainingChunk = chunk.slice(6 + nameLen);

  setFiles((prev) =>
    prev.map((f) =>
      f.id === fileTransferId
        ? { ...f, name: fileName, size: expectedSize }
        : f
    )
  );

  return { expectedSize, fileName, remainingChunk };
};

  // Renderiza o conteúdo específico do dispositivo
  const renderDeviceSpecificContent = (device: BluetoothDevice) => {
    if (!device.connected) return null;

    switch (device.type) {
      case "headphones":
        return (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Player de Música
            </h4>

            {currentTrack ? (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="font-medium text-sm">{currentTrack.title}</p>
                  <p className="text-xs text-gray-600">{currentTrack.artist}</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button size="sm" variant="ghost" onClick={prevTrack}>
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={playPause}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={nextTrack}>
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span>{formatTime(currentTrack.currentTime)}</span>
                  <Progress value={(currentTrack.currentTime / currentTrack.duration) * 100} className="flex-1" />
                  <span>{formatTime(currentTrack.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <Progress value={volume} className="flex-1" />
                  <span className="text-xs">{volume}%</span>
                </div>
                {/* Comandos Bluetooth reais para fones de ouvido */}
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="secondary" className="flex-1" title="Anterior" onClick={async () => {
                    try {
                      // @ts-ignore
                      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                        filters: [{ name: device.name }],
                        optionalServices: ["0000183b-0000-1000-8000-00805f9b34fb"]
                      });
                      const server = await bluetoothDevice.gatt.connect();
                      const service = await server.getPrimaryService("0000183b-0000-1000-8000-00805f9b34fb");
                      const char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb");
                      await char.writeValue(Uint8Array.of(0x47)); // Previous Track
                      setSuccess("Comando de faixa anterior enviado!");
                      setTimeout(() => setSuccess(null), 2000);
                    } catch (e) {
                      setError("Não foi possível enviar comando de faixa anterior: " + (e instanceof Error ? e.message : String(e)));
                      setTimeout(() => setError(null), 4000);
                    }
                  }}>
                    <SkipBack className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" title="Play/Pause" onClick={async () => {
                    try {
                      // @ts-ignore
                      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                        filters: [{ name: device.name }],
                        optionalServices: ["0000183b-0000-1000-8000-00805f9b34fb"]
                      });
                      const server = await bluetoothDevice.gatt.connect();
                      const service = await server.getPrimaryService("0000183b-0000-1000-8000-00805f9b34fb");
                      const char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb");
                      await char.writeValue(Uint8Array.of(0x46)); // Play/Pause
                      setSuccess("Comando Play/Pause enviado!");
                      setTimeout(() => setSuccess(null), 2000);
                    } catch (e) {
                      setError("Não foi possível enviar comando Play/Pause: " + (e instanceof Error ? e.message : String(e)));
                      setTimeout(() => setError(null), 4000);
                    }
                  }}>
                    {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    Play/Pause
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" title="Próxima" onClick={async () => {
                    try {
                      // @ts-ignore
                      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                        filters: [{ name: device.name }],
                        optionalServices: ["0000183b-0000-1000-8000-00805f9b34fb"]
                      });
                      const server = await bluetoothDevice.gatt.connect();
                      const service = await server.getPrimaryService("0000183b-0000-1000-8000-00805f9b34fb");
                      const char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb");
                      await char.writeValue(Uint8Array.of(0x48)); // Next Track
                      setSuccess("Comando de próxima faixa enviado!");
                      setTimeout(() => setSuccess(null), 2000);
                    } catch (e) {
                      setError("Não foi possível enviar comando de próxima faixa: " + (e instanceof Error ? e.message : String(e)));
                      setTimeout(() => setError(null), 4000);
                    }
                  }}>
                    <SkipForward className="w-4 h-4 mr-1" />
                    Próxima
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" title="Aumentar Volume" onClick={async () => {
                    try {
                      // @ts-ignore
                      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                        filters: [{ name: device.name }],
                        optionalServices: ["0000183b-0000-1000-8000-00805f9b34fb"]
                      });
                      const server = await bluetoothDevice.gatt.connect();
                      const service = await server.getPrimaryService("0000183b-0000-1000-8000-00805f9b34fb");
                      const char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb");
                      await char.writeValue(Uint8Array.of(0x43)); // Volume Up
                      setSuccess("Comando de aumentar volume enviado!");
                      setTimeout(() => setSuccess(null), 2000);
                    } catch (e) {
                      setError("Não foi possível enviar comando de aumentar volume: " + (e instanceof Error ? e.message : String(e)));
                      setTimeout(() => setError(null), 4000);
                    }
                  }}>
                    <Volume2 className="w-4 h-4 mr-1" />
                    +
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" title="Diminuir Volume" onClick={async () => {
                    try {
                      // @ts-ignore
                      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                        filters: [{ name: device.name }],
                        optionalServices: ["0000183b-0000-1000-8000-00805f9b34fb"]
                      });
                      const server = await bluetoothDevice.gatt.connect();
                      const service = await server.getPrimaryService("0000183b-0000-1000-8000-00805f9b34fb");
                      const char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb");
                      await char.writeValue(Uint8Array.of(0x44)); // Volume Down
                      setSuccess("Comando de diminuir volume enviado!");
                      setTimeout(() => setSuccess(null), 2000);
                    } catch (e) {
                      setError("Não foi possível enviar comando de diminuir volume: " + (e instanceof Error ? e.message : String(e)));
                      setTimeout(() => setError(null), 4000);
                    }
                  }}>
                    <Volume1 className="w-4 h-4 mr-1" />
                    -
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Nenhuma música selecionada</p>
            )}

            {/* UUIDs Bluetooth para Fones de Ouvido */}
            <div className="mt-4">
              <h5 className="font-semibold text-xs text-purple-900 mb-1 flex items-center gap-1">
                <span className="w-3 h-3 mr-1">🔑</span>
                UUIDs Bluetooth para Fones de Ouvido
              </h5>
              <div className="overflow-x-auto">
                <table className="text-xs bg-purple-100 rounded p-2 border border-purple-200 mb-2 w-full min-w-[420px]">
                  <thead>
                    <tr className="text-purple-900">
                      <th className="text-left font-semibold p-1">Serviço</th>
                      <th className="text-left font-semibold p-1">UUID</th>
                      <th className="text-left font-semibold p-1">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 font-medium">Audio Input Control Service</td>
                      <td className="p-1">0000183C-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Controle de entrada de áudio (BLE audio)</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Battery Service</td>
                      <td className="p-1">0000180F-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Informações sobre bateria (nível, status)</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Device Information Service</td>
                      <td className="p-1">0000180A-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Info do dispositivo (modelo, fabricante, etc)</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Generic Audio Service (GAS)</td>
                      <td className="p-1">00001841-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Serviço genérico de áudio BLE (em desenvolvimento)</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Media Control Service</td>
                      <td className="p-1">0000183B-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Controle de mídia (play, pause, volume, etc)</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Audio Stream Control Service (ASCS)</td>
                      <td className="p-1">00001843-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Controle de streaming de áudio BLE</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Volume Control Service (VCS)</td>
                      <td className="p-1">00001844-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Controle de volume via BLE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-purple-900 mb-2">Estes UUIDs são usados para comunicação, controle de mídia e status de bateria em fones de ouvido Bluetooth modernos.</p>
            </div>
          </div>
        )
      case "speaker":
        return (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Reprodução de Áudio
            </h4>

            {currentTrack ? (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="font-medium text-sm">{currentTrack.title}</p>
                  <p className="text-xs text-gray-600">{currentTrack.artist}</p>
                  <p className="text-xs text-gray-500 italic">Reproduzido por: {sourceApp}</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button size="sm" variant="ghost" onClick={prevTrack}>
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={playPause}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={nextTrack}>
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span>{formatTime(currentTrack.currentTime)}</span>
                  <Progress value={(currentTrack.currentTime / currentTrack.duration) * 100} className="flex-1" />
                  <span>{formatTime(currentTrack.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <Progress value={volume} className="flex-1" />
                  <span className="text-xs">{volume}%</span>
                </div>
                {/* Comandos Bluetooth reais para caixas de som */}
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="secondary" className="flex-1" title="Anterior" onClick={async () => {
                    try {
                      // @ts-ignore
                      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                        filters: [{ name: device.name }],
                        optionalServices: ["0000183b-0000-1000-8000-00805f9b34fb"]
                      });
                      const server = await bluetoothDevice.gatt.connect();
                      const service = await server.getPrimaryService("0000183b-0000-1000-8000-00805f9b34fb");
                      const char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb");
                      await char.writeValue(Uint8Array.of(0x47)); // Previous Track
                      setSuccess("Comando de faixa anterior enviado!");
                      setTimeout(() => setSuccess(null), 2000);
                    } catch (e) {
                      setError("Não foi possível enviar comando de faixa anterior: " + (e instanceof Error ? e.message : String(e)));
                      setTimeout(() => setError(null), 4000);
                    }
                  }}>
                    <SkipBack className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" title="Play/Pause" onClick={async () => {
                    try {
                      // @ts-ignore
                      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                        filters: [{ name: device.name }],
                        optionalServices: ["0000183b-0000-1000-8000-00805f9b34fb"]
                      });
                      const server = await bluetoothDevice.gatt.connect();
                      const service = await server.getPrimaryService("0000183b-0000-1000-8000-00805f9b34fb");
                      const char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb");
                      await char.writeValue(Uint8Array.of(0x46)); // Play/Pause
                      setSuccess("Comando Play/Pause enviado!");
                      setTimeout(() => setSuccess(null), 2000);
                    } catch (e) {
                      setError("Não foi possível enviar comando Play/Pause: " + (e instanceof Error ? e.message : String(e)));
                      setTimeout(() => setError(null), 4000);
                    }
                  }}>
                    {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    Play/Pause
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" title="Próxima" onClick={async () => {
                    try {
                      // @ts-ignore
                      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                        filters: [{ name: device.name }],
                        optionalServices: ["0000183b-0000-1000-8000-00805f9b34fb"]
                      });
                      const server = await bluetoothDevice.gatt.connect();
                      const service = await server.getPrimaryService("0000183b-0000-1000-8000-00805f9b34fb");
                      const char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb");
                      await char.writeValue(Uint8Array.of(0x48)); // Next Track
                      setSuccess("Comando de próxima faixa enviado!");
                      setTimeout(() => setSuccess(null), 2000);
                    } catch (e) {
                      setError("Não foi possível enviar comando de próxima faixa: " + (e instanceof Error ? e.message : String(e)));
                      setTimeout(() => setError(null), 4000);
                    }
                  }}>
                    <SkipForward className="w-4 h-4 mr-1" />
                    Próxima
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" title="Aumentar Volume" onClick={async () => {
                    try {
                      // @ts-ignore
                      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                        filters: [{ name: device.name }],
                        optionalServices: ["0000183b-0000-1000-8000-00805f9b34fb"]
                      });
                      const server = await bluetoothDevice.gatt.connect();
                      const service = await server.getPrimaryService("0000183b-0000-1000-8000-00805f9b34fb");
                      const char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb");
                      await char.writeValue(Uint8Array.of(0x43)); // Volume Up
                      setSuccess("Comando de aumentar volume enviado!");
                      setTimeout(() => setSuccess(null), 2000);
                    } catch (e) {
                      setError("Não foi possível enviar comando de aumentar volume: " + (e instanceof Error ? e.message : String(e)));
                      setTimeout(() => setError(null), 4000);
                    }
                  }}>
                    <Volume2 className="w-4 h-4 mr-1" />
                    +
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" title="Diminuir Volume" onClick={async () => {
                    try {
                      // @ts-ignore
                      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                        filters: [{ name: device.name }],
                        optionalServices: ["0000183b-0000-1000-8000-00805f9b34fb"]
                      });
                      const server = await bluetoothDevice.gatt.connect();
                      const service = await server.getPrimaryService("0000183b-0000-1000-8000-00805f9b34fb");
                      const char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb");
                      await char.writeValue(Uint8Array.of(0x44)); // Volume Down
                      setSuccess("Comando de diminuir volume enviado!");
                      setTimeout(() => setSuccess(null), 2000);
                    } catch (e) {
                      setError("Não foi possível enviar comando de diminuir volume: " + (e instanceof Error ? e.message : String(e)));
                      setTimeout(() => setError(null), 4000);
                    }
                  }}>
                    <Volume1 className="w-4 h-4 mr-1" />
                    -
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Nenhuma música selecionada</p>
            )}

            {/* UUIDs Bluetooth para Caixas de Som */}
            <div className="mt-4">
              <h5 className="font-semibold text-xs text-orange-900 mb-1 flex items-center gap-1">
                <span className="w-3 h-3 mr-1">🔑</span>
                UUIDs Bluetooth para Caixas de Som
              </h5>
              <div className="overflow-x-auto">
                <table className="text-xs bg-orange-100 rounded p-2 border border-orange-200 mb-2 w-full min-w-[420px]">
                  <thead>
                    <tr className="text-orange-900">
                      <th className="text-left font-semibold p-1">Serviço</th>
                      <th className="text-left font-semibold p-1">UUID</th>
                      <th className="text-left font-semibold p-1">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 font-medium">Audio Input Control Service</td>
                      <td className="p-1">0000183C-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Controle de entrada de áudio (BLE audio)</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Battery Service</td>
                      <td className="p-1">0000180F-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Informações sobre bateria (nível, status)</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Device Information Service</td>
                      <td className="p-1">0000180A-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Info do dispositivo (modelo, fabricante, etc)</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Generic Audio Service (GAS)</td>
                      <td className="p-1">00001841-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Serviço genérico de áudio BLE (em desenvolvimento)</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Media Control Service</td>
                      <td className="p-1">0000183B-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Controle de mídia (play, pause, volume, etc)</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Audio Stream Control Service (ASCS)</td>
                      <td className="p-1">00001843-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Controle de streaming de áudio BLE</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-medium">Volume Control Service (VCS)</td>
                      <td className="p-1">00001844-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Controle de volume via BLE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-orange-900 mb-2">Estes UUIDs são usados para comunicação, controle de mídia e status de bateria em caixas de som Bluetooth modernas.</p>
            </div>
          </div>
        )

      case "watch":
        // Função utilitária para ler o nível de bateria do smartwatch usando os UUIDs padrão
        const readWatchBatteryLevel = async (deviceName: string) => {
          try {
            // @ts-ignore
            const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
              filters: [{ name: deviceName }],
              optionalServices: ["0000180f-0000-1000-8000-00805f9b34fb"] // Battery Service
            });
            const server = await bluetoothDevice.gatt.connect();
            const service = await server.getPrimaryService("0000180f-0000-1000-8000-00805f9b34fb");
            const characteristic = await service.getCharacteristic("00002a19-0000-1000-8000-00805f9b34fb");
            const value = await characteristic.readValue();
            const battery = value.getUint8(0);
            setSuccess(`Nível de bateria: ${battery}%`);
            setTimeout(() => setSuccess(null), 3000);
          } catch (e) {
            setError("Não foi possível ler o nível de bateria: " + (e instanceof Error ? e.message : String(e)));
            setTimeout(() => setError(null), 4000);
          }
        };
        return (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitoramento de Saúde
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{typeof device.heartRate === 'number' ? `${device.heartRate} bpm` : 'Não disponível'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>{typeof device.steps === 'number' ? `${device.steps} passos` : 'Não disponível'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>{typeof device.calories === 'number' ? `${device.calories} cal` : 'Não disponível'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <span>{typeof device.notifications === 'number' ? `${device.notifications} notif.` : 'Não disponível'}</span>
              </div>
              <div className="flex items-center gap-2">
                <BatteryFull className="w-4 h-4 text-green-500" />
                <span>{typeof device.batteryLevel === 'number' ? `${device.batteryLevel}%` : 'Não disponível'}</span>
              </div>
            </div>
            <div className="mt-2 flex gap-1 flex-wrap">
              <Button size="sm" variant="outline" className="text-xs" onClick={async () => {
                // Tenta acionar característica de chamada (exemplo: alert_notification/control_point)
                try {
                  if (device.connected) {
                    // @ts-ignore
                    const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                      filters: [{ name: device.name }],
                      optionalServices: ["alert_notification"]
                    });
                    const server = await bluetoothDevice.gatt.connect();
                    const service = await server.getPrimaryService("alert_notification");
                    let char = null;
                    try { char = await service.getCharacteristic("control_point"); } catch {}
                    try { if (!char) char = await service.getCharacteristic("00002A44-0000-1000-8000-00805f9b34fb"); } catch {}
                    if (char) {
                      await char.writeValue(Uint8Array.of(1));
                      setSuccess("Comando de chamada enviado ao relógio!");
                      setTimeout(() => setSuccess(null), 2000);
                    } else {
                      setError("Função de chamada não suportada neste relógio.");
                      setTimeout(() => setError(null), 2000);
                    }
                  }
                } catch (e) {
                  setError("Erro ao tentar acionar chamada: " + (e instanceof Error ? e.message : String(e)));
                  setTimeout(() => setError(null), 2000);
                }
              }}>
                <Phone className="w-3 h-3 mr-1" />
                Chamadas
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={async () => {
                // Tenta acionar característica de mensagem (exemplo: alert_notification/new_alert)
                try {
                  if (device.connected) {
                    // @ts-ignore
                    const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                      filters: [{ name: device.name }],
                      optionalServices: ["alert_notification"]
                    });
                    const server = await bluetoothDevice.gatt.connect();
                    const service = await server.getPrimaryService("alert_notification");
                    let char = null;
                    try { char = await service.getCharacteristic("new_alert"); } catch {}
                    try { if (!char) char = await service.getCharacteristic("00002A46-0000-1000-8000-00805f9b34fb"); } catch {}
                    if (char) {
                      await char.writeValue(Uint8Array.of(1));
                      setSuccess("Comando de mensagem enviado ao relógio!");
                      setTimeout(() => setSuccess(null), 2000);
                    } else {
                      setError("Função de mensagem não suportada neste relógio.");
                      setTimeout(() => setError(null), 2000);
                    }
                  }
                } catch (e) {
                  setError("Erro ao tentar acionar mensagem: " + (e instanceof Error ? e.message : String(e)));
                  setTimeout(() => setError(null), 2000);
                }
              }}>
                <MessageSquare className="w-3 h-3 mr-1" />
                Mensagens
              </Button>
              <Button size="sm" variant="secondary" className="text-xs" onClick={async () => {
                // Explorar serviços/características BLE (descoberta de UUIDs)
                try {
                  // Substitua por um modal ou exibição do componente BleExplorer
                  // Exemplo: abrir um modal com <BleExplorer />
                  // Ou simplesmente renderize <BleExplorer /> em algum lugar da tela
                  alert('Abra o explorador Bluetooth no painel principal!');
                } catch (e) {
                  setError("Erro ao explorar serviços BLE: " + (e instanceof Error ? e.message : String(e)));
                  setTimeout(() => setError(null), 2000);
                }
              }}>
                <Zap className="w-3 h-3 mr-1" />
                Explorar Serviços BLE
// Sugestão: Renderize o componente BleExplorer em algum lugar do seu layout principal, por exemplo, dentro do conteúdo principal ou em um modal.
              </Button>
            </div>
            {/* UUIDs de Bateria para Smartwatches */}
            <div className="mt-4">
              <h5 className="font-semibold text-xs text-green-900 mb-1 flex items-center gap-1">
                <BatteryFull className="w-3 h-3 mr-1" />
                UUIDs de Bateria Bluetooth para Smartwatches
              </h5>
              <div className="overflow-x-auto">
                <table className="text-xs bg-green-100 rounded p-2 border border-green-200 mb-2 w-full min-w-[420px]">
                  <thead>
                    <tr className="text-green-900">
                      <th className="text-left font-semibold p-1">Serviço (Service) UUID</th>
                      <th className="text-left font-semibold p-1">Característica (Characteristic) UUID</th>
                      <th className="text-left font-semibold p-1">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 font-mono">0000180F-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1 font-mono">00002A19-0000-1000-8000-00805f9b34fb</td>
                      <td className="p-1">Battery Service - Battery Level</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-green-900 mb-2">Estes UUIDs permitem ler o nível de bateria do relógio via Bluetooth.</p>
            </div>
          </div>
        )

      case "phone":
      case "laptop":
        return (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Transferência de Arquivos
            </h4>
            <p className="text-sm text-gray-600 mb-2">Envie arquivos para este dispositivo</p>
            <Button
              onClick={() => {
                setSelectedDevice(device.id)
                fileInputRef.current?.click()
              }}
              size="sm"
              className="w-full"
            >
              <Upload className="w-3 h-3 mr-1" />
              Selecionar Arquivos
            </Button>
            <Button
              onClick={() => receiveFileOverBluetooth(device)}
              size="sm"
              className="w-full mt-2"
              variant="outline"
            >
              <Download className="w-3 h-3 mr-1" /> Receber Arquivo
            </Button>
          </div>
        )

      case "gamepad":
        const gamepad = connectedGamepads.find((gp) => gp.connected)
        return (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Controle de Jogo
            </h4>

            {gamepad ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">{gamepad.id}</p>
                  <p className="text-gray-600">Índice: {gamepad.index}</p>
                </div>

                {/* Teste de Vibração */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testGamepadVibration(gamepad.index)}
                  className="w-full text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Testar Vibração
                </Button>

                {/* Status dos Botões */}
                <div className="space-y-2">
                  <p className="text-xs font-medium">Botões Pressionados:</p>
                  <div className="grid grid-cols-4 gap-1">
                    {gamepad.buttons.map((pressed, index) => (
                      <div
                        key={index}
                        className={`text-xs p-1 rounded text-center ${
                          pressed ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {getButtonName(index).split("/")[0]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analógicos */}
                <div className="space-y-2">
                  <p className="text-xs font-medium">Analógicos:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs">
                      <p>Esquerdo:</p>
                      <p>X: {gamepad.axes[0]?.toFixed(2) || "0.00"}</p>
                      <p>Y: {gamepad.axes[1]?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div className="text-xs">
                      <p>Direito:</p>
                      <p>X: {gamepad.axes[2]?.toFixed(2) || "0.00"}</p>
                      <p>Y: {gamepad.axes[3]?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>
                </div>

                {/* Mini Jogos */}
                <div className="space-y-2">
                  <p className="text-xs font-medium">Mini Jogos:</p>
                  <div className="grid grid-cols-1 gap-1">
                    {miniGames.map((game) => (
                      <Button
                        key={game.id}
                        size="sm"
                        variant={activeGame === game.id ? "default" : "outline"}
                        onClick={() => (activeGame === game.id ? stopMiniGame() : startMiniGame(game.id))}
                        className="text-xs"
                      >
                        {activeGame === game.id ? "Parar" : "Jogar"} {game.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Jogo Ativo */}
                {activeGame && (
                  <div className="p-2 bg-white rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-medium">{miniGames.find((g) => g.id === activeGame)?.name}</p>
                      <p className="text-xs">Score: {gameScore}</p>
                    </div>

                    {activeGame === "button-test" && (
                      <div className="text-xs text-center">
                        <p>Pressione qualquer botão!</p>
                        <p className="text-green-600">Botões testados: {gamepad.buttons.filter((b) => b).length}</p>
                      </div>
                    )}

                    {activeGame === "snake" && (
                      <div className="text-xs text-center">
                        <p>🐍 Use o D-pad para mover</p>
                        <p>Colete as maçãs! 🍎</p>
                      </div>
                    )}

                    {activeGame === "pong" && (
                      <div className="text-xs text-center">
                        <p>🏓 Use analógico esquerdo</p>
                        <p>Não deixe a bola passar!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Nenhum controle detectado</p>
                <p className="text-xs text-gray-500">Conecte um controle USB ou Bluetooth para começar</p>
              </div>
            )}
          </div>
        )

      case "tv":
        return (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <Tv className="w-4 h-4" />
              TV Conectada
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">Transmita a tela do seu dispositivo para a TV conectada via Bluetooth.</p>
                <Button
                  onClick={() => {
                    setSuccess("Transmissão de tela iniciada para a TV!")
                    setTimeout(() => setSuccess(null), 3000)
                  }}
                  size="sm"
                  className="w-full mb-2"
                >
                  <Tv className="w-3 h-3 mr-1" />
                  Iniciar Transmissão de Tela
                </Button>
              </div>
              <div>
                <h5 className="font-semibold text-xs text-yellow-900 mb-1 flex items-center gap-1">
                  <Volume2 className="w-4 h-4" />
                  Controle de Volume
                </h5>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" aria-label="Diminuir volume" onClick={() => setVolume(Math.max(0, volume - 10))}>
                    <span>-</span>
                  </Button>
                  <Progress value={volume} className="flex-1" />
                  <span className="text-xs w-8 text-center">{volume}%</span>
                  <Button size="icon" variant="outline" aria-label="Aumentar volume" onClick={() => setVolume(Math.min(100, volume + 10))}>
                    <span>+</span>
                  </Button>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-xs text-yellow-900 mb-1 flex items-center gap-1">
                  <span className="w-3 h-3 mr-1">🔑</span>
                  UUIDs Bluetooth para TV
                </h5>
                <ul className="text-xs bg-yellow-100 rounded p-2 border border-yellow-200 mb-2">
                  <li><b>Generic Access:</b> 00001800-0000-1000-8000-00805f9b34fb</li>
                  <li><b>Generic Attribute:</b> 00001801-0000-1000-8000-00805f9b34fb</li>
                  <li><b>Device Information:</b> 0000180a-0000-1000-8000-00805f9b34fb</li>
                  <li><b>AVRCP (Controle Remoto AV):</b> 0000110e-0000-1000-8000-00805f9b34fb</li>
                  <li><b>A2DP (Áudio):</b> 0000110d-0000-1000-8000-00805f9b34fb</li>
                  <li><b>HID (Controle Remoto):</b> 00001812-0000-1000-8000-00805f9b34fb</li>
                  <li><b>Media Control Service (BLE):</b> 0000184e-0000-1000-8000-00805f9b34fb</li>
                </ul>
                <p className="text-xs text-yellow-900 mb-2">Estes UUIDs são usados para comunicação e controle de TVs via Bluetooth clássico e BLE.</p>
                <Button
                  onClick={() => {
                    setSuccess("Modo Controle Remoto Bluetooth ativado! Use os botões abaixo.");
                    setTimeout(() => setSuccess(null), 2000);
                  }}
                  size="sm"
                  className="w-full mb-2"
                  variant="outline"
                >
                  <span className="mr-1">🕹️</span>
                  Controle Remoto Bluetooth
                </Button>
                <div className="flex gap-2 mb-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={async () => {
                      try {
                        // Tenta Media Control Service (BLE)
                        // @ts-ignore
                        const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                          filters: [{ name: device.name }],
                          optionalServices: ["0000184e-0000-1000-8000-00805f9b34fb", "0000110e-0000-1000-8000-00805f9b34fb"]
                        });
                        const server = await bluetoothDevice.gatt.connect();
                        let service = null;
                        try {
                          service = await server.getPrimaryService("0000184e-0000-1000-8000-00805f9b34fb");
                        } catch {}
                        if (!service) {
                          try {
                            service = await server.getPrimaryService("0000110e-0000-1000-8000-00805f9b34fb");
                          } catch {}
                        }
                        if (!service) throw new Error("Serviço de controle de mídia não encontrado na TV.");
                        // Característica de controle de mídia (Media Control Point)
                        let char = null;
                        try {
                          char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb"); // Media Control Point
                        } catch {}
                        if (!char) throw new Error("Característica de controle de mídia não encontrada.");
                        // Comando: 0x43 = Volume Up (BLE Media Control Point)
                        await char.writeValue(Uint8Array.of(0x43));
                        setSuccess("Comando de aumentar volume enviado!");
                        setTimeout(() => setSuccess(null), 2000);
                      } catch (e) {
                        setError("Não foi possível enviar comando de volume: " + (e instanceof Error ? e.message : String(e)));
                        setTimeout(() => setError(null), 4000);
                      }
                    }}
                  >
                    <Volume2 className="w-4 h-4 mr-1" />
                    Aumentar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={async () => {
                      try {
                        // Tenta Media Control Service (BLE)
                        // @ts-ignore
                        const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                          filters: [{ name: device.name }],
                          optionalServices: ["0000184e-0000-1000-8000-00805f9b34fb", "0000110e-0000-1000-8000-00805f9b34fb"]
                        });
                        const server = await bluetoothDevice.gatt.connect();
                        let service = null;
                        try {
                          service = await server.getPrimaryService("0000184e-0000-1000-8000-00805f9b34fb");
                        } catch {}
                        if (!service) {
                          try {
                            service = await server.getPrimaryService("0000110e-0000-1000-8000-00805f9b34fb");
                          } catch {}
                        }
                        if (!service) throw new Error("Serviço de controle de mídia não encontrado na TV.");
                        // Característica de controle de mídia (Media Control Point)
                        let char = null;
                        try {
                          char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb"); // Media Control Point
                        } catch {}
                        if (!char) throw new Error("Característica de controle de mídia não encontrada.");
                        // Comando: 0x44 = Volume Down (BLE Media Control Point)
                        await char.writeValue(Uint8Array.of(0x44));
                        setSuccess("Comando de diminuir volume enviado!");
                        setTimeout(() => setSuccess(null), 2000);
                      } catch (e) {
                        setError("Não foi possível enviar comando de volume: " + (e instanceof Error ? e.message : String(e)));
                        setTimeout(() => setError(null), 4000);
                      }
                    }}
                  >
                    <Volume1 className="w-4 h-4 mr-1" />
                    Diminuir
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={async () => {
                      try {
                        // Tenta Media Control Service (BLE)
                        // @ts-ignore
                        const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
                          filters: [{ name: device.name }],
                          optionalServices: ["0000184e-0000-1000-8000-00805f9b34fb", "0000110e-0000-1000-8000-00805f9b34fb"]
                        });
                        const server = await bluetoothDevice.gatt.connect();
                        let service = null;
                        try {
                          service = await server.getPrimaryService("0000184e-0000-1000-8000-00805f9b34fb");
                        } catch {}
                        if (!service) {
                          try {
                            service = await server.getPrimaryService("0000110e-0000-1000-8000-00805f9b34fb");
                          } catch {}
                        }
                        if (!service) throw new Error("Serviço de controle de mídia não encontrado na TV.");
                        // Característica de controle de mídia (Media Control Point)
                        let char = null;
                        try {
                          char = await service.getCharacteristic("00002b55-0000-1000-8000-00805f9b34fb"); // Media Control Point
                        } catch {}
                        if (!char) throw new Error("Característica de controle de mídia não encontrada.");
                        // Comando: 0x45 = Mute (BLE Media Control Point)
                        await char.writeValue(Uint8Array.of(0x45));
                        setSuccess("Comando de mudo enviado!");
                        setTimeout(() => setSuccess(null), 2000);
                      } catch (e) {
                        setError("Não foi possível enviar comando de mudo: " + (e instanceof Error ? e.message : String(e)));
                        setTimeout(() => setError(null), 4000);
                      }
                    }}
                  >
                    <VolumeX className="w-4 h-4 mr-1" />
                    Mudo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Dispositivo conectado com funcionalidades básicas</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bluetooth className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">Bluetooth Center</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Centro completo de transferências Bluetooth {!isOnline && "(Modo Offline)"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
              {/* Status Indicators */}
              <div className="flex gap-1 sm:gap-2">
                <Badge
                  variant={isOnline ? "default" : "secondary"}
                  className="flex items-center gap-1 text-xs px-1.5 py-0.5 sm:px-2.5"
                >
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
                </Badge>
                <Badge
                  variant={bluetoothEnabled ? "default" : "destructive"}
                  className="flex items-center gap-1 text-xs px-1.5 py-0.5 sm:px-2.5"
                >
                  <Bluetooth className="w-3 h-3" />
                  <span className="hidden sm:inline">{bluetoothEnabled ? "Ativo" : "Inativo"}</span>
                </Badge>
              </div>

              {/* PWA Install / Abrir App - Apenas em desktop */}
              {isClient && !isStandalone && typeof window !== 'undefined' && !/android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) && (
                <PwaInstallButton />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tabs */}
          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-5 bg-muted/80 p-1">
              <TabsTrigger value="devices" className="flex items-center gap-2">
                <Bluetooth className="w-4 h-4" />
                Dispositivos
              </TabsTrigger>
              <TabsTrigger value="transfers" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Transferências
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Informações
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Mobile Tabs */}
          <div className="sm:hidden">
            <div className="bg-white rounded-lg shadow-sm p-2 mb-4">
              <TabsList className="grid w-full grid-cols-3 bg-muted/80 p-1 mb-2">
                <TabsTrigger value="devices" className="flex items-center gap-1 text-xs px-2">
                  <Bluetooth className="w-3 h-3" />
                  Disp.
                </TabsTrigger>
                <TabsTrigger value="transfers" className="flex items-center gap-1 text-xs px-2">
                  <Upload className="w-3 h-3" />
                  Transf.
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-1 text-xs px-2">
                  <History className="w-3 h-3" />
                  Hist.
                </TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-2 bg-muted/80 p-1">
                <TabsTrigger value="settings" className="flex items-center gap-1 text-xs px-2">
                  <Settings className="w-3 h-3" />
                  Config.
                </TabsTrigger>
                <TabsTrigger value="info" className="flex items-center gap-1 text-xs px-2">
                  <Info className="w-3 h-3" />
                  Info
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dispositivos Bluetooth</h2>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  onClick={scanForDevices}
                  disabled={isScanning || !bluetoothSupported}
                  size="sm"
                  className="text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  {isScanning ? (
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                  ) : (
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  )}
                  {isScanning ? "Procurando..." : "Buscar Novos Dispositivos"}
                </Button>

                <Button
                  onClick={async () => {
                    // @ts-ignore
                    if ((navigator as any).bluetooth) {
                      try {
                        setIsScanning(true)
                        setError(null)

                        // Verificar disponibilidade do Bluetooth
                        // @ts-ignore
                        const availability = await (navigator as any).bluetooth.getAvailability()
                        if (!availability) {
                          setError("Bluetooth não está disponível neste dispositivo")
                          setIsScanning(false)
                          return
                        }

                        // Tentar encontrar dispositivos disponíveis
                        try {
                          // @ts-ignore
                          const device = await (navigator as any).bluetooth.requestDevice({
                            acceptAllDevices: true,
                            optionalServices: [
                              "battery_service",
                              "device_information",
                              "heart_rate",
                              "fitness_machine",
                              "human_interface_device",
                              "0000110b-0000-1000-8000-00805f9b34fb", // Audio Sink (corrigido para minúsculas)
                              "generic_access",
                              "generic_attribute",
                              "0000180f-0000-1000-8000-00805f9b34fb", // Battery Service UUID
                              "0000180a-0000-1000-8000-00805f9b34fb", // Device Information Service
                              "0000180d-0000-1000-8000-00805f9b34fb", // Heart Rate Service
                              "00001812-0000-1000-8000-00805f9b34fb", // Human Interface Device
                            ],
                          })

                          if (device) {
                            const deviceType = detectDeviceType(device.name || "")
                            const newDevice: BluetoothDevice = {
                              id: device.id,
                              name: device.name || "Dispositivo Desconhecido",
                              connected: false,
                              type: deviceType,
                  signalStrength: typeof window !== "undefined" ? Math.floor(Math.random() * 5) + 1 : 3,
                              lastSeen: new Date(),
                              paired: false,
                              services: ["basic_connection"],
                              capabilities: getDeviceCapabilities(deviceType),
                            }

                            setDevices((prev) => {
                              const exists = prev.find((d) => d.id === newDevice.id)
                              if (exists) return prev
                              return [...prev, newDevice]
                            })

                            setSuccess("Novo dispositivo encontrado!")
                          }
                        } catch (err: any) {
                          if (err.name === "NotFoundError") {
                            setError("Nenhum dispositivo selecionado")
                          } else if (err.name === "SecurityError") {
                            setError("Acesso ao Bluetooth negado. Verifique as permissões.")
                          } else {
                            setError("Falha ao procurar dispositivos: " + err.message)
                          }
                          console.error("Bluetooth scan error:", err)
                        }
                      } catch (err) {
                        setError("Erro ao verificar disponibilidade do Bluetooth")
                        console.error("Bluetooth availability error:", err)
                      } finally {
                        setIsScanning(false)
                        setTimeout(() => setSuccess(null), 3000)
                      }
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Lista Unificada de Dispositivos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bluetooth className="w-5 h-5" />
                  Todos os Dispositivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {devices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {devices
                      .sort((a, b) => {
                        // Conectados primeiro, depois pareados, depois disponíveis
                        if (a.connected && !b.connected) return -1;
                        if (!a.connected && b.connected) return 1;
                        if (a.paired && !b.paired) return -1;
                        if (!a.paired && b.paired) return 1;
                        return 0;
                      })
                      .map((device) => {
                        const DeviceIcon = getDeviceIcon(device.type);
                        return (
                          <div key={device.id} className="relative group">
                            <div className={`p-3 sm:p-4 rounded-xl border-2 ${device.connected ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${device.connected ? 'bg-green-500' : 'bg-gray-400'}`}> 
                                    <DeviceIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                  </div>
                                  <div>
                                    {editingDeviceName === device.id ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={tempDeviceName}
                                          onChange={(e) => setTempDeviceName(e.target.value)}
                                          className="text-sm h-8"
                                          onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                              updateDeviceName(device.id, tempDeviceName)
                                              setEditingDeviceName(null)
                                              setTempDeviceName("")
                                            }
                                          }}
                                        />
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            updateDeviceName(device.id, tempDeviceName)
                                            setEditingDeviceName(null)
                                            setTempDeviceName("")
                                          }}
                                          className="h-8 px-2"
                                        >
                                          ✓
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setEditingDeviceName(null)
                                            setTempDeviceName("")
                                          }}
                                          className="h-8 px-2"
                                        >
                                          ✕
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                                          {getDisplayName(device)}
                                        </h3>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setEditingDeviceName(device.id)
                                            setTempDeviceName(getDisplayName(device))
                                          }}
                                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    )}
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      {device.connected ? 'Conectado' : device.paired ? 'Pareado' : 'Disponível'}
                                    </p>
                                    {device.capabilities && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {device.capabilities.slice(0, 2).map((cap) => (
                                          <Badge key={cap} variant="outline" className="text-xs px-1 py-0">
                                            {cap.replace("_", " ")}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => device.connected ? disconnectDevice(device.id) : removeDevice(device.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                  <span className="text-gray-600">Última vez:</span>
                                  <span>
                                    {device.lastSeen && typeof device.lastSeen === "object" && "toLocaleTimeString" in device.lastSeen
                                      ? (device.lastSeen as Date).toLocaleTimeString()
                                      : "--"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                  <span className="text-gray-600">Sinal:</span>
                                  <div className="flex items-center gap-1">
                                    <Signal className="w-3 h-3" />
                                    <span>{device.signalStrength != null ? device.signalStrength : "-"}/5</span>
                                  </div>
                                </div>
                                {device.batteryLevel && (
                                  <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-gray-600">Bateria:</span>
                                    <div className="flex items-center gap-1">
                                      <Battery className="w-3 h-3" />
                                      <span>{device.batteryLevel}%</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Ações de conectar/desconectar */}
                              {device.connected ? (
                                <Button
                                  onClick={() => disconnectDevice(device.id)}
                                  variant="outline"
                                  className="w-full text-xs sm:text-sm"
                                  size="sm"
                                >
                                  <Bluetooth className="w-3 h-3 mr-1 sm:mr-2" />
                                  Desconectar
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => connectDevice(device.id)}
                                  variant="outline"
                                  className="w-full text-xs sm:text-sm"
                                  size="sm"
                                >
                                  <Bluetooth className="w-3 h-3 mr-1 sm:mr-2" />
                                  Conectar
                                </Button>
                              )}

                              {/* Conteúdo específico do dispositivo, se conectado */}
                              {device.connected && renderDeviceSpecificContent(device)}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bluetooth className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Nenhum dispositivo encontrado</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Clique em "Procurar Dispositivos" para encontrar dispositivos Bluetooth próximos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Transferências Ativas</h2>
              <Badge variant="secondary">{files.length} transferências</Badge>
            </div>

            {files.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {files.map((file) => (
                      <div key={file.id} className="p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <File className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base text-gray-900 break-all">
                                {file.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatFileSize(file.size)} •{" "}
                                {file.direction === "send" ? "Enviando para" : "Recebendo de"}{" "}
                                <span className="break-all">{file.deviceName}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <Badge
                              variant={
                                file.status === "completed"
                                  ? "default"
                                  : file.status === "error"
                                    ? "destructive"
                                    : file.status === "transferring"
                                      ? "secondary"
                                      : "outline"
                              }
                              className="text-xs"
                            >
                              {file.status === "completed" && "Concluído"}
                              {file.status === "error" && "Erro"}
                              {file.status === "transferring" && "Transferindo"}
                              {file.status === "pending" && "Pendente"}
                              {file.status === "paused" && "Pausado"}
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {file.status === "transferring" && (
                          <div className="space-y-1 sm:space-y-2">
                            <Progress value={file.progress} className="w-full" />
                            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                              <span>{Math.round(file.progress)}% concluído</span>
                              <span>{file.speed ? `${file.speed} KB/s` : ""}</span>
                            </div>
                          </div>
                        )}
                        {/* Botão de download para arquivos recebidos e concluídos */}
                        {file.status === "completed" && file.direction === "receive" && file.downloadUrl && (
                          <a
                            href={file.downloadUrl}
                            download={file.name}
                            className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors border border-green-200 mt-2"
                            title="Baixar arquivo recebido"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Baixar
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma transferência ativa</h3>
                  <p className="text-gray-600">Conecte-se a um dispositivo e envie arquivos para vê-los aqui</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Histórico de Transferências</h2>
              <Badge variant="secondary">{history.length} transferências</Badge>
            </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-2 text-yellow-800 text-sm flex items-center gap-2">
                <History className="w-5 h-5 flex-shrink-0" />
                <span>O histórico é temporário e será apagado automaticamente após 20 dias.</span>
            </div>

            {history.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {history.map((item) => (
                      <div key={item.id} className="p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                                item.direction === "send" ? "bg-blue-100" : "bg-green-100"
                              }`}
                            >
                              {item.direction === "send" ? (
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                              ) : (
                                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base text-gray-900 break-all">
                                {item.fileName}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatFileSize(item.fileSize)} •{" "}
                                {item.direction === "send" ? "Enviado para" : "Recebido de"}{" "}
                                <span className="break-all">{item.deviceName}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right self-end sm:self-auto">
                            <Badge
                              variant={item.status === "completed" ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {item.status === "completed" ? "Sucesso" : "Falhou"}
                            </Badge>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">{item.timestamp.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Duração: {formatDuration(item.duration)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum histórico</h3>
                  <p className="text-gray-600">Suas transferências aparecerão aqui após serem concluídas</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

           {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Configurações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="device-name" className="text-sm">
                      Nome do Dispositivo
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="device-name"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        placeholder="Nome personalizado (visível no app)"
                        className="text-sm flex-1"
                      />
                      <Button onClick={() => {
                        // Salva o nome do dispositivo no localStorage
                        try {
                          localStorage.setItem("deviceName", deviceName)
                        } catch (error) {
                          console.error("Erro ao salvar nome do dispositivo:", error)
                        }
                        setSuccess("Nome do dispositivo salvo!")
                        setTimeout(() => setSuccess(null), 2000)
                      }} size="sm" className="px-4">
                        Salvar
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1 mt-1">
                      <div>
                        <b>Nome do sistema operacional:</b> <span id="host-device-name">{isClient ? osName : "Desconhecido"}</span>
                      </div>
                      <div>
                        <b>Nome personalizado:</b> <span id="custom-device-name">{deviceName}</span>
                      </div>
                      <div className="text-yellow-600 bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded">
                        <b>Aviso:</b> Por limitações de segurança dos navegadores, <b>não é possível exibir o nome Bluetooth real do seu dispositivo</b> nesta página.<br/>
                        O nome Bluetooth (aquele visto por outros dispositivos durante o pareamento) só pode ser alterado ou visualizado nas configurações do sistema operacional.<br/>
                        O nome acima é apenas o nome do sistema operacional detectado, e o nome personalizado é usado apenas neste app.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Bluetooth Ativo</Label>
                      <p className="text-xs sm:text-sm text-gray-600">Ativar/desativar Bluetooth</p>
                    </div>
                    <Switch checked={bluetoothEnabled} onCheckedChange={setBluetoothEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Aceitar Arquivos Automaticamente</Label>
                      <p className="text-xs sm:text-sm text-gray-600">Aceitar transferências sem confirmação</p>
                    </div>
                    <Switch checked={autoAcceptFiles} onCheckedChange={setAutoAcceptFiles} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Mostrar Notificações</Label>
                      <p className="text-xs sm:text-sm text-gray-600">Notificar sobre transferências</p>
                    </div>
                    <Switch checked={showNotifications} onCheckedChange={setShowNotifications} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Modo Offline</Label>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {isOnline ? "Conectado à internet" : "Funcionando offline"}
                      </p>
                    </div>
                    <Badge variant={isOnline ? "default" : "secondary"}>{isOnline ? "Online" : "Offline"}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Configurações de Transferência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="max-file-size" className="text-sm">
                      Tamanho Máximo de Arquivo (MB)
                    </Label>
                    <Input
                      id="max-file-size"
                      type="number"
                      value={maxFileSize}
                      onChange={(e) => setMaxFileSize(Number(e.target.value))}
                      min="1"
                      max="1000"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    <Label className="text-sm">Estatísticas</Label>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">{devices.length}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Dispositivos</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                          {history.filter((h) => h.status === "completed").length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Transferências</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-4">
                    <Label className="text-sm">Histórico de Dispositivos</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                    {deviceCache.length > 0 ? (
                      deviceCache
                        .sort((a, b) => {
                          // Ordena por última vez visto (mais recente primeiro)
                          const aTime = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
                          const bTime = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
                          return bTime - aTime;
                        })
                        .map((device) => {
                          const DeviceIcon = getDeviceIcon(device.type);
                          return (
                            <div
                              key={device.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <DeviceIcon className="w-4 h-4 text-gray-600" />
                                <div>
                                  <p className="text-sm font-medium">{getDisplayName(device)}</p>
                                  <p className="text-xs text-gray-500">
                                    Última vez: {device.lastSeen && typeof device.lastSeen === "object" && "toLocaleString" in device.lastSeen ? (device.lastSeen as Date).toLocaleString() : (typeof device.lastSeen === "string" ? new Date(device.lastSeen).toLocaleString() : "-")}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Tipo: {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                                  </p>
                                  {device.paired && <span className="text-xs text-green-600">Pareado</span>}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingDeviceName(device.id);
                                    setTempDeviceName(getDisplayName(device));
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const updatedCache = deviceCache.filter((d) => d.id !== device.id);
                                    setDeviceCache(updatedCache);
                                    const updatedNames = { ...customDeviceNames };
                                    delete updatedNames[device.id];
                                    setCustomDeviceNames(updatedNames);
                                    try {
                                      localStorage.setItem("bluetoothDeviceCache", JSON.stringify(updatedCache));
                                      localStorage.setItem("customDeviceNames", JSON.stringify(updatedNames));
                                    } catch (error) {
                                      console.error("Erro ao remover do cache:", error);
                                    }
                                  }}
                                  className="h-8 w-8 p-0 text-red-600"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => connectDevice(device.id)}
                                  className="h-8 w-20"
                                >
                                  Conectar
                                </Button>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">Nenhum dispositivo no histórico</p>
                    )}
                    </div>
                    {deviceCache.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeviceCache([])
                          setCustomDeviceNames({})
                          try {
                            localStorage.removeItem("bluetoothDeviceCache")
                            localStorage.removeItem("customDeviceNames")
                          } catch (error) {
                            console.error("Erro ao limpar cache:", error)
                          }
                          setSuccess("Histórico de dispositivos limpo!")
                          setTimeout(() => setSuccess(null), 3000)
                        }}
                        className="w-full"
                      >
                        Limpar Histórico
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Informações sobre Bluetooth</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Sobre o Bluetooth
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Bluetooth é uma tecnologia de comunicação sem fio de curto alcance que permite a troca de dados
                    entre dispositivos próximos.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Características:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Alcance típico de 10 metros</li>
                      <li>Baixo consumo de energia</li>
                      <li>Conexão automática entre dispositivos pareados</li>
                      <li>Suporte a múltiplos dispositivos simultaneamente</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Funcionalidades por Dispositivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Fones: Player de música e controles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Watch className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Relógio: Monitoramento de saúde e fitness</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Celular/Laptop: Transferência de arquivos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Speaker className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Alto-falante: Reprodução de áudio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Controles: Permite jogar minigames, testar botões, vibrar e controlar jogos compatíveis via Bluetooth.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tv className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">TV: Faça uma Transmissão de tela</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Modo Offline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Este aplicativo funciona completamente offline após a instalação, permitindo uso sem conexão com a
                    internet.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recursos Offline:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Conexão e gerenciamento de dispositivos Bluetooth</li>
                      <li>Transferência de arquivos entre dispositivos</li>
                      <li>Player de música para fones de ouvido</li>
                      <li>Monitoramento de saúde para smartwatches</li>
                      <li>Histórico local de transferências</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Compatibilidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">Este aplicativo funciona com a maioria dos dispositivos modernos.</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Dispositivos Suportados:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span>Smartphones</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4" />
                        <span>Laptops</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4" />
                        <span>Fones de Ouvido</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Speaker className="w-4 h-4" />
                        <span>Alto-falantes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Watch className="w-4 h-4" />
                        <span>Smartwatches</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4" />
                        <span>Controles</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <Tv className="w-4 h-4" />
                          <span className="text-sm">TV</span>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" title="Selecionar arquivos para transferência" placeholder="Selecionar arquivos" />
        {/* Snake Game Modal */}
        {activeGame === "snake" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="relative">
              <Button
                onClick={stopMiniGame}
                className="absolute -top-2 -right-2 z-10 h-8 w-8 p-0 rounded-full"
                variant="destructive"
              >
                <X className="w-4 h-4" />
              </Button>
              <SnakeGame
                gamepadIndex={connectedGamepads.find((gp) => gp.connected)?.index}
                onScoreChange={setGameScore}
                active={activeGame === "snake"}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}