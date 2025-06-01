"use client"

import React, { useEffect, useState } from "react"

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    function beforeInstallPromptHandler(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler)

    window.addEventListener("appinstalled", () => {
      console.log("PWA was installed")
      setIsVisible(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler)
      window.removeEventListener("appinstalled", () => {})
    }
  }, [])

  const handleInstallClick = async () => {
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

  if (!isVisible) {
    return null
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
      aria-label="Install Bluetooth Center"
    >
      Instalar App
    </button>
  )
}
