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
      <div className="flex items-center justify-between p-4 border-b border-border-soft">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg" style={{ color: agent.color }}>{agent.icon}</span>
            <span className="text-sm font-semibold text-foreground">{agent.label}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {agent.section} - {agent.description}
          </p>
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
  return (
    <div className="space-y-3">
      {(data.core_problem || data.proposed_solution) && (
        <div className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-2">
          {data.core_problem && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Core Problem</p>
              <p className="text-sm text-foreground/80">{data.core_problem}</p>
            </div>
          )}
          {data.proposed_solution && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Proposed Solution</p>
              <p className="text-sm text-foreground/80">{data.proposed_solution}</p>
            </div>
          )}
          {data.what_must_be_true && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What Must Be True</p>
              <p className="text-xs text-foreground/70">{data.what_must_be_true}</p>
            </div>
          )}
        </div>
      )}

      {(data.claims || []).map((c: any, i: number) => (
        <div key={i} className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-foreground">{c.type}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${c.risk === "high" ? "text-[#E87D5B] bg-[#E87D5B]/10" : c.risk === "med" ? "text-[#E8C547] bg-[#E8C547]/10" : "text-[#5BE3A0] bg-[#5BE3A0]/10"}`}>{c.risk}</span>
          </div>
          <p className="text-sm text-foreground/80">{c.claim}</p>
          {c.quote && <p className="text-[11px] text-muted-foreground">Quote: "{c.quote}"</p>}
          <p className="text-[10px] text-muted-foreground">Strength: {c.strength}</p>
        </div>
      ))}
    </div>
  );
}

