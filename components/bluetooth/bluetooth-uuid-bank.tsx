interface BluetoothUuidBankProps {
  uuids: string[];
}

export function BluetoothUuidBank({ uuids }: BluetoothUuidBankProps) {
  const visibleUuids = uuids.slice(0, 2200);
  const hiddenCount = uuids.length - visibleUuids.length;

  return (
    <section className="gsap-reveal px-3 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-[#0b1220]/90 p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-white sm:text-2xl md:text-3xl">UUID Bank (Massivo)</h2>
        <p className="mb-4 mt-1 text-sm text-slate-300">
          UUIDs adicionados em grande quantidade para fluxo BLE, logs, transferencias e rastreio tecnico.
        </p>
        <div className="grid max-h-[20rem] grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[11px] text-cyan-100 sm:max-h-[24rem] sm:grid-cols-2 sm:p-4 sm:text-xs lg:grid-cols-3 xl:grid-cols-4 custom-scrollbar">
          {visibleUuids.map((uuid) => (
            <div key={uuid} className="rounded-md border border-white/10 px-2 py-1.5 sm:px-3 sm:py-2">
              {uuid}
            </div>
          ))}
        </div>
        {hiddenCount > 0 && (
          <p className="mt-3 text-xs text-slate-400">
            +{hiddenCount} UUIDs adicionais ativos em memoria para operacoes Bluetooth e logs.
          </p>
        )}
      </div>
    </section>
  );
}
