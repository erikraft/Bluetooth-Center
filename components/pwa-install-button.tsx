"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import BluetoothLogo from "@/components/BluetoothLogo"

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isClient, setIsClient] = useState(false);

  // Função para checar se está em standalone
  const checkStandalone = () => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  };

  // Função para checar se está instalado
  const checkInstalled = () => {
    // iOS não dispara appinstalled, então checa por outros meios
    if (checkStandalone()) return true;
    const installedFlag = localStorage.getItem("pwa-installed");
    return installedFlag === "true";
  };

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    // Atualiza status de standalone e instalado
    const updateStatus = () => {
      setIsStandalone(checkStandalone());
      setIsInstalled(checkInstalled());
    };
    updateStatus();

    function beforeInstallPromptHandler(e: any) {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    }

    function appInstalledHandler() {
      setIsVisible(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
      localStorage.setItem("pwa-installed", "true");
      updateStatus();
    }

    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    window.addEventListener("appinstalled", appInstalledHandler);
    window.addEventListener("visibilitychange", updateStatus);

    // Atualiza status ao focar a janela (caso o usuário instale/desinstale manualmente)
    window.addEventListener("focus", updateStatus);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
      window.removeEventListener("appinstalled", appInstalledHandler);
      window.removeEventListener("visibilitychange", updateStatus);
      window.removeEventListener("focus", updateStatus);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled && !isStandalone) {
      // Tenta abrir o PWA instalado
      // Para Android/Chrome, window.location.href = "/" pode abrir o app
      // Para outros, tente window.open
      try {
        window.open(window.location.origin, "_self");
      } catch {
        window.location.href = "/";
      }
      return;
    }

    if (!deferredPrompt) {
      // Caso não tenha prompt, mostra instrução
      alert("Para instalar, use o menu do navegador: 'Adicionar à tela inicial'.");
      return;
    }
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult && choiceResult.outcome === "accepted") {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem("pwa-installed", "true");
    } else {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  // Mostrar botão:
  // 1. Se não está instalado, mostrar "Instalar App" quando isVisible
  // 2. Se está instalado mas não está em standalone, mostrar "Abrir App"
  // 3. Nunca mostrar se está em standalone
  if (!isClient || isStandalone) {
    return null;
  }

  if (isInstalled && !isStandalone) {
    return (
      <Button
        onClick={handleInstallClick}
        variant="secondary"
        className="gap-2 px-3 py-2 rounded-lg font-semibold text-base shadow-sm hover:bg-primary/90 transition-colors"
        aria-label="Abrir App Bluetooth Center"
      >
        <BluetoothLogo style={{ width: 20, height: 20 }} />
        <span className="hidden sm:inline">Abrir App</span>
      </Button>
    );
  }

  if (!isInstalled && isVisible) {
    return (
      <Button
        onClick={handleInstallClick}
        variant="default"
        className="gap-2 px-3 py-2 rounded-lg font-semibold text-base shadow-sm hover:bg-primary/90 transition-colors"
        aria-label="Instalar Bluetooth Center"
      >
        <BluetoothLogo style={{ width: 20, height: 20 }} />
        <span className="hidden sm:inline">Instalar App</span>
      </Button>
    );
  }

  return null;
}
