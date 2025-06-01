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
    if (typeof navigator !== "undefined" && navigator.bluetooth) {
      setBluetoothSupported(true)
    } else {
      setBluetoothSupported(false)
    }

    // PWA Install Events com melhorias
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      console.log("PWA: Install prompt ready")
      setIsInstallable(true)

      // Mostrar dica sobre instalação offline
      if (!navigator.onLine) {
        setSuccess("App pode ser instalado mesmo offline! Clique em 'Instalar'")
        setTimeout(() => setSuccess(null), 5000)
      }
    }

    const handleAppInstalled = () => {
      console.log("PWA: App installed successfully")
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      setSuccess("App instalado! Agora funciona 100% offline 🎉")
      setTimeout(() => setSuccess(null), 4000)
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

      // Verificar se é primeira visita offline
      const isFirstVisit = !localStorage.getItem("bluetoothCenterVisited")
      if (isFirstVisit) {
        localStorage.setItem("bluetoothCenterVisited", "true")
        if (!navigator.onLine) {
          setSuccess("Bem-vindo! Este app funciona completamente offline 🚀")
          setTimeout(() => setSuccess(null), 5000)
        }
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // Criar elemento de áudio
    audioRef.current = new Audio("/connected.mp3")

    // Carregar dados salvos
    loadFromLocalStorage()

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

    // Scan automático ao carregar a página (apenas se online)
    const autoScan = async () => {
      if (navigator.bluetooth && navigator.onLine) {
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
      } else if (!navigator.onLine) {
        // Se offline, mostrar mensagem informativa
        setSuccess("Modo offline: Dispositivos salvos carregados do cache local")
        setTimeout(() => setSuccess(null), 4000)
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
            "0000110b-0000-1000-8000-00805f9b34fb", // Audio Sink (corrigido para minúsculas)
            "0000180f-0000-1000-8000-00805f9b34fb", // Battery Service UUID
            "0000180a-0000-1000-8000-00805f9b34fb", // Device Information Service
            "0000180d-0000-1000-8000-00805f9b34fb", // Heart Rate Service
            "00001812-0000-1000-8000-00805f9b34fb", // Human Interface Device
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

      const updatedDevice = devices.find((d) => d.id === deviceId)
      if (updatedDevice) {
        saveDeviceToCache({ ...updatedDevice, connected: true, paired: true })
      }

      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(`Erro ao conectar: ${err.message}`)
      setTimeout(() => setError(null), 3000)
      console.error("Connection error:", err)
    }
  }

  const disconnectDevice = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId)
    setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, connected: false } : d)))

    // Parar música se desconectar fones
    if (device?.type === "headphones") {
      setIsPlaying(false)
      setCurrentTrack(null)
    }
  }

  const removeDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || !selectedDevice) return

    const device = devices.find((d) => d.id === selectedDevice)
    if (!device) return

    const newFiles: FileTransfer[] = Array.from(selectedFiles).map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "pending",
      deviceId: device.id,
      deviceName: device.name,
      direction: "send",
      startTime: new Date(),
    }))

    setFiles((prev) => [...prev, ...newFiles])

    newFiles.forEach((file) => {
      simulateFileTransfer(file.id)
    })
  }

  const simulateFileTransfer = (fileId: string) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "transferring" as const } : f)))

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10 + 5

      if (progress >= 100) {
        progress = 100
        const file = files.find((f) => f.id === fileId)
        if (file) {
          const historyEntry: TransferHistory = {
            id: `hist-${Date.now()}`,
            fileName: file.name,
            fileSize: file.size,
            deviceName: file.deviceName,
            direction: file.direction,
            status: "completed",
            timestamp: new Date(),
            duration: Math.floor((Date.now() - file.startTime.getTime()) / 1000),
          }
          setHistory((prev) => [historyEntry, ...prev])
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: "completed" as const, endTime: new Date() } : f,
          ),
        )
        clearInterval(interval)
      } else {
        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)))
      }
    }, 200)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const installPWA = async () => {
    console.log("Botão de instalação clicado", {
      temPrompt: !!deferredPrompt,
      isInstallable,
      isInstalled,
    })

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log("Escolha do usuário:", outcome)

        if (outcome === "accepted") {
          setIsInstalled(true)
          setIsInstallable(false)
        }

        setDeferredPrompt(null)
      } catch (error) {
        console.error("Erro ao abrir o prompt de instalação:", error)
        setError("Não foi possível abrir o menu de instalação. Tente instalar manualmente pelo menu do navegador.")
        setTimeout(() => setError(null), 5000)
      }
    } else {
      const userAgent = navigator.userAgent.toLowerCase()

      if (userAgent.includes("chrome") || userAgent.includes("edg")) {
        setSuccess(
          "Para instalar: Clique no ícone de instalação na barra de endereços ou nos 3 pontos (⋮) > 'Instalar Bluetooth Center'",
        )
      } else if (userAgent.includes("firefox")) {
        setSuccess("Para instalar: Clique no ícone + na barra de endereços")
      } else if (userAgent.includes("safari")) {
        setSuccess("Para instalar: Clique em Compartilhar > 'Adicionar à Tela de Início'")
      } else {
        setSuccess("Para instalar: Use o menu do seu navegador para encontrar a opção 'Instalar aplicativo'")
      }

      setTimeout(() => setSuccess(null), 5000)
    }
  }

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

  const renderDeviceSpecificContent = (device: BluetoothDevice) => {
    if (!device.connected) return null

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
              </div>
            ) : (
              <p className="text-sm text-gray-600">Nenhuma música selecionada</p>
            )}
          </div>
        )

      case "watch":
        return (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitoramento de Saúde
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{watchData.heartRate} bpm</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>{watchData.steps} passos</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>{watchData.calories} cal</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <span>{watchData.notifications} notif.</span>
              </div>
            </div>
            <div className="mt-2 flex gap-1">
              <Button size="sm" variant="outline" className="text-xs">
                <Phone className="w-3 h-3 mr-1" />
                Chamadas
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <MessageSquare className="w-3 h-3 mr-1" />
                Mensagens
              </Button>
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

      default:
        return (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Dispositivo conectado com funcionalidades básicas</p>
          </div>
        )
    }
  }

  const saveDeviceName = () => {
    try {
      localStorage.setItem("deviceName", deviceName)
      setSuccess("Nome do dispositivo salvo com sucesso!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError("Erro ao salvar nome do dispositivo")
      setTimeout(() => setError(null), 3000)
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

              {/* PWA Install */}
              {!isInstalled && (
                <Button
                  onClick={installPWA}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors flex-shrink-0 px-2 sm:px-4"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="ml-1 sm:ml-2 text-xs sm:text-sm">Instalar</span>
                </Button>
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
                    if (navigator.bluetooth) {
                      try {
                        setIsScanning(true)
                        setError(null)

                        // Verificar disponibilidade do Bluetooth
                        const availability = await navigator.bluetooth.getAvailability()
                        if (!availability) {
                          setError("Bluetooth não está disponível neste dispositivo")
                          setIsScanning(false)
                          return
                        }

                        // Tentar encontrar dispositivos disponíveis
                        try {
                          const device = await navigator.bluetooth.requestDevice({
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

            {/* Connected Devices */}
            {devices.filter((d) => d.connected).length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Dispositivos Conectados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {devices
                      .filter((d) => d.connected)
                      .map((device) => {
                        const DeviceIcon = getDeviceIcon(device.type)
                        return (
                          <div key={device.id} className="relative group">
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
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
                                          ✏️
                                        </Button>
                                      </div>
                                    )}
                                    <p className="text-xs sm:text-sm text-gray-600">Conectado</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => disconnectDevice(device.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                  <span className="text-gray-600">Sinal:</span>
                                  <div className="flex items-center gap-1">
                                    <Signal className="w-3 h-3" />
                                    <span>{device.signalStrength}/5</span>
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

                              {renderDeviceSpecificContent(device)}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Bluetooth className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhum dispositivo conectado</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Clique em "Procurar Dispositivos" para encontrar dispositivos próximos
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Available Devices */}
            {devices.filter((d) => !d.connected).length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bluetooth className="w-5 h-5" />
                    Dispositivos Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {devices
                      .filter((d) => !d.connected)
                      .map((device) => {
                        const DeviceIcon = getDeviceIcon(device.type)
                        return (
                          <div key={device.id} className="relative group">
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-400 rounded-full flex items-center justify-center">
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
                                          ✏️
                                        </Button>
                                      </div>
                                    )}
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      {device.paired ? "Pareado" : "Disponível"}
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
                                  onClick={() => removeDevice(device.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                  <span className="text-gray-600">Última vez:</span>
                                  <span>{device.lastSeen.toLocaleTimeString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                  <span className="text-gray-600">Sinal:</span>
                                  <div className="flex items-center gap-1">
                                    <Signal className="w-3 h-3" />
                                    <span>{device.signalStrength}/5</span>
                                  </div>
                                </div>
                              </div>

                              <Button
                                onClick={() => connectDevice(device.id)}
                                variant="outline"
                                className="w-full text-xs sm:text-sm"
                                size="sm"
                              >
                                <Bluetooth className="w-3 h-3 mr-1 sm:mr-2" />
                                Conectar
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              !isScanning && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Bluetooth className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Nenhum dispositivo disponível</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Clique em "Procurar Dispositivos" para encontrar dispositivos Bluetooth próximos
                    </p>
                  </CardContent>
                </Card>
              )
            )}
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
                        placeholder="Nome que outros dispositivos verão"
                        className="text-sm flex-1"
                      />
                      <Button onClick={saveDeviceName} size="sm" className="px-4">
                        Salvar
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Este nome será exibido para outros dispositivos quando eles procurarem por você
                    </p>
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
                        deviceCache.map((device) => {
                          const DeviceIcon = getDeviceIcon(device.type)
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
                                    Última vez: {device.lastSeen.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingDeviceName(device.id)
                                    setTempDeviceName(getDisplayName(device))
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  ✏️
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const updatedCache = deviceCache.filter((d) => d.id !== device.id)
                                    setDeviceCache(updatedCache)
                                    const updatedNames = { ...customDeviceNames }
                                    delete updatedNames[device.id]
                                    setCustomDeviceNames(updatedNames)

                                    try {
                                      localStorage.setItem("bluetoothDeviceCache", JSON.stringify(updatedCache))
                                      localStorage.setItem("customDeviceNames", JSON.stringify(updatedNames))
                                    } catch (error) {
                                      console.error("Erro ao remover do cache:", error)
                                    }
                                  }}
                                  className="h-8 w-8 p-0 text-red-600"
                                >
                                  🗑️
                                </Button>
                              </div>
                            </div>
                          )
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
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
