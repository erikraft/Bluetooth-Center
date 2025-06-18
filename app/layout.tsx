import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

// Viewport configuration should be in a separate export
import { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1e40af',
}

export const metadata: Metadata = {
  title: "Bluetooth Center",
  description: "Centro completo de transferências Bluetooth - Funciona 100% offline",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/bluetooth-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "16x16", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/bluetooth-logo.png", sizes: "180x180", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "152x152", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "144x144", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "120x120", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "114x114", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "76x76", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "72x72", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "60x60", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "57x57", type: "image/png" },
    ],
    shortcut: [{ url: "/bluetooth-logo.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bluetooth Center",
    startupImage: [
      {
        url: "/bluetooth-logo.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  applicationName: "Bluetooth Center",
  keywords: ["bluetooth", "transferencia", "arquivos", "pwa", "offline"],
  authors: [{ name: "Bluetooth Center" }],
  creator: "Bluetooth Center",
  publisher: "Bluetooth Center",
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "mobile-web-app-status-bar-style": "default",
    "mobile-web-app-title": "Bluetooth Center",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" dir="ltr" suppressHydrationWarning>
      <body suppressHydrationWarning className={inter.className}>
        {children}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js', {
                      scope: '/',
                      updateViaCache: 'none'
                    }).then(registration => {
                      console.log('✅ Service Worker registrado:', registration.scope);
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker?.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            if (confirm('Nova versão disponível! Atualizar agora?')) {
                              window.location.reload();
                            }
                          }
                        });
                      });
                    }).catch(err => console.warn('❌ Falha ao registrar o Service Worker:', err));
                  });

                  window.addEventListener('online', () => {
                    console.log('🟢 Online');
                    if ('sync' in ServiceWorkerRegistration.prototype) {
                      navigator.serviceWorker.ready
                        .then(reg => reg.sync.register('background-sync'))
                        .catch(err => console.warn('Erro ao registrar background-sync:', err));
                    }
                  });

                  window.addEventListener('offline', () => {
                    console.log('🔴 Offline');
                  });
                }

                const preloadResources = ['/bluetooth-logo.png', '/connected.mp3'];
                preloadResources.forEach(resource => {
                  const link = document.createElement('link');
                  link.rel = 'preload';
                  link.href = resource;
                  link.as = resource.endsWith('.mp3') ? 'audio' : 'image';
                  document.head.appendChild(link);
                });

                // Removido: alteração dinâmica de <html> baseada em APIs do navegador para evitar hydration mismatch
                // let mode = 'browser';
                // if (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
                //   mode = 'standalone';
                // } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
                //   mode = 'fullscreen';
                // }
                // document.documentElement.setAttribute('data-display-mode', mode);

                if ('caches' in window) {
                  caches.keys().then(keys => console.log('📦 Caches existentes:', keys));
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
