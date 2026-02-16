import { useEffect, useRef } from "react";
import { LogEntry } from "./types";

interface PipelineLogProps {
  entries: LogEntry[];
  isAnalyzing: boolean;
}

const typeConfig: Record<string, { color: string; prefix: string }> = {
  success: { color: "#5BE3A0", prefix: "✓ " },
  highlight: { color: "#E8C547", prefix: "→ " },
  error: { color: "#E87D5B", prefix: "✗ " },
  info: { color: "hsl(var(--muted-foreground))", prefix: "" },
};

const PipelineLog = ({ entries, isAnalyzing }: PipelineLogProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  return (
    <div className="rounded-lg border border-border-soft bg-card/60 p-3 font-mono text-xs min-h-[200px] max-h-[300px] overflow-y-auto">
      {entries.length === 0 ? (
        <div className="text-muted-foreground space-y-1">
          <p>{"> waiting for input..."}</p>
          <p>{"> enter paper title to begin"}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry, i) => {
            const cfg = typeConfig[entry.type] || typeConfig.info;
            return (
              <div key={i} className="flex gap-2 animate-[fadeIn_0.2s_ease]">
                <span className="text-muted-foreground shrink-0">{entry.time}</span>
                <span style={{ color: cfg.color }}>{cfg.prefix}{entry.msg}</span>
              </div>
            );
          })}
          {isAnalyzing && (
            <div className="flex gap-2 animate-[pulse_2s_ease-in-out_infinite]">
              <span className="text-muted-foreground">--:--:--</span>
              <span style={{ color: "#E8C547" }}>{"> processing..."}</span>
            </div>
          )}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default PipelineLog;
