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
} from "lucide-react"

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

  // PWA States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  // Settings
  const [autoAcceptFiles, setAutoAcceptFiles] = useState(false)
  const [showNotifications, setShowNotifications] = useState(true)
  const [maxFileSize, setMaxFileSize] = useState(100) // MB
  const [deviceName, setDeviceName] = useState("Meu Dispositivo")

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
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
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    if (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // Criar elemento de áudio
    audioRef.current = new Audio("/connected.mp3")

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
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

  const scanForDevices = async () => {
    if (!navigator.bluetooth) {
      setError("Bluetooth não é suportado neste navegador")
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service", "device_information"],
      })

      if (device) {
        const newDevice: BluetoothDevice = {
          id: device.id,
          name: device.name || "Dispositivo Desconhecido",
          connected: false,
          type: "unknown",
          signalStrength: Math.floor(Math.random() * 5) + 1,
          lastSeen: new Date(),
          paired: false,
          services: ["file_transfer"],
        }

        setDevices((prev) => {
          const exists = prev.find((d) => d.id === newDevice.id)
          if (exists) return prev
          return [...prev, newDevice]
        })

        setSuccess("Dispositivo encontrado!")
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError("Falha ao procurar dispositivos")
      console.error("Bluetooth scan error:", err)
    } finally {
      setIsScanning(false)
    }
  }

  const connectDevice = async (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, connected: true, paired: true, lastSeen: new Date() } : d)),
    )

    // Reproduzir som de conexão
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0
        await audioRef.current.play()
      } catch (error) {
        console.error("Erro ao reproduzir som:", error)
      }
    }

    setSuccess("Dispositivo conectado com sucesso!")
    setTimeout(() => setSuccess(null), 3000)
  }

  const disconnectDevice = (deviceId: string) => {
    setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, connected: false } : d)))
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

  const installPWA = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setIsInstallable(false)
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bluetooth className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Bluetooth Center</h1>
                <p className="text-xs sm:text-sm text-gray-600">Centro completo de transferências Bluetooth</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Status Indicators */}
              <div className="flex gap-1 sm:gap-2">
                <Badge variant={isOnline ? "default" : "secondary"} className="flex items-center gap-1 text-xs">
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isOnline ? "Online" : "Offline"}
                </Badge>
                <Badge
                  variant={bluetoothEnabled ? "default" : "destructive"}
                  className="flex items-center gap-1 text-xs"
                >
                  <Bluetooth className="w-3 h-3" />
                  {bluetoothEnabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              {/* PWA Install */}
              {isInstallable && (
                <Button onClick={installPWA} size="sm" className="text-xs">
                  <Download className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
                  Instalar
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

        <Tabs defaultValue="devices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-1">
            <TabsTrigger value="devices" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3">
              <Bluetooth className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Dispositivos</span>
              <span className="sm:hidden">Disp.</span>
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3">
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Transferências</span>
              <span className="sm:hidden">Transf.</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3">
              <History className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Histórico</span>
              <span className="sm:hidden">Hist.</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config.</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3">
              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Informações</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
          </TabsList>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dispositivos Bluetooth</h2>
              <div className="flex gap-2">
                <Button
                  onClick={scanForDevices}
                  disabled={isScanning || !bluetoothSupported}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  {isScanning ? (
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                  ) : (
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  )}
                  {isScanning ? "Procurando..." : "Procurar Dispositivos"}
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
                                    <h3 className="font-semibold text-sm sm:text-base text-gray-900">{device.name}</h3>
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

                              <Button
                                onClick={() => {
                                  setSelectedDevice(device.id)
                                  fileInputRef.current?.click()
                                }}
                                className="w-full text-xs sm:text-sm"
                                size="sm"
                              >
                                <Upload className="w-3 h-3 mr-1 sm:mr-2" />
                                Enviar Arquivos
                              </Button>
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
                  <div className="grid 