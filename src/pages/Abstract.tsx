import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, BadgeCheck, BookOpen, Brain, FlaskConical, Lightbulb, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface AbstractLocationState {
  extractData?: any;
}

type AbstractResponse = {
  title?: string;
  summary?: string;
  key_contributions?: string[];
  method_overview?: string;
  results_highlights?: string[];
  limitations_or_open_questions?: string[];
  keywords?: string[];
  evidence_notes?: string;
  confidence?: "high" | "medium" | "low" | string;
};

const confidenceBadge = (confidence?: string) => {
  const level = (confidence ?? "medium").toLowerCase();
  if (level === "high") return { label: "High confidence", tone: "bg-emerald-100 text-emerald-900" };
  if (level === "low") return { label: "Low confidence", tone: "bg-amber-100 text-amber-900" };
  return { label: "Medium confidence", tone: "bg-slate-100 text-slate-900" };
};

const Abstract = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const extractData = (location.state as AbstractLocationState | null)?.extractData;
  const [data, setData] = useState<AbstractResponse | null>(null);
  const [phase, setPhase] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [log, setLog] = useState<string[]>([]);
  const streamControllerRef = useRef<AbortController | null>(null);

  const title = data?.title ?? extractData?.title ?? "Untitled Paper";
  const badge = useMemo(() => confidenceBadge(data?.confidence), [data?.confidence]);

  const stopStream = useCallback(() => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      streamControllerRef.current = null;
    }
  }, []);

  const runAbstract = useCallback(async () => {
    if (!extractData) return;
    setPhase("loading");
    setData(null);
    setLog([]);
    stopStream();
    try {
      const controller = new AbortController();
      streamControllerRef.current = controller;
      const response = await fetch(`${API_BASE}/abstract/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(extractData),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) throw new Error("Abstract stream error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let dataLines: string[] = [];

      const flushEvent = () => {
        if (dataLines.length === 0) return;
        const payloadText = dataLines.join("\n");
        dataLines = [];
        let payload: any;
        try {
          payload = JSON.parse(payloadText);
        } catch {
          setLog((prev) => [...prev, "Received malformed SSE payload"]);
          return;
        }

        if (payload?.msg) {
          setLog((prev) => [...prev, payload.msg]);
        }
        if (payload?.status === "done" && payload?.data) {
          setData(payload.data);
          setPhase("done");
        }
        if (payload?.status === "error") {
          setPhase("error");
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) {
            flushEvent();
            continue;
          }
          if (line.startsWith(":")) continue;
          if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trim());
          }
        }
      }

      if (buffer.trim()) {
        const lines = buffer.split(/\r?\n/);
        for (const line of lines) {
          if (!line.trim()) {
            flushEvent();
            continue;
          }
          if (line.startsWith(":")) continue;
          if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trim());
          }
        }
        flushEvent();
      }
    } catch {
      setPhase("error");
    } finally {
      streamControllerRef.current = null;
    }
  }, [extractData, stopStream]);

  useEffect(() => {
    if (extractData) runAbstract();
    return () => stopStream();
  }, [extractData, runAbstract, stopStream]);

  if (!extractData) {
    return (
      <div className="bg-page-gradient min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-28">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Missing extract data. Upload a paper first.</span>
              <Button size="sm" variant="outline" onClick={() => navigate("/")}>Go Home</Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-page-gradient min-h-screen relative overflow-hidden">
      <Navbar />
      <div className="absolute inset-0 dot-pattern animate-fade-in-slow" />
      <div className="absolute top-16 -left-32 w-96 h-96 rounded-full bg-accent/40 blur-3xl animate-float" />
      <div className="absolute bottom-24 -right-32 w-80 h-80 rounded-full bg-accent/30 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16">
        <header className="flex flex-col gap-3 mb-10 animate-fade-up">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[3px] text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            Abstract Brief
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">{title}</h1>
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${badge.tone}`}>
                <BadgeCheck className="w-3.5 h-3.5" />
                {badge.label}
              </div>
              <Button
                size="sm"
                className="tracking-wide"
                onClick={() => navigate("/engine2", { state: { extractData } })}
              >
                Go to Analysis
              </Button>
            </div>
          </div>
        </header>

        {phase === "loading" && (
          <div className="card-glass border border-border-soft/60 rounded-2xl p-6 flex items-center gap-3 animate-fade-up">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Generating researcher-focused abstract...</p>
          </div>
        )}

        {phase === "error" && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Abstract generation failed. Check backend connection.</span>
              <Button size="sm" variant="outline" onClick={runAbstract}>Try Again</Button>
            </AlertDescription>
          </Alert>
        )}

        {(phase === "loading" || phase === "done") && log.length > 0 && (
          <div className="mt-6 card-glass border border-border-soft/60 rounded-2xl p-4 text-xs text-muted-foreground space-y-1">
            {log.map((entry, idx) => (
              <div key={`${entry}-${idx}`}>{entry}</div>
            ))}
          </div>
        )}

        {phase === "done" && data && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 animate-fade-up">
            <section className="card-glass border border-border-soft/60 rounded-2xl p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[3px] text-muted-foreground mb-3">
                  <Brain className="w-4 h-4" />
                  Summary
                </div>
                <p className="text-base leading-relaxed text-foreground/90 font-serif">{data.summary}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[3px] text-muted-foreground mb-3">
                  <BookOpen className="w-4 h-4" />
                  Original Abstract
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{extractData?.abstract ?? "No abstract found."}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[3px] text-muted-foreground mb-3">
                  <Lightbulb className="w-4 h-4" />
                  Key Contributions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(data.key_contributions ?? []).map((item, idx) => (
                    <div key={`${item}-${idx}`} className="rounded-xl border border-border-soft/70 bg-white/70 px-4 py-3 text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[3px] text-muted-foreground mb-3">
                  <FlaskConical className="w-4 h-4" />
                  Method Overview
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{data.method_overview}</p>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="card-glass border border-border-soft/60 rounded-2xl p-6">
                <p className="text-xs uppercase tracking-[3px] text-muted-foreground mb-3">Results Highlights</p>
                <div className="space-y-2">
                  {(data.results_highlights ?? []).map((item, idx) => (
                    <div key={`${item}-${idx}`} className="text-sm text-foreground/80 border-l-2 border-accent pl-3">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-glass border border-border-soft/60 rounded-2xl p-6">
                <p className="text-xs uppercase tracking-[3px] text-muted-foreground mb-3">Limitations / Open Questions</p>
                <div className="space-y-2">
                  {(data.limitations_or_open_questions ?? []).map((item, idx) => (
                    <div key={`${item}-${idx}`} className="text-sm text-foreground/80 border-l-2 border-amber-200 pl-3">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-glass border border-border-soft/60 rounded-2xl p-6">
                <p className="text-xs uppercase tracking-[3px] text-muted-foreground mb-3">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {(data.keywords ?? []).map((kw, idx) => (
                    <span key={`${kw}-${idx}`} className="px-3 py-1 text-xs rounded-full bg-accent/70 text-foreground">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card-glass border border-border-soft/60 rounded-2xl p-6">
                <p className="text-xs uppercase tracking-[3px] text-muted-foreground mb-3">Evidence Notes</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{data.evidence_notes}</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Abstract;
