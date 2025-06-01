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

        {/* Meta tags para PWA - ESSENCIAIS para Chrome Mobile */}
        <meta name="application-name" content="Bluetooth Center" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bluetooth Center" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="none" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-TileImage" content="/bluetooth-logo.png" />
        <meta name="theme-color" content="#1e40af" />

        {/* Preconnect para melhor performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
// Registrar Service Worker IMEDIATAMENTE para PWA
if ('serviceWorker' in navigator) {
  // Registrar imediatamente, não esperar load
  navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    updateViaCache: 'none'
  })
    .then(function(registration) {
      console.log('SW registered successfully:', registration.scope);
      
      // Verificar se há atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Nova versão do app disponível!');
              if (confirm('Nova versão disponível! Atualizar agora?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
    })
    .catch(function(registrationError) {
      console.log('SW registration failed:', registrationError);
    });
    
  // Detectar quando o app volta online
  window.addEventListener('online', function() {
    console.log('App voltou online');
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

// Detectar se é PWA instalada - MELHORADO
let displayMode = 'browser';
const mqStandalone = '(display-mode: standalone)';
const mqFullscreen = '(display-mode: fullscreen)';

if (navigator.standalone || window.matchMedia(mqStandalone).matches) {
  displayMode = 'standalone';
} else if (window.matchMedia(mqFullscreen).matches) {
  displayMode = 'fullscreen';
}

console.log('Display mode:', displayMode);
document.documentElement.setAttribute('data-display-mode', displayMode);

// Forçar atualização do cache para PWA
if ('caches' in window) {
  caches.keys().then(names => {
    console.log('Cache names:', names);
  });
}
`,
          }}
        />
      </head>
<body className={inter.className}>
  {children}
  <script
    dangerouslySetInnerHTML={{
      __html: `
        // This script is already in layout.tsx for service worker registration and other logic
      `,
    }}
  />
  <div id="pwa-install-button-root"></div>
</body>
    </html>
  )
}
