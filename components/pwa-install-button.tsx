"use client"

import React, { useEffect, useState } from "react"

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  // Garante renderização client-side para evitar hydration mismatch
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    // Check if app is running in standalone mode
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Check if app was installed previously (flag in localStorage)
    const installedFlag = localStorage.getItem("pwa-installed")
    if (installedFlag === "true") {
      setIsInstalled(true)
    }

    function beforeInstallPromptHandler(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    function appInstalledHandler() {
      console.log("PWA was installed")
      setIsVisible(false)
      setDeferredPrompt(null)
      setIsInstalled(true)
      localStorage.setItem("pwa-installed", "true")
    }

    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler)
    window.addEventListener("appinstalled", appInstalledHandler)

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler)
      window.removeEventListener("appinstalled", appInstalledHandler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isInstalled && !isStandalone) {
      // Open the PWA if installed but user is in browser
      // Redirect to the PWA URL or show a message
      // Here we redirect to the root URL which should open the PWA if installed
      window.location.href = "/"
      return
    }

    if (!deferredPrompt) {
      return
    }
    // @ts-ignore
    deferredPrompt.prompt()
    // @ts-ignore
    const choiceResult = await deferredPrompt.userChoice
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the PWA install prompt")
    } else {
      console.log("User dismissed the PWA install prompt")
    }
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  // Show button if:
  // 1. beforeinstallprompt event fired (isVisible)
  // OR
  // 2. PWA is installed but user is not in standalone mode (show "Abrir App")
  // NÃO mostrar botão dentro do PWA (standalone)
  if (!isClient || isStandalone) {
    return null;
  }
  if (!isVisible && !(isInstalled && !isStandalone)) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: "10px 20px",
        backgroundColor: "#1e40af",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        zIndex: 1000,
      }}
      aria-label={isInstalled && !isStandalone ? "Abrir App" : "Instalar Bluetooth Center"}
    >
      {isInstalled && !isStandalone ? "Abrir App" : "Instalar App"}
    </button>
  )
}
