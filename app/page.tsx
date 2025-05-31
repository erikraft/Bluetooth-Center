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
  const [activeTab, setActiveTab] = useState("devices")
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

    // PWA Install Events - Capturar o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      // Impedir o comportamento padrão
      e.preventDefault()
      // Armazenar o evento para uso posterior
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

      // Se não estiver instalado, definir como instalável para mostrar o botão
      if (!isStandalone) {
        setIsInstallable(true)
      }
    }

    // Adicionar listeners para eventos de instalação
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
    console.log("Botão de instalação clicado", {
      temPrompt: !!deferredPrompt,
      isInstallable,
      isInstalled,
    })

    if (deferredPrompt) {
      try {
        // Isso abrirá o menu de instalação nativo do Chrome com screenshots
        deferredPrompt.prompt()

        // Aguardar a escolha do usuário
        const { outcome } = await deferredPrompt.userChoice
        console.log("Escolha do usuário:", outcome)

        if (outcome === "accepted") {
          setIsInstalled(true)
          setIsInstallable(false)
        }

        // Limpar o prompt após o uso
        setDeferredPrompt(null)
      } catch (error) {
        console.error("Erro ao abrir o prompt de instalação:", error)
        setError("Não foi possível abrir o menu de instalação. Tente instalar manualmente pelo menu do navegador.")
        setTimeout(() => setError(null), 5000)
      }
    } else {
      // Se não temos o prompt, mostrar instruções para instalação manual
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
                <p className="text-xs sm:text-sm text-gray-600 truncate">Centro completo de transferências Bluetooth</p>
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

              {/* PWA Install - Aparece em todos os dispositivos quando não instalado */}
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
                                    <h3 className="font-semibold text-sm sm:text-base text-gray-900">{device.name}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      {device.paired ? "Pareado" : "Disponível"}
                                    </p>
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
                    <Input
                      id="device-name"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      placeholder="Nome que outros dispositivos verão"
                      className="text-sm"
                    />
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
                    Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    O Bluetooth moderno inclui várias camadas de segurança para proteger suas transferências.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recursos de Segurança:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Criptografia AES-128</li>
                      <li>Autenticação de dispositivos</li>
                      <li>Pareamento seguro</li>
                      <li>Controle de acesso por usuário</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Versões do Bluetooth
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Bluetooth 5.0+</span>
                      <Badge>Recomendado</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Bluetooth 4.0</span>
                      <Badge variant="secondary">Compatível</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Bluetooth 3.0</span>
                      <Badge variant="outline">Limitado</Badge>
                    </div>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
      </main>
    </div>
  )
}
