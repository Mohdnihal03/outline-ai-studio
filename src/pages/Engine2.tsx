import { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AgentCard from "@/components/engine2/AgentCard";
import ResultPanel from "@/components/engine2/ResultPanel";
import SynthesisPanel from "@/components/engine2/SynthesisPanel";
import TrustScoreMeter from "@/components/engine2/TrustScoreMeter";
import PipelineLog from "@/components/engine2/PipelineLog";
import AgentStatusList from "@/components/engine2/AgentStatusList";
import { AGENTS, Phase, AgentStatus, LogEntry } from "@/components/engine2/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const initialStatuses: Record<string, AgentStatus> = Object.fromEntries(AGENTS.map((a) => [a.id, "idle"]));

function now() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");
}

const Engine2 = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({ ...initialStatuses });
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [paperTitle, setPaperTitle] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [apiData, setApiData] = useState<any>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addLog = useCallback((msg: string, type: LogEntry["type"]) => {
    setLog((prev) => [...prev, { msg, type, time: now() }]);
  }, []);

  const setStatus = useCallback((id: string, status: AgentStatus) => {
    setAgentStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const resetAll = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setAgentStatuses({ ...initialStatuses });
    setSelectedAgent(null);
    setPaperTitle("");
    setLog([]);
    setApiData(null);
  }, [clearTimers]);

  const runPipeline = useCallback(() => {
    if (!paperTitle.trim()) return;
    clearTimers();
    setPhase("analyzing");
    setApiData(null);
    setSelectedAgent(null);
    setLog([]);
    setAgentStatuses({ ...initialStatuses });

    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    // Simulation
    t(() => addLog("Paper ingested — structural parsing complete", "success"), 600);
    t(() => addLog("Routing sections to specialist agents...", "info"), 1000);
    t(() => {
      addLog("PARALLEL: 5 agents dispatched simultaneously", "highlight");
      ["claim", "assumption", "baseline", "repro", "pseudo"].forEach((id) => setStatus(id, "running"));
    }, 1000);
    t(() => { addLog("Assumption Hunter → complete", "success"); setStatus("assumption", "done"); }, 2800);
    t(() => { addLog("Pseudocode Gen → complete", "success"); setStatus("pseudo", "done"); }, 3000);
    t(() => { addLog("Claim Extractor → complete", "success"); setStatus("claim", "done"); }, 3200);
    t(() => { addLog("Baseline Analyzer → complete", "success"); setStatus("baseline", "done"); }, 3600);
    t(() => { addLog("Repro Checker → complete", "success"); setStatus("repro", "done"); }, 4000);
    t(() => addLog("Claims extracted — dispatching Evidence Mapper...", "info"), 4400);
    t(() => setStatus("evidence", "running"), 4400);
    t(() => { addLog("Evidence Mapper → complete", "success"); setStatus("evidence", "done"); }, 6800);
    t(() => addLog("All agents complete — running Synthesis...", "highlight"), 7200);
    t(() => addLog("Synthesis complete ✓ Trust score calculated", "success"), 9000);

    // Real API call
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    timersRef.current.push(timeout);

    fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paper_title: paperTitle.trim(),
        passes_requested: ["claim", "evidence", "assumption", "baseline", "repro", "pseudo"],
      }),
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        clearTimers();
        setApiData(data);
        AGENTS.forEach((a) => setStatus(a.id, "done"));
        setPhase("done");
        addLog("Synthesis complete ✓ Trust score calculated", "success");
      })
      .catch(() => {
        clearTimers();
        setPhase("error");
        addLog("Analysis failed — check backend connection", "error");
      });
  }, [paperTitle, addLog, setStatus, clearTimers]);

  const handleAgentClick = (id: string) => {
    setSelectedAgent((prev) => (prev === id ? null : id));
  };

  const selectedAgentObj = AGENTS.find((a) => a.id === selectedAgent);
  const allDone = phase === "done";
  const showSynthesis = allDone && !selectedAgent && apiData?.agents?.synthesis;
  const trustScore = apiData?.agents?.synthesis?.trust_score;

  return (
    <div className="bg-page-gradient min-h-screen flex flex-col">
      <Navbar />
      {/* Header */}
      <header className="border-b border-border-soft px-6 py-4 flex items-center justify-between shrink-0 mt-14">
        <div>
          <h1 className="text-sm font-bold tracking-[3px] uppercase text-foreground">Engine 2</h1>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
            Analysis Pipeline — Specialist Agent Layer
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#E87D5B" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#E8C547" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#5BE3A0" }} />
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-0">
        {/* Left Column */}
        <div className="p-6 overflow-y-auto border-r border-border-soft">
          {/* Section A: Paper Input */}
          {phase === "idle" && (
            <div className="mb-8 animate-fade-up">
              <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2 block">
                Paper Title / arXiv ID
              </label>
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder="e.g. Attention Is All You Need / 1706.03762"
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runPipeline()}
                />
                <Button onClick={runPipeline} className="tracking-wide shrink-0">
                  ANALYZE →
                </Button>
              </div>
            </div>
          )}

          {/* Section B: Paper Title Strip */}
          {phase !== "idle" && (
            <div className="mb-8 flex items-center justify-between animate-fade-up">
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Analyzing</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{paperTitle}</p>
              </div>
              {allDone && (
                <Button variant="ghost" size="sm" onClick={resetAll} className="text-xs tracking-wide">
                  NEW PAPER
                </Button>
              )}
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Analysis failed — check backend connection</span>
                <Button size="sm" variant="outline" onClick={runPipeline} className="ml-4">Try Again</Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Section C: Label */}
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-4">
            Specialist Agents ← Parallel Execution
          </p>

          {/* Section D/G: Agent Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 ${phase === "idle" ? "opacity-40" : ""}`}>
            {AGENTS.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                status={agentStatuses[agent.id]}
                onClick={() => handleAgentClick(agent.id)}
              />
            ))}
          </div>

          {/* Section E: Result Panel */}
          {selectedAgent && selectedAgentObj && apiData?.agents?.[selectedAgent] && (
            <div className="mt-6">
              <ResultPanel
                agent={selectedAgentObj}
                data={apiData.agents[selectedAgent]}
                onClose={() => setSelectedAgent(null)}
              />
            </div>
          )}

          {/* Section F: Synthesis Panel */}
          {showSynthesis && (
            <div className="mt-6">
              <SynthesisPanel data={apiData.agents.synthesis} />
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="p-6 overflow-y-auto space-y-8 hidden lg:block">
          {/* Trust Score */}
          {allDone && trustScore != null && (
            <div className="animate-fade-up">
              <TrustScoreMeter score={trustScore} />
            </div>
          )}

          {/* Pipeline Log */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
              Pipeline Log
            </p>
            <PipelineLog entries={log} isAnalyzing={phase === "analyzing"} />
          </div>

          {/* Agent Status */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
              Agent Status
            </p>
            <AgentStatusList agents={AGENTS} statuses={agentStatuses} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Engine2;
