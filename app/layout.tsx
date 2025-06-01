import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bluetooth Center",
  description: "Centro completo de transferências Bluetooth",
  manifest: "/manifest.json",
  themeColor: "#0041a3",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: [
      { url: "/bluetooth-logo.png" },
      { url: "/bluetooth-logo.png", sizes: "16x16", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/bluetooth-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/bluetooth-logo.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/bluetooth-logo.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bluetooth Center",
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
        <link rel="icon" href="/bluetooth-logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/bluetooth-logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/bluetooth-logo.png" />
        <link rel="apple-touch-icon" href="/bluetooth-logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bluetooth Center" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
      // Registrar Service Worker com estratégia melhorada
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js')
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
    `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