function renderEvidence(data: any) {
  return (
    <div className="space-y-3">
      {data.overall_strength && (
        <div className="p-3 rounded-lg border border-border-soft bg-card/60">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Overall Evidence Strength</p>
          <p className="text-sm text-foreground/80">{data.overall_strength}</p>
        </div>
      )}
      {(data.evidence_map || []).map((e: any, i: number) => (
        <div key={i} className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-1">
          <div className="flex items-center gap-2">
            <span className={e.found ? "text-[#5BE3A0]" : "text-[#E87D5B]"}>{e.found ? "OK" : "NO"}</span>
            <p className="text-sm text-foreground/80">{e.claim}</p>
          </div>
          {e.location && <p className="text-[10px] text-muted-foreground">Location: {e.location}</p>}
          {e.quote && <p className="text-[11px] text-muted-foreground">Quote: "{e.quote}"</p>}
          {e.gap && <p className="text-[10px] text-[#E8C547]">WARN: {e.gap}</p>}
        </div>
      ))}
      {(data.high_risk || []).length > 0 && (
        <div className="p-3 rounded-lg border border-border-soft bg-card/60">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">High Risk Claims</p>
          <div className="space-y-1">
            {data.high_risk.map((item: string, i: number) => (
              <p key={`${item}-${i}`} className="text-xs text-foreground/80">{item}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderAssumptions(data: any) {
  return (
    <div className="space-y-3">
      {(data.assumptions || []).map((a: any, i: number) => (
        <div key={i} className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-1">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${String(a.centrality).toLowerCase() === "critical" ? "text-[#E87D5B] bg-[#E87D5B]/10" : "text-muted-foreground bg-muted"}`}>{a.centrality}</span>
          <p className="text-sm text-foreground/80">{a.text}</p>
          {a.breaks && <p className="text-[10px] text-[#E8C547]">If wrong {"->"} {a.breaks}</p>}
        </div>
      ))}
      {data.hidden_assumption && (
        <div className="p-3 rounded-lg border border-[#E87D5B]/30 bg-card/60 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[#E87D5B]">Hidden Assumption</p>
          <p className="text-sm text-foreground/80">{data.hidden_assumption.quote ?? data.hidden_assumption.assumption}</p>
          <p className="text-[10px] text-[#E8C547]">If wrong {"->"} {data.hidden_assumption.consequences ?? data.hidden_assumption.what_breaks_if_wrong}</p>
        </div>
      )}
    </div>
  );
}

function renderBaselines(data: any) {
  return (
    <div className="space-y-3">
      {(data.baselines || []).map((b: any, i: number) => (
        <div key={i} className="p-3 rounded-lg border border-border-soft bg-card/60 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{b.name}</p>
            <p className="text-[10px] text-muted-foreground">{b.age ? `${b.age} - ` : ""}{b.note}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${b.fair ? "text-[#5BE3A0] bg-[#5BE3A0]/10" : "text-[#E87D5B] bg-[#E87D5B]/10"}`}>
            {b.fair ? "FAIR" : "OUTDATED"}
          </span>
        </div>
      ))}
      {(data.metrics || []).length > 0 && (
        <div className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Metrics</p>
          {data.metrics.map((m: any, i: number) => (
            <p key={`${m.name}-${i}`} className="text-xs text-foreground/80">{m.name}: {m.reason}</p>
          ))}
        </div>
      )}
      {(data.missing || []).length > 0 && (
        <div className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Missing Comparisons</p>
          {data.missing.map((m: string, i: number) => (
            <p key={`${m}-${i}`} className="text-xs text-foreground/80">{m}</p>
          ))}
        </div>
      )}
      {data.repro_note && (
        <div className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Reproducibility Note</p>
          <p className="text-xs text-foreground/80">{data.repro_note.reason ?? ""}</p>
        </div>
      )}
    </div>
  );
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
      {data.biggest_gap && (
        <div className="p-3 rounded-lg border border-border-soft bg-card/60 mb-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Biggest Gap</p>
          <p className="text-xs text-foreground/80">{data.biggest_gap}</p>
        </div>
      )}
      {(data.checklist || []).map((c: any, i: number) => (
        <div key={i} className="p-3 rounded border border-border-soft bg-card/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground/80">{c.item}</span>
            <span className={`text-xs font-semibold ${c.status === "pass" ? "text-[#5BE3A0]" : c.status === "partial" ? "text-[#E8C547]" : "text-[#E87D5B]"}`}>
              {c.status === "pass" ? "PASS" : c.status === "partial" ? "PARTIAL" : "FAIL"}
            </span>
          </div>
          {c.quote && <p className="text-[10px] text-muted-foreground">Quote: "{c.quote}"</p>}
          {c.explanation && <p className="text-[10px] text-foreground/70">{c.explanation}</p>}
        </div>
      ))}
    </>
  );
}

function renderPseudo(data: any) {
  return (
    <div className="space-y-3">
      {(data.steps || []).map((s: any, i: number) => (
        <div key={i} className={`p-3 rounded-lg border bg-card/60 space-y-1 ${s.ambiguous ? "border-[#E8C547]/40" : "border-border-soft"}`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{s.step}.</span>
            <p className="text-sm text-foreground/80">{s.text}</p>
          </div>
          {s.ambiguous && <p className="text-[10px] text-[#E8C547]">AMBIGUOUS - clarify before coding</p>}
        </div>
      ))}

      {data.detailed && (
        <div className="p-3 rounded-lg border border-border-soft bg-card/60">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Detailed Pseudocode</p>
          <pre className="text-[11px] text-foreground/80 whitespace-pre-wrap">{data.detailed}</pre>
        </div>
      )}

      {(data.code_steps || []).length > 0 && (
        <div className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Code Walkthrough</p>
          {data.code_steps.map((c: any, i: number) => (
            <div key={`${c.step}-${i}`} className="border border-border-soft/70 rounded-md p-2">
              <p className="text-xs font-semibold text-foreground">{c.step}</p>
              {c.library && <p className="text-[10px] text-muted-foreground">Library: {c.library}</p>}
              {c.code && <pre className="text-[11px] text-foreground/80 whitespace-pre-wrap mt-1">{c.code}</pre>}
              {c.notes && <p className="text-[10px] text-foreground/70 mt-1">{c.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {data.code_sample && (
        <div className="p-3 rounded-lg border border-border-soft bg-card/60">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Code Skeleton</p>
          <pre className="text-[11px] text-foreground/80 whitespace-pre-wrap">{data.code_sample}</pre>
        </div>
      )}

      {(data.ambiguities || []).length > 0 && (
        <div className="p-3 rounded-lg border border-[#E8C547]/30 bg-card/60 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[#E8C547]">Ambiguities</p>
          {data.ambiguities.map((a: any, i: number) => (
            <div key={`${a.step}-${i}`} className="text-[10px] text-foreground/70">
              <span className="font-semibold">{a.step}</span>: {a.issue} {a.suggestion ? `Suggested: ${a.suggestion}` : ""}
            </div>
          ))}
        </div>
      )}

      {(data.notes || []).length > 0 && (
        <div className="p-3 rounded-lg border border-border-soft bg-card/60 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Implementation Notes</p>
          {data.notes.map((n: string, i: number) => (
            <p key={`${n}-${i}`} className="text-[10px] text-foreground/70">{n}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResultPanel;
