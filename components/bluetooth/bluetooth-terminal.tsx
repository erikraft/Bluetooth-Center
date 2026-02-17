import { FormEvent, useMemo } from "react";
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
  const renderedLogs = useMemo(() => logs.slice(-140), [logs]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCommandSubmit();
  };

  return (
    <div className="gsap-terminal flex-1 w-full max-w-lg">
      <div className="bg-[#0c0c0c] border border-white/10 shadow-2xl shadow-emerald-900/10 rounded-xl overflow-hidden">
        <div className="bg-[#1a1a1a] border-b border-white/5 flex items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={onClear}
            className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500"
            aria-label="Clear terminal"
            title="Clear"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <div className="text-xs text-gray-500 font-mono ml-auto">bluetooth-center@workspace:~</div>
        </div>

        <div className="h-[22rem] overflow-y-auto custom-scrollbar p-4 font-mono text-xs sm:h-[26rem] sm:p-6 sm:text-sm">
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
              ●
            </span>
          </form>
          <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">Dica: digite `help` para listar todos os comandos.</p>
        </div>
      </div>
    </div>
  );
}
