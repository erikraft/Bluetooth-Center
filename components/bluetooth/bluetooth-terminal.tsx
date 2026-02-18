import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { TerminalLog } from "./types";
import { cn } from "@/lib/utils";

interface BluetoothTerminalProps {
  logs: TerminalLog[];
  command: string;
  onCommandChange: (value: string) => void;
  onCommandSubmit: () => void;
  onClear: () => void;
}

function levelColor(level: TerminalLog["level"]): string {
  switch (level) {
    case "success":
      return "text-emerald-300";
    case "warning":
      return "text-yellow-300";
    case "error":
      return "text-red-300";
    case "command":
      return "text-cyan-300";
    default:
      return "text-slate-300";
  }
}

export function BluetoothTerminal({
  logs,
  command,
  onCommandChange,
  onCommandSubmit,
  onClear,
}: BluetoothTerminalProps) {
  const aiMenuRef = useRef<HTMLDivElement>(null);
  const copiedToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const renderedLogs = useMemo(() => logs.slice(-140), [logs]);

  const aiPrompt = useMemo(() => {
    const siteUrl = "https://bluetooth.erikraft.com/";
    const condensedLogs = renderedLogs
      .slice(-60)
      .map((log) => `[${log.timestamp}] ${log.message}`)
      .join("\n");

    return [
      "Tenho duvidas sobre este site e o log abaixo.",
      `Site: ${siteUrl}`,
      "",
      "Analise o comportamento, possiveis erros e proximos passos de debug.",
      "",
      "Logs:",
      condensedLogs || "(sem logs)",
    ].join("\n");
  }, [renderedLogs]);

  const aiProviders = useMemo(
    () => [
      {
        id: "chatgpt",
        label: "ChatGPT",
        icon: "/logos/chatgpt.svg",
        url: (query: string) => `https://chatgpt.com/?q=${query}`,
      },
      {
        id: "perplexity",
        label: "Perplexity",
        icon: "/logos/perplexity.svg",
        url: (query: string) => `https://www.perplexity.ai/search/new?q=${query}`,
      },
      {
        id: "claude",
        label: "Claude",
        icon: "/logos/claude.svg",
        url: (query: string) => `https://claude.ai/new?q=${query}`,
      },
      {
        id: "grok",
        label: "Grok",
        icon: "/logos/grok.svg",
        url: (query: string) => `https://grok.com/?q=${query}`,
      },
    ],
    [],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCommandSubmit();
  };

  const handleCopyLogs = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;

    const plainLogs = renderedLogs.map((log) => `[${log.timestamp}] ${log.message}`).join("\n");
    try {
      await navigator.clipboard.writeText(plainLogs || "Sem logs.");
      setCopiedToast(true);
      if (copiedToastTimeoutRef.current) {
        clearTimeout(copiedToastTimeoutRef.current);
      }
      copiedToastTimeoutRef.current = setTimeout(() => setCopiedToast(false), 1800);
    } catch {
      // no-op
    }
  };

  const openAi = (providerId: string) => {
    if (typeof window === "undefined") return;
    const provider = aiProviders.find((item) => item.id === providerId);
    if (!provider) return;
    const query = encodeURIComponent(aiPrompt.slice(0, 3200));
    window.open(provider.url(query), "_blank", "noopener,noreferrer");
    setShowAiMenu(false);
  };

  useEffect(() => {
    if (!showAiMenu) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (aiMenuRef.current && !aiMenuRef.current.contains(target)) {
        setShowAiMenu(false);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowAiMenu(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onEsc);
    };
  }, [showAiMenu]);

  useEffect(() => {
    return () => {
      if (copiedToastTimeoutRef.current) {
        clearTimeout(copiedToastTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="gsap-terminal flex-1 w-full max-w-lg">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c] shadow-2xl shadow-emerald-900/10">
        <div className="relative flex items-center gap-2 border-b border-white/5 bg-[#1a1a1a] px-4 py-3">
          <button
            type="button"
            onClick={onClear}
            className="h-3 w-3 rounded-full bg-red-500/80 hover:bg-red-500"
            aria-label="Clear terminal"
            title="Clear"
          />
          <button
            type="button"
            onClick={() => {
              void handleCopyLogs();
            }}
            className="h-3 w-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500"
            aria-label="Copiar logs"
            title="Copiar logs"
          />
          <div ref={aiMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowAiMenu((current) => !current)}
              className="h-3 w-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500"
              aria-label="Perguntar para IA sobre o site e logs"
              title="Perguntar para IA"
            />
            {showAiMenu && (
              <div className="absolute left-0 top-6 z-30 min-w-44 rounded-md border border-white/10 bg-[#141414] p-1 shadow-xl">
                {aiProviders.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => openAi(provider.id)}
                    className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs text-slate-200 hover:bg-white/10"
                  >
                    <img src={provider.icon} alt="" className="h-3.5 w-3.5 shrink-0" />
                    <span>{provider.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-auto font-mono text-xs text-gray-500">bluetooth-center@workspace:~</div>
        </div>
        {copiedToast && (
          <div className="pointer-events-none absolute right-4 top-12 z-40 rounded-md border border-emerald-300/30 bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-100 shadow-lg">
            Logs Copiados
          </div>
        )}

        <div className="custom-scrollbar h-[22rem] overflow-y-auto p-4 font-mono text-xs sm:h-[26rem] sm:p-6 sm:text-sm">
          {renderedLogs.map((log) => (
            <div
              key={log.id}
              className={cn("mb-1 break-words", levelColor(log.level))}
              style={{ opacity: 1, transform: "none", transition: "opacity 200ms ease, transform 200ms ease" }}
            >
              <span className="mr-2 text-slate-500">[{log.timestamp}]</span>
              <span>{log.message}</span>
            </div>
          ))}

          <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2 text-cyan-300" autoComplete="off">
            <span>$</span>
            <input
              value={command}
              onChange={(event) => onCommandChange(event.target.value)}
              className="w-full bg-transparent text-slate-100 outline-none"
              placeholder="git status | bluetooth scan | help (digite help)"
              aria-label="Terminal command"
            />
            <span className="terminal-caret" aria-hidden>
              |
            </span>
          </form>
          <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">Dica: digite `help` para listar todos os comandos.</p>
        </div>
      </div>
    </div>
  );
}
