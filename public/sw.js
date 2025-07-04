
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `bluetooth-center-cache-${CACHE_VERSION}`;
const OFFLINE_CACHE = `bluetooth-center-offline-${CACHE_VERSION}`;

// Liste todos os arquivos essenciais do seu app
const ESSENTIAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/bluetooth-logo.png',
  '/connected.mp3',
  '/disconnected.mp3',
  '/waiting.mp3',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon-192x192.png',
  '/favicon-512x512.png',
  '/apple-touch-icon.png',
  '/placeholder-logo.png',
  '/placeholder-logo.svg',
  '/placeholder-user.jpg',
  '/placeholder.jpg',
  '/placeholder.svg',
  '/screenshot-1.png',
  '/screenshot-2.png',
  // Adicione outros arquivos estáticos importantes aqui
  // Se usar Next.js, adicione também arquivos de /_next/static/ se necessário
];

const OPTIONAL_RESOURCES = [];

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


self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ESSENTIAL_RESOURCES);
    })
  );
  self.skipWaiting();
});


self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== OFFLINE_CACHE) {
            console.log('Service Worker: Deletando cache antigo', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});


self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request)
        .then(fetchRes => {
          // Atualiza o cache em background
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        })
        .catch(() => {
          // Fallback para página offline customizada
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});


// (Funções antigas removidas para simplificar e garantir compatibilidade máxima offline)


// (Notificações push e sync removidas para simplificar e garantir compatibilidade máxima offline)
console.log('Service Worker: Bluetooth Center pronto para uso offline!');
