const CACHE_NAME = "bluetooth-center-v4"
const OFFLINE_CACHE = "bluetooth-center-offline-v4"

// Recursos essenciais que devem ser sempre cacheados
const ESSENTIAL_RESOURCES = [
  "/",
  "/manifest.json",
  "/bluetooth-logo.png",
  "/connected.mp3",
  "/disconnected.mp3",
  "/favicon.ico",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/favicon-192x192.png",
  "/favicon-512x512.png",
  "/apple-touch-icon.png",
  // Cache arquivos estáticos do Next.js
  ...self.__NEXT_STATIC_FILES__ || []
]
// Detectar e adicionar arquivos estáticos do Next.js ao cache ESSENTIAL_RESOURCES
self.addEventListener("install", (event) => {
  if (self.registration && self.registration.scope) {
    // Buscar arquivos estáticos do Next.js
    fetch("/_next/static/manifest.json")
      .then((res) => res.json())
      .then((manifest) => {
        if (manifest && Array.isArray(manifest.files)) {
          self.__NEXT_STATIC_FILES__ = manifest.files.map((f) => "/_next/static/" + f);
        }
      })
      .catch(() => {});
  }
});

// Recursos que podem ser cacheados opcionalmente
const OPTIONAL_RESOURCES = ["/screenshot-1.png", "/screenshot-2.png"]

