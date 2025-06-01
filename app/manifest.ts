import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bluetooth Center",
    short_name: "Bluetooth Center",
    description: "Centro completo de transferências Bluetooth - Funciona 100% offline",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e40af",
    orientation: "portrait-primary",
    scope: "/",
    categories: ["utilities", "productivity", "tools"],
    lang: "pt-BR",
    dir: "ltr",
    prefer_related_applications: false,
    // Configurações específicas para PWA adequada
    display_override: ["standalone", "minimal-ui", "browser"],
    icons: [
      // Ícones principais para PWA
      {
        src: "/bluetooth-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/bluetooth-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Ícones maskable para Android
      {
        src: "/bluetooth-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/bluetooth-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      // Ícones adicionais para melhor compatibilidade
      {
        src: "/bluetooth-logo.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/bluetooth-logo.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/bluetooth-logo.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/bluetooth-logo.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/bluetooth-logo.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/bluetooth-logo.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-1.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Tela principal do Bluetooth Center",
        form_factor: "wide",
      },
      {
        src: "/screenshot-2.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Transferência de arquivos via Bluetooth",
        form_factor: "wide",
      },
    ],
    // Configurações de compartilhamento
    share_target: {
      action: "/",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        files: [
          {
            name: "file",
            accept: ["*/*"],
          },
        ],
      },
    },
    // Protocolo personalizado
    protocol_handlers: [
      {
        protocol: "bluetooth",
        url: "/?protocol=%s",
      },
    ],
    // Configurações específicas para instalação adequada
    id: "/",
    launch_handler: {
      client_mode: "navigate-existing",
    },
  }
}
