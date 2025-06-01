import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bluetooth Center",
    short_name: "BluetoothCenter",
    description: "Centro completo de transferências Bluetooth - Funciona 100% offline",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0041a3",
    orientation: "portrait",
    scope: "/",
    categories: ["utilities", "productivity", "tools"],
    lang: "pt-BR",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
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
      {
        src: "/bluetooth-logo.png",
        sizes: "16x16",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/bluetooth-logo.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/bluetooth-logo.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any",
      },
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
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/bluetooth-logo.png",
        sizes: "256x256",
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
      },
      {
        src: "/screenshot-2.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Transferência de arquivos via Bluetooth",
      },
    ],
    // Configurações PWA avançadas
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    edge_side_panel: {
      preferred_width: 400,
    },
    // Protocolo personalizado para abrir arquivos
    protocol_handlers: [
      {
        protocol: "bluetooth",
        url: "/?protocol=%s",
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
    // Configurações offline
    offline_enabled: true,
    // Configurações de cache
    cache_strategy: "CacheFirst",
  }
}
