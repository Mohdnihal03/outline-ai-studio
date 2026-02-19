import { Separator } from "@/components/ui/separator";

interface SynthesisData {
  trust_score: number;
  critical_insight: string;
  three_questions: string[];
  recommended_pass: number;
  status_label: string;
  strengths?: string[];
  weaknesses?: string[];
  reasoning?: string;
}

interface SynthesisPanelProps {
  data: SynthesisData;
}

const SynthesisPanel = ({ data }: SynthesisPanelProps) => {
  return (
    <div
      className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden animate-[fadeIn_0.5s_ease]"
      style={{ borderLeft: "3px solid #E8C547" }}
    >
      {/* Header */}
      <div className="p-5 border-b border-border-soft">
        <div className="flex items-center gap-2">
          <span className="text-lg text-[#E8C547]">⬡</span>
          <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
            Synthesis Agent — Final Report
          </h3>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Critical Insight */}
        <div className="rounded-lg bg-accent/40 border border-border-soft p-4">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
            Critical Insight
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">{data.critical_insight}</p>
        </div>

        {/* Three Questions */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            3 Questions to Investigate
          </p>
          <div className="space-y-0">
            {data.three_questions.map((q, i) => (
              <div key={i}>
                <div className="flex items-start gap-3 py-3">
                  <span className="text-xs font-mono text-muted-foreground mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-foreground/80 leading-relaxed">{q}</p>
                </div>
                {i < 2 && <Separator className="bg-border-soft" />}
              </div>
            ))}
          </div>
        </div>

        {(data.strengths?.length || data.weaknesses?.length) && (
          <div className="grid grid-cols-1 gap-3">
            {data.strengths && data.strengths.length > 0 && (
              <div className="rounded-lg border border-border-soft bg-card/60 p-4">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                  Strengths
                </p>
                <div className="space-y-1">
                  {data.strengths.map((item, i) => (
                    <p key={`${item}-${i}`} className="text-xs text-foreground/80">{item}</p>
                  ))}
                </div>
              </div>
            )}
            {data.weaknesses && data.weaknesses.length > 0 && (
              <div className="rounded-lg border border-border-soft bg-card/60 p-4">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                  Weaknesses
                </p>
                <div className="space-y-1">
                  {data.weaknesses.map((item, i) => (
                    <p key={`${item}-${i}`} className="text-xs text-foreground/80">{item}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {data.reasoning && (
          <div className="rounded-lg border border-border-soft bg-card/60 p-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
              Verdict Reasoning
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">{data.reasoning}</p>
          </div>
        )}

        {/* Bottom stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border-soft bg-card/60 p-4 text-center">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
              Recommended Pass
            </p>
            <p className="text-2xl font-bold text-foreground">{data.recommended_pass}</p>
          </div>
          <div className="rounded-lg border border-border-soft bg-card/60 p-4 text-center">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
              Status
            </p>
            <p className="text-sm font-semibold text-foreground uppercase">{data.status_label}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynthesisPanel;