// Páginas offline de fallback
const OFFLINE_FALLBACK_PAGE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bluetooth Center - Offline</title>
  <meta name="theme-color" content="#1e40af">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 2rem;
    }
    p {
      margin: 10px 0;
      opacity: 0.9;
    }
    .retry-btn {
      background: #10b981;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
      transition: background 0.3s;
    }
    .retry-btn:hover {
      background: #059669;
    }
    .features {
      margin-top: 30px;
      text-align: left;
    }
    .feature {
      margin: 10px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status {
      margin-top: 20px;
      padding: 10px;
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      font-size: 14px;
    }
    .install-hint {
      margin-top: 20px;
      padding: 15px;
      background: rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📱</div>
    <h1>Bluetooth Center</h1>
    <p>Você está offline, mas o app ainda funciona!</p>
    
    <div class="status" id="status">
      🔍 Verificando conexão...
    </div>
    
    <div class="features">
      <div class="feature">
        ✅ Gerenciar dispositivos Bluetooth
      </div>
      <div class="feature">
        ✅ Transferir arquivos localmente
      </div>
      <div class="feature">
        ✅ Player de música
      </div>
      <div class="feature">
        ✅ Jogos com controle
      </div>
    </div>
    
    <div class="install-hint">
      💡 <strong>Dica:</strong> Instale este app na sua tela inicial para acesso rápido!
    </div>
    
    <button class="retry-btn" onclick="window.location.reload()">
      🔄 Tentar Novamente
    </button>
    
    <p style="font-size: 12px; margin-top: 20px; opacity: 0.7;">
      Este app funciona 100% offline após o primeiro carregamento
    </p>
  </div>

  <script>
    // Verificar status da conexão
    function updateStatus() {
      const status = document.getElementById('status');
      if (navigator.onLine) {
        status.innerHTML = '🌐 Conectado - Redirecionando...';
        status.style.background = 'rgba(16, 185, 129, 0.3)';
        setTimeout(() => window.location.reload(), 1000);
      } else {
        status.innerHTML = '📱 Modo Offline - App Funcional';
        status.style.background = 'rgba(245, 158, 11, 0.3)';
      }
    }

    // Verificar a cada 3 segundos
    updateStatus();
    setInterval(updateStatus, 3000);

    // Escutar mudanças de conexão
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
  </script>
</body>
</html>
`

// Install event - Cache agressivo de recursos essenciais
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing v3...")

  event.waitUntil(
    Promise.all([
      // Cache principal
      caches
        .open(CACHE_NAME)
        .then((cache) => {
          console.log("Service Worker: Caching essential resources")
          return cache.addAll(ESSENTIAL_RESOURCES).catch((error) => {
            console.error("Service Worker: Failed to cache essential resources", error)
            // Tentar cachear individualmente
            return Promise.allSettled(
              ESSENTIAL_RESOURCES.map((url) =>
                cache.add(url).catch((err) => console.log(`Failed to cache ${url}:`, err)),
              ),
            )
          })
        }),

      // Cache offline
      caches
        .open(OFFLINE_CACHE)
        .then((cache) => {
          console.log("Service Worker: Caching offline fallback")
          return cache.put(
            "/offline.html",
            new Response(OFFLINE_FALLBACK_PAGE, {
              headers: { "Content-Type": "text/html" },
            }),
          )
        }),

      // Cache opcional (não bloqueia instalação)
      caches
        .open(CACHE_NAME)
        .then((cache) => {
          return Promise.allSettled(
            OPTIONAL_RESOURCES.map((url) =>
              cache.add(url).catch((err) => console.log(`Optional resource ${url} not cached:`, err)),
            ),
          )
        }),
    ]),
  )

  // Força ativação imediata
  self.skipWaiting()
})

// Activate event - Limpa caches antigos e toma controle
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating v3...")

  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
                console.log("Service Worker: Deleting old cache", cacheName)
                return caches.delete(cacheName)
              }
            }),
          )
        }),

      // Tomar controle imediatamente
      self.clients.claim(),
    ]),
  )
})

// Fetch event - Estratégia híbrida inteligente
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requisições que não são GET
  if (request.method !== "GET") {
    return
  }

  // Ignorar requisições para outros domínios
  if (url.origin !== location.origin) {
    return
  }

  // Estratégia especial para página principal
  if (url.pathname === "/" || url.pathname === "/index.html") {
    event.respondWith(handleMainPage(request))
    return
  }

  // Estratégia para recursos estáticos
  if (isStaticResource(url.pathname)) {
    event.respondWith(handleStaticResource(request))
    return
  }

  // Estratégia padrão para outros recursos
  event.respondWith(handleOtherResources(request))
})

// Função para lidar com a página principal
async function handleMainPage(request) {
  try {
    // Tentar cache primeiro (mais rápido)
    const cachedResponse = await caches.match(request)

    if (navigator.onLine) {
      // Se online, tentar buscar versão atualizada
      try {
        const networkResponse = await fetch(request)
        if (networkResponse && networkResponse.status === 200) {
          // Atualizar cache com nova versão
          const cache = await caches.open(CACHE_NAME)
          cache.put(request, networkResponse.clone())
          return networkResponse
        }
      } catch (networkError) {
        console.log("Network failed, using cache")
      }
    }

    // Retornar versão em cache se disponível
    if (cachedResponse) {
      return cachedResponse
    }

    // Se não tem cache e está offline, mostrar página offline
    const offlineResponse = await caches.match("/offline.html")
    return (
      offlineResponse ||
      new Response(OFFLINE_FALLBACK_PAGE, {
        headers: { "Content-Type": "text/html" },
      })
    )
  } catch (error) {
    console.error("Error handling main page:", error)
    return new Response(OFFLINE_FALLBACK_PAGE, {
      headers: { "Content-Type": "text/html" },
    })
  }
}

// Função para recursos estáticos (Cache First)
async function handleStaticResource(request) {
  try {
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      // Se online, atualizar cache em background
      if (navigator.onLine) {
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response.clone())
              })
            }
          })
          .catch(() => {}) // Falha silenciosa
      }
      return cachedResponse
    }

    // Se não está em cache, tentar buscar da rede
    if (navigator.onLine) {
      const networkResponse = await fetch(request)
      if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(CACHE_NAME)
        cache.put(request, networkResponse.clone())
        return networkResponse
      }
    }

    // Fallback para recursos não encontrados
    throw new Error("Resource not available")
  } catch (error) {
    console.log(`Static resource ${request.url} not available offline`)
    return new Response("Resource not available offline", {
      status: 503,
      statusText: "Service Unavailable",
    })
  }
}

// Função para outros recursos (Network First com timeout)
async function handleOtherResources(request) {
  try {
    if (navigator.onLine) {
      // Tentar rede com timeout
      const networkResponse = await Promise.race([
        fetch(request),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Network timeout")), 3000)),
      ])

      if (networkResponse && networkResponse.status === 200) {
        // Cachear se for cacheável
        if (isCacheable(request)) {
          const cache = await caches.open(CACHE_NAME)
          cache.put(request, networkResponse.clone())
        }
        return networkResponse
      }
    }

    // Fallback para cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    throw new Error("Resource not available")
  } catch (error) {
    console.log(`Resource ${request.url} not available:`, error.message)
    return new Response("Resource not available", {
      status: 503,
      statusText: "Service Unavailable",
    })
  }
}

// Função para verificar se é recurso estático
function isStaticResource(pathname) {
  const staticExtensions = [".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".mp3"]
  return (
    staticExtensions.some((ext) => pathname.endsWith(ext)) ||
    pathname.includes("/_next/static/") ||
    pathname.includes("/favicon")
  )
}

// Função para verificar se deve ser cacheado
function isCacheable(request) {
  const url = new URL(request.url)
  return isStaticResource(url.pathname) || url.pathname === "/" || url.pathname.startsWith("/api/") === false
}

// Sincronização em background
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("Service Worker: Background sync triggered")
    event.waitUntil(
      // Sincronizar dados quando voltar online
      syncWhenOnline(),
    )
  }
})

async function syncWhenOnline() {
  try {
    // Verificar se há dados para sincronizar
    const cache = await caches.open(CACHE_NAME)
    const requests = await cache.keys()

    console.log(`Service Worker: ${requests.length} items in cache`)

    // Aqui você pode implementar lógica de sincronização específica
    return Promise.resolve()
  } catch (error) {
    console.error("Sync error:", error)
  }
}

// Notificações push
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received")

  const options = {
    body: event.data ? event.data.text() : "Bluetooth Center está funcionando offline!",
    icon: "/favicon-192x192.png",
    badge: "/favicon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Abrir App",
        icon: "/favicon-192x192.png",
      },
      {
        action: "close",
        title: "Fechar",
        icon: "/favicon-192x192.png",
      },
    ],
    requireInteraction: false,
    silent: false,
  }

  event.waitUntil(self.registration.showNotification("Bluetooth Center", options))
})

// Clique em notificação
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification click received")
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(
      clients.openWindow("/").catch(() => {
        // Se falhar, tentar abrir qualquer cliente disponível
        return clients.matchAll().then((clientList) => {
          if (clientList.length > 0) {
            return clientList[0].focus()
          }
        })
      }),
    )
  }
})

// Tratamento de erros globais
self.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.error)
})

self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker unhandled rejection:", event.reason)
})

// Log de status
console.log("Service Worker: Bluetooth Center v3 loaded and ready!")
