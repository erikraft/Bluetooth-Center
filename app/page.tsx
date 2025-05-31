"use client"

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
  Shield,
  Zap,
  Globe,
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
} from "lucide-react"
import { SnakeGame } from "@/components/snake-game"

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
    | "unknown"
  batteryLevel?: number
  signalStrength: number
  lastSeen: Date
  paired: boolean
  services: string[]
  capabilities?: string[]
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

export default function BluetoothCenter() {
  const [isOnline, setIsOnline] = useState(true)
  const [bluetoothSupported, setBluetoothSupported] = useState(true)
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true)
  const [devices, setDevices] = useState<BluetoothDevice[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [files, setFiles] = useState<FileTransfer[]>([])
  const [history, setHistory] = useState<TransferHistory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [activeTab, setActiveTab] = useState("devices")
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  // Music Player State
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
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

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
      if (navigator.onLine) {
        setSuccess("Conexão com internet restaurada!")
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError("Sem conexão com internet - Modo offline ativo")
        setTimeout(() => setError(null), 3000)
      }
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    // Verificar suporte ao Bluetooth
    if (typeof navigator !== "undefined" && navigator.bluetooth) {
      setBluetoothSupported(true)
    } else {
      setBluetoothSupported(false)
    }

    // PWA Install Events
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      console.log("Evento beforeinstallprompt capturado e armazenado")
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      console.log("App foi instalado com sucesso")
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      setSuccess("Aplicativo instalado com sucesso!")
      setTimeout(() => setSuccess(null), 3000)
    }

    // Verificar se já está instalado
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://")

      setIsInstalled(isStandalone)

      if (!isStandalone) {
        setIsInstallable(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // Criar elemento de áudio
    audioRef.current = new Audio("/connected.mp3")

    // Simular dados do relógio em tempo real
    const watchInterval = setInterval(() => {
      setWatchData((prev) => ({
        ...prev,
        heartRate: Math.floor(Math.random() * 20) + 65, // 65-85 bpm
        steps: prev.steps + Math.floor(Math.random() * 5),
        calories: prev.calories + Math.floor(Math.random() * 2),
      }))
    }, 5000)

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

    window.addEventListener("gamepadconnected", handleGamepadConnected)
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected)

    // Gamepad polling
    const gamepadInterval = setInterval(detectGamepads, 100)

    // Scan automático ao carregar a página
    const autoScan = async () => {
      if (navigator.bluetooth) {
        try {
          const availability = await navigator.bluetooth.getAvailability()
          if (availability) {
            // Tentar carregar dispositivos pareados automaticamente
            try {
              const devices = await navigator.bluetooth.getDevices()
              devices.forEach((device) => {
                const deviceType = detectDeviceType(device.name || "")
                const newDevice: BluetoothDevice = {
                  id: device.id,
                  name: device.name || "Dispositivo Desconhecido",
                  connected: false,
                  type: deviceType,
                  signalStrength: Math.floor(Math.random() * 5) + 1,
                  lastSeen: new Date(),
                  paired: true,
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
                setSuccess(`${devices.length} dispositivo(s) pareado(s) carregado(s) automaticamente!`)
                setTimeout(() => setSuccess(null), 3000)
              }
            } catch (err) {
              console.log("Não foi possível carregar dispositivos pareados automaticamente")
            }
          }
        } catch (err) {
          console.log("Bluetooth não disponível para scan automático")
        }
      }
    }

    // Executar scan automático após 1 segundo
    setTimeout(autoScan, 1000)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      clearInterval(watchInterval)
      window.removeEventListener("gamepadconnected", handleGamepadConnected)
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected)
      clearInterval(gamepadInterval)
    }
  }, [])

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
      unknown: Bluetooth,
    }
    return iconMap[type] || Bluetooth
  }

  const getDeviceCapabilities = (type: BluetoothDevice["type"]): string[] => {
    const capabilityMap = {
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
      unknown: ["basic_connection"],
    }
    return capabilityMap[type] || ["basic_connection"]
  }

  const scanForDevices = async () => {
    if (!navigator.bluetooth) {
      setError("Bluetooth não é suportado neste navegador")
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      // Primeiro, verificar se o Bluetooth está disponível
      const availability = await navigator.bluetooth.getAvailability()
      if (!availability) {
        setError("Bluetooth não está disponível neste dispositivo")
        setIsScanning(false)
        return
      }

      // Tentar obter dispositivos já pareados
      try {
        const devices = await navigator.bluetooth.getDevices()
        console.log("Dispositivos pareados encontrados:", devices)

        devices.forEach((device) => {
          const deviceType = detectDeviceType(device.name || "")
          const newDevice: BluetoothDevice = {
            id: device.id,
            name: device.name || "Dispositivo Desconhecido",
            connected: false,
            type: deviceType,
            signalStrength: Math.floor(Math.random() * 5) + 1,
            lastSeen: new Date(),
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
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            "battery_service",
            "device_information",
            "heart_rate",
            "fitness_machine",
            "human_interface_device",
            "audio_sink",
            "generic_access",
            "generic_attribute",
          ],
        })

        if (device) {
          const deviceType = detectDeviceType(device.name || "")
          const newDevice: BluetoothDevice = {
            id: device.id,
            name: device.name || "Dispositivo Desconhecido",
            connected: false,
            type: deviceType,
            signalStrength: Math.floor(Math.random() * 5) + 1,
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
      name.includes("mi_")
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
      name.includes("ps5")
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
    const device = devices.find((d) => d.id === deviceId)
    if (!device) return

    try {
      // Se o dispositivo já está pareado, tentar conectar diretamente
      if (device.paired) {
        // Simular conexão para dispositivos pareados
        setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, connected: true, lastSeen: new Date() } : d)))
      } else {
        // Para novos dispositivos, usar requestDevice
        const bluetoothDevice = await navigator.bluetooth.requestDevice({
          filters: [{ name: device.name }],
          optionalServices: [
            "battery_service",
            "device_information",
            "heart_rate",
            "fitness_machine",
            "human_interface_device",
            "audio_sink",
          ],
        })

        if (bluetoothDevice) {
          // Tentar conectar ao GATT server
          const server = await bluetoothDevice.gatt?.connect()
          if (server) {
            setDevices((prev) =>
              prev.map((d) => (d.id === deviceId ? { ...d, connected: true, paired: true, lastSeen: new Date() } : d)),
            )
          }
        }
      }

      // Reproduzir som de conexão
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0
          await audioRef.current.play()
        } catch (error) {
          console.error("Erro ao reproduzir som:", error)
        }
      }

      // Configurar funcionalidades específicas do dispositivo
      if (device.type === "headphones" && playlist.length > 0) {
        setCurrentTrack(playlist[0])
        setSuccess("Fones conectados! Player de música disponível.")
      } else if (device.type === "watch") {
        setSuccess("Smartwatch conectado! Monitoramento de saúde ativo.")
      } else if (device.type === "gamepad") {
        setSuccess("Controle conectado! Jogos e testes disponíveis.")
      } else {
        setSuccess("Dispositivo conectado com sucesso!")
      }

      setTimeo