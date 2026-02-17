import { Bluetooth, ShieldCheck, Waves, Workflow } from "lucide-react";

interface BluetoothHeroProps {
  totalDevices: number;
  connectedDevices: number;
  totalUuids: number;
}

export function BluetoothHero({ totalDevices, connectedDevices, totalUuids }: BluetoothHeroProps) {
  return (
    <section className="gsap-hero relative overflow-hidden px-4 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(20,184,166,0.24),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(59,130,246,0.24),transparent_26%)]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs tracking-[0.2em] text-emerald-200">
            <Bluetooth className="h-3.5 w-3.5" /> BLUETOOTH CENTER
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-6xl">
            Nova Interface do Bluetooth Center
          </h1>
          <p className="max-w-xl text-sm text-slate-300 md:text-base">
            Design reconstruido com base no template, logs publicos em terminal estilo Git, audio de status de conexao e um banco massivo de UUIDs para diagnostico e transferencia.
          </p>
        </div>

        <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="gsap-reveal rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="mb-1 flex items-center gap-2 text-emerald-200">
              <Waves className="h-4 w-4" /> Dispositivos
            </div>
            <p className="text-2xl font-bold text-white">{totalDevices}</p>
            <p className="text-xs text-slate-400">conhecidos na sessao</p>
          </div>
          <div className="gsap-reveal rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="mb-1 flex items-center gap-2 text-blue-200">
              <ShieldCheck className="h-4 w-4" /> Conectados
            </div>
            <p className="text-2xl font-bold text-white">{connectedDevices}</p>
            <p className="text-xs text-slate-400">GATT ativos</p>
          </div>
          <div className="gsap-reveal rounded-2xl border border-white/10 bg-black/30 p-4 sm:col-span-2">
            <div className="mb-1 flex items-center gap-2 text-cyan-200">
              <Workflow className="h-4 w-4" /> UUID Bank
            </div>
            <p className="text-2xl font-bold text-white">{totalUuids}</p>
            <p className="text-xs text-slate-400">UUIDs disponiveis (fixos + runtime)</p>
          </div>
        </div>
      </div>
    </section>
  );
}
