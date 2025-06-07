"use client"


import React, { useEffect, useState } from "react"

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

  // Mostrar botão apenas se:
  // 1. beforeinstallprompt foi disparado (isVisible)
  // OU
  // 2. PWA está instalado mas não está em standalone (mostrar "Abrir App")
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
        backgroundColor: isInstalled && !isStandalone ? "#059669" : "#1e40af",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        zIndex: 1000,
        fontWeight: 600,
        fontSize: 16,
      }}
      aria-label={isInstalled && !isStandalone ? "Abrir App" : "Instalar Bluetooth Center"}
    >
      {isInstalled && !isStandalone ? "Abrir App" : "Instalar App"}
    </button>
  );
}
