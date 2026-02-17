import { FileCode2, Headphones, History, Smartphone, Tv, Watch } from "lucide-react";

const modules = [
  {
    title: "Transferencia Smart",
    description: "Fila de envio por dispositivo com progresso ao vivo.",
    icon: Smartphone,
  },
  {
    title: "Audio de Estado",
    description: "waiting.mp3, connected.mp3 e disconnected.mp3 com disparo automatico.",
    icon: Headphones,
  },
  {
    title: "Telemetria",
    description: "Logs publicos com trilha completa de comandos e eventos.",
    icon: History,
  },
  {
    title: "UUID Vault",
    description: "Grande banco de UUIDs para debug e integracao BLE.",
    icon: FileCode2,
  },
  {
    title: "Compatibilidade",
    description: "Detecta suporte Web Bluetooth e estado de conexao.",
    icon: Watch,
  },
  {
    title: "Expansao",
    description: "Base pronta para TV casting, controle e automacoes futuras.",
    icon: Tv,
  },
];

export function BluetoothModules() {
  return (
    <section className="gsap-reveal px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">System Modules</h2>
          <p className="text-sm text-slate-300">Blocos do novo design do Bluetooth Center.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((item) => (
            <article key={item.title} className="gsap-reveal rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
              <item.icon className="mb-3 h-5 w-5 text-cyan-300" />
              <h3 className="text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
