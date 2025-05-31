import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bluetooth Center",
    short_name: "BluetoothCenter",
    description: "Centro completo de transferências Bluetooth",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0041a3",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon-512x512.png",
        sizes: "512x512",
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
    categories: ["utilities", "productivity"],
    lang: "pt-BR",
    dir: "ltr",
  }
}
