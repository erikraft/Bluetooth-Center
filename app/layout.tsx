import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bluetooth Center",
  description: "Centro completo de transferências Bluetooth - Funciona 100% offline",
  manifest: "/manifest.json",
  themeColor: "#1e40af",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
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
  // Configurações específicas para PWA
  applicationName: "Bluetooth Center",
  keywords: ["bluetooth", "transferencia", "arquivos", "pwa", "offline"],
  authors: [{ name: "Bluetooth Center" }],
  creator: "Bluetooth Center",
  publisher: "Bluetooth Center",
  formatDetection: {
    telephone: false,
  },
  // Meta tags específicas para mobile
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
    <html lang="pt-BR">
      <head>
        {/* Ícones básicos */}
        <link rel="icon" href="/bluetooth-logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/bluetooth-logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/bluetooth-logo.png" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/bluetooth-logo.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/bluetooth-logo.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/bluetooth-logo.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/bluetooth-logo.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/bluetooth-logo.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/bluetooth-logo.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/bluetooth-logo.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/bluetooth-logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/bluetooth-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/bluetooth-logo.png" />

        {/* Meta tags para PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bluetooth Center" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-title" content="Bluetooth Center" />

        {/* Meta tags específicas para Android */}
        <meta name="theme-color" content="#1e40af" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-TileImage" content="/bluetooth-logo.png" />

        {/* Preconnect para melhor performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
      // Registrar Service Worker com estratégia melhorada para PWA
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })
            .then(function(registration) {
              console.log('SW registered successfully:', registration.scope);
              
              // Verificar se há atualizações
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      // Nova versão disponível
                      console.log('Nova versão do app disponível!');
                      if (confirm('Nova versão disponível! Atualizar agora?')) {
                        window.location.reload();
                      }
                    }
                  });
                }
              });
              
              // Escutar mensagens do service worker
              navigator.serviceWorker.addEventListener('message', event => {
                console.log('Mensagem do SW:', event.data);
              });
              
            })
            .catch(function(registrationError) {
              console.log('SW registration failed:', registrationError);
            });
        });
        
        // Detectar quando o app volta online
        window.addEventListener('online', function() {
          console.log('App voltou online');
          // Tentar sincronizar dados
          if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
              return registration.sync.register('background-sync');
            }).catch(err => console.log('Sync registration failed:', err));
          }
        });
        
        // Detectar quando fica offline
        window.addEventListener('offline', function() {
          console.log('App ficou offline - Modo offline ativo');
        });
      } else {
        console.log('Service Worker não suportado');
      }
      
      // Preload de recursos críticos
      const preloadResources = [
        '/bluetooth-logo.png',
        '/connected.mp3'
      ];
      
      preloadResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        if (resource.endsWith('.mp3')) {
          link.as = 'audio';
        } else if (resource.endsWith('.png')) {
          link.as = 'image';
        }
        document.head.appendChild(link);
      });
      
      // Detectar se é PWA instalada
      let displayMode = 'browser';
      if (navigator.standalone) {
        displayMode = 'standalone-ios';
      } else if (window.matchMedia('(display-mode: standalone)').matches) {
        displayMode = 'standalone';
      } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        displayMode = 'minimal-ui';
      } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
        displayMode = 'fullscreen';
      }
      
      console.log('Display mode:', displayMode);
      
      // Adicionar classe CSS baseada no modo de exibição
      document.documentElement.setAttribute('data-display-mode', displayMode);
    `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
