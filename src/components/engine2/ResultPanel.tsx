import { Agent } from "./types";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResultPanelProps {
  agent: Agent;
  data: any;
  onClose: () => void;
}

const ResultPanel = ({ agent, data, onClose }: ResultPanelProps) => {
  if (!data) return null;

  return (
    <div
      className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden animate-[fadeIn_0.3s_ease]"
      style={{ borderLeft: `3px solid ${agent.color}`, boxShadow: `0 0 30px ${agent.color}15` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-soft">
        <div className="flex items-center gap-2">
          <span className="text-lg" style={{ color: agent.color }}>{agent.icon}</span>
          <span className="text-sm font-semibold text-foreground">{agent.label}</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="p-4 space-y-3">
          {agent.id === "claim" && renderClaims(data)}
          {agent.id === "evidence" && renderEvidence(data)}
          {agent.id === "assumption" && renderAssumptions(data)}
          {agent.id === "baseline" && renderBaselines(data)}
          {agent.id === "repro" && renderRepro(data)}
          {agent.id === "pseudo" && renderPseudo(data)}
        </div>
      </ScrollArea>
    </div>
  );
};

function renderClaims(data: any) {
  return (data.claims || []).map((c: any, i: number) => (
    <div key={i} className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-foreground">{c.type}</span>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${c.risk === "high" ? "text-[#E87D5B] bg-[#E87D5B]/10" : c.risk === "med" ? "text-[#E8C547] bg-[#E8C547]/10" : "text-[#5BE3A0] bg-[#5BE3A0]/10"}`}>{c.risk}</span>
      </div>
      <p className="text-sm text-foreground/80">{c.claim}</p>
      <p className="text-[10px] text-muted-foreground">Strength: {c.strength}</p>
    </div>
  ));
}

function renderEvidence(data: any) {
  return (data.evidence_map || []).map((e: any, i: number) => (
    <div key={i} className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-1">
      <div className="flex items-center gap-2">
        <span className={e.found ? "text-[#5BE3A0]" : "text-[#E87D5B]"}>{e.found ? "✓" : "✗"}</span>
        <p className="text-sm text-foreground/80">{e.claim}</p>
      </div>
      {e.location && <p className="text-[10px] text-muted-foreground">Location: {e.location}</p>}
      {e.gap && <p className="text-[10px] text-[#E8C547]">⚠ {e.gap}</p>}
    </div>
  ));
}

function renderAssumptions(data: any) {
  return (data.assumptions || []).map((a: any, i: number) => (
    <div key={i} className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-1">
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${a.centrality === "core" ? "text-[#E87D5B] bg-[#E87D5B]/10" : "text-muted-foreground bg-muted"}`}>{a.centrality}</span>
      <p className="text-sm text-foreground/80">{a.text}</p>
      <p className="text-[10px] text-[#E8C547]">If wrong → {a.breaks}</p>
    </div>
  ));
}

function renderBaselines(data: any) {
  return (data.baselines || []).map((b: any, i: number) => (
    <div key={i} className="p-3 rounded-lg border border-border-soft bg-card/60 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{b.name}</p>
        <p className="text-[10px] text-muted-foreground">{b.age} · {b.note}</p>
      </div>
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${b.fair ? "text-[#5BE3A0] bg-[#5BE3A0]/10" : "text-[#E87D5B] bg-[#E87D5B]/10"}`}>
        {b.fair ? "FAIR" : "OUTDATED"}
      </span>
    </div>
  ));
}

function renderRepro(data: any) {
  const score = data.score ?? 0;
  const scoreColor = score < 50 ? "#E87D5B" : score <= 70 ? "#E8C547" : "#5BE3A0";
  return (
    <>
      <div className="text-center mb-4">
        <span className="text-4xl font-bold font-mono" style={{ color: scoreColor }}>{score}</span>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">Reproducibility Score</p>
      </div>
      {(data.checklist || []).map((c: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-2 rounded border border-border-soft bg-card/60">
          <span className="text-xs text-foreground/80">{c.item}</span>
          <span className={`text-xs font-semibold ${c.status === "pass" ? "text-[#5BE3A0]" : c.status === "partial" ? "text-[#E8C547]" : "text-[#E87D5B]"}`}>
            {c.status === "pass" ? "✓" : c.status === "partial" ? "◐" : "✗"}
          </span>
        </div>
      ))}
    </>
  );
}

function renderPseudo(data: any) {
  return (data.steps || []).map((s: any, i: number) => (
    <div key={i} className={`p-3 rounded-lg border bg-card/60 space-y-1 ${s.ambiguous ? "border-[#E8C547]/40" : "border-border-soft"}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground">{s.step}.</span>
        <p className="text-sm text-foreground/80">{s.text}</p>
      </div>
      {s.ambiguous && <p className="text-[10px] text-[#E8C547]">⚠ AMBIGUOUS — clarify before coding</p>}
    </div>
  ));
}

export default ResultPanel;
