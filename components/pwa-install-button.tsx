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
    // Checa se o app está registrado como instalado, mesmo em IP local
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
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
    window.addEventListener("focus", updateStatus);
    window.addEventListener("pageshow", updateStatus);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
      window.removeEventListener("appinstalled", appInstalledHandler);
      window.removeEventListener("visibilitychange", updateStatus);
      window.removeEventListener("focus", updateStatus);
      window.removeEventListener("pageshow", updateStatus);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled && !isStandalone) {
      // Tenta abrir o PWA instalado
      try {
        window.open(window.location.origin, "_self");
      } catch {
        window.location.href = "/";
      }
      return;
    }

    // Sempre tenta o prompt nativo primeiro, se possível
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setIsVisible(false);
        setDeferredPrompt(null);
        localStorage.setItem("pwa-installed", "true");
        return;
      } else {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    }

    // Se não houver prompt ou não funcionou, mostra instrução manual
    alert("Para instalar, use o menu do navegador: 'Adicionar à tela inicial'.");
  };


  // Verificar se é mobile
  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

  // Não mostrar nada se não estiver no cliente, se estiver em modo standalone ou se for mobile
  if (!isClient || isStandalone || isMobile) {
    return null;
  }

  // Mostrar "Abrir App" se instalado, mas não em standalone
  if (isInstalled && !isStandalone) {
    return (
      <div className="flex flex-col items-center w-full max-w-xs mx-auto gap-1">
        <Button
          onClick={handleInstallClick}
          variant="secondary"
          className="w-full max-w-[240px] h-10 text-sm sm:w-auto sm:h-10 sm:text-base gap-2 px-3 py-2 rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition-colors"
          aria-label="Abrir App Bluetooth Center"
        >
          <BluetoothLogo style={{ width: 18, height: 18 }} />
          <span className="inline">Abrir App</span>
        </Button>
        <span className="text-xs text-center text-muted-foreground max-w-full break-words sm:hidden">O app já está instalado! Toque para abrir o PWA.</span>
      </div>
    );
  }

  // Mostrar "Instalar App" apenas em desktop
  if (!isInstalled && isVisible) {
    return (
      <div className="flex flex-col items-center w-full max-w-xs mx-auto gap-2">
        <Button
          onClick={handleInstallClick}
          variant="default"
          className="w-full max-w-[240px] h-10 text-sm sm:w-auto sm:h-10 sm:text-base gap-2 px-3 py-2 rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition-colors"
          aria-label="Instalar Bluetooth Center"
        >
          <BluetoothLogo style={{ width: 18, height: 18 }} />
          <span className="inline">Instalar App</span>
        </Button>
        <div className="text-xs text-center text-muted-foreground max-w-xs">
          Para instalar o app, clique no botão acima e siga as instruções do seu navegador.
        </div>
      </div>
    );
  }

  return null;

}
