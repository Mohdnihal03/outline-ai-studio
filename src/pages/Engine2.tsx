import { useState, useCallback, useRef, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
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

interface Engine2LocationState {
  extractData?: any;
}

function mapLogType(input?: string): LogEntry["type"] {
  if (input === "success" || input === "highlight" || input === "error" || input === "info") {
    return input;
  }
  return "info";
}

function confidenceToScore(confidence?: string): number {
  if (confidence === "high") return 85;
  if (confidence === "medium") return 65;
  if (confidence === "low") return 40;
  return 60;
}

function normalizeChecklistStatus(status?: string): "pass" | "partial" | "fail" {
  const s = (status ?? "").toLowerCase();
  if (s.includes("provided") || s.includes("pass")) return "pass";
  if (s.includes("partial")) return "partial";
  return "fail";
}

function reproducibilityToScore(label?: string): number {
  const s = (label ?? "").toLowerCase();
  if (s.includes("high")) return 85;
  if (s.includes("medium")) return 65;
  if (s.includes("low")) return 40;
  return 60;
}

function normalizeResult(finalData: any) {
  if (finalData?.agents) return finalData;

  const analysis = finalData?.analysis ?? {};

  const claimData = analysis?.claims ?? {};
  const evidenceData = analysis?.evidence ?? {};
  const assumptionData = analysis?.assumptions ?? {};
  const baselineData = analysis?.baselines ?? {};
  const reproData = analysis?.reproducibility ?? {};
  const pseudoData = analysis?.pseudocode ?? {};
  const synthesisData = analysis?.synthesis ?? {};

  const agents = {
    claim: {
      claims: (claimData?.contribution_claims ?? []).map((item: any) => ({
        type: claimData?.paper_type ?? "claim",
        risk: "med",
        claim: item?.claim ?? "",
        strength: evidenceData?.overall_evidence_strength ?? "unknown",
      })),
    },
    evidence: {
      evidence_map: (evidenceData?.claim_evidence_map ?? []).map((item: any) => ({
        found: Boolean(item?.evidence_found),
        claim: item?.claim ?? "",
        location: item?.evidence_location ?? "",
        gap: item?.gap_risk && item?.gap_risk !== "NONE" ? item.gap_risk : "",
      })),
    },
    assumption: {
      assumptions: (assumptionData?.assumptions ?? []).map((item: any) => ({
        centrality: item?.centrality ?? "peripheral",
        text: item?.assumption ?? "",
        breaks: item?.what_breaks_if_wrong ?? "",
      })),
    },
    baseline: {
      baselines: (baselineData?.baselines ?? []).map((item: any) => ({
        name: item?.name ?? "",
        age: item?.year ?? "",
        note: item?.concern ?? "",
        fair: item?.is_current !== false,
      })),
    },
    repro: {
      score: reproducibilityToScore(reproData?.overall_reproducibility),
      checklist: (reproData?.checklist ?? []).map((item: any) => ({
        item: item?.item ?? "",
        status: normalizeChecklistStatus(item?.status),
      })),
    },
    pseudo: {
      steps: (pseudoData?.high_level_pseudocode ?? []).map((step: string, i: number) => ({
        step: i + 1,
        text: step,
        ambiguous: false,
      })),
    },
    synthesis: {
      trust_score: confidenceToScore(synthesisData?.verdict?.confidence),
      critical_insight: synthesisData?.critical_finding ?? synthesisData?.paper_summary ?? "No synthesis insight returned.",
      three_questions: (synthesisData?.suggested_next_steps ?? []).slice(0, 3),
      recommended_pass: 1,
      status_label: synthesisData?.verdict?.worth_building_on ? "BUILDABLE" : "RISKY",
    },
  };

  return {
    ...finalData,
    agents,
  };
}

function now() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");
}

const Engine2 = () => {
  const location = useLocation();
  const extractData = (location.state as Engine2LocationState | null)?.extractData;
  const [phase, setPhase] = useState<Phase>("idle");
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({ ...initialStatuses });
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [paperTitle, setPaperTitle] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [apiData, setApiData] = useState<any>(null);
  const streamControllerRef = useRef<AbortController | null>(null);

  const addLog = useCallback((msg: string, type: LogEntry["type"]) => {
    setLog((prev) => [...prev, { msg, type, time: now() }]);
  }, []);

  const setStatus = useCallback((id: string, status: AgentStatus) => {
    setAgentStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const stopStream = useCallback(() => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      streamControllerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  const resetAll = useCallback(() => {
    stopStream();
    setPhase("idle");
    setAgentStatuses({ ...initialStatuses });
    setSelectedAgent(null);
    setPaperTitle("");
    setLog([]);
    setApiData(null);
  }, [stopStream]);

  const runPipeline = useCallback(async () => {
    stopStream();

    if (!extractData) {
      setPhase("error");
      addLog("Missing extract data - upload a PDF first", "error");
      return;
    }

    setPhase("analyzing");
    setApiData(null);
    setSelectedAgent(null);
    setPaperTitle("");
    setLog([]);
    setAgentStatuses({ ...initialStatuses });
    addLog("Calling /analyze and /analyze/stream...", "info");

    let analyzeDone = false;
    let streamDone = false;

    const tryFinish = () => {
      if (analyzeDone && streamDone) {
        setPhase("done");
      }
    };

    const analyzePromise = (async () => {
      const analyzeResponse = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(extractData),
      });

      if (!analyzeResponse.ok) {
        throw new Error("Analyze API error");
      }

      const finalJson = await analyzeResponse.json();
      const normalized = normalizeResult(finalJson);
      setApiData(normalized);
      setPaperTitle(normalized?.title ?? "");
      analyzeDone = true;
      tryFinish();
    })();

    const streamPromise = (async () => {
      const controller = new AbortController();
      streamControllerRef.current = controller;
      try {
        const response = await fetch(`${API_BASE}/analyze/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify(extractData),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error("Stream API error");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        let currentEvent = "message";
        let dataLines: string[] = [];

        const flushEvent = () => {
          if (dataLines.length === 0) return;

          const payloadText = dataLines.join("\n");
          dataLines = [];

          // Some backends emit only "data:" lines without "event:".
          // Treat default "message" as log payload too.
          if (currentEvent !== "log" && currentEvent !== "message") {
            currentEvent = "message";
            return;
          }
          currentEvent = "message";

          let payload: any;
          try {
            payload = JSON.parse(payloadText);
          } catch {
            addLog("Received malformed SSE payload", "error");
            return;
          }

          const agentId = payload?.agent_id as string | undefined;
          const status = payload?.status as string | undefined;
          const msg = payload?.msg as string | undefined;

          if (msg) {
            const logType: LogEntry["type"] = payload?.type
              ? mapLogType(payload.type)
              : status === "error"
                ? "error"
                : status === "running"
                  ? "info"
                  : status === "complete" || status === "done"
                    ? "success"
                    : "highlight";
            addLog(msg, logType);
          }

          if (agentId && agentId !== "pipeline") {
            if (status === "running") setStatus(agentId, "running");
            if (status === "complete" || status === "done") setStatus(agentId, "done");
          }

          if (agentId === "pipeline" && (status === "complete" || status === "done")) {
            streamDone = true;
            tryFinish();
            stopStream();
          }

          if (status === "error") {
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
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
              continue;
            }
            if (line.startsWith(":")) {
              continue;
            }
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
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
              continue;
            }
            if (line.startsWith(":")) {
              continue;
            }
            if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trim());
            }
          }
          flushEvent();
        }

        if (!streamDone) {
          streamDone = true;
          tryFinish();
        }
      } catch (error: any) {
        if (controller.signal.aborted) {
          if (!streamDone) {
            streamDone = true;
            tryFinish();
          }
          return;
        }
        throw error;
      }
    })();

    try {
      await Promise.all([analyzePromise, streamPromise]);
    } catch {
      setPhase("error");
      setAgentStatuses({ ...initialStatuses });
      addLog("Analyze/stream failed - check backend connection", "error");
    } finally {
      streamControllerRef.current = null;
    }
  }, [extractData, addLog, setStatus, stopStream]);

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
      <header className="border-b border-border-soft px-6 py-4 flex items-center justify-between shrink-0 mt-14">
        <div>
          <h1 className="text-sm font-bold tracking-[3px] uppercase text-foreground">Engine 2</h1>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
            Analysis Pipeline - Specialist Agent Layer
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#E87D5B" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#E8C547" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#5BE3A0" }} />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-0">
        <div className="p-6 overflow-y-auto border-r border-border-soft">
          {phase === "idle" && (
            <div className="mb-8 animate-fade-up">
              <Button onClick={runPipeline} className="tracking-wide shrink-0" disabled={!extractData}>
                ANALYZE →
              </Button>
              {!extractData && (
                <p className="text-xs text-muted-foreground mt-2">
                  Upload a PDF first so Engine 2 can receive JSON from <code>/extract</code>.
                </p>
              )}
            </div>
          )}

          {phase !== "idle" && (
            <div className="mb-8 flex items-end gap-4 justify-between animate-fade-up">
              <div className="flex-1">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">Paper Title</p>
                <Input
                  className="flex-1"
                  value={paperTitle}
                  readOnly
                  placeholder="Title will appear after /analyze returns"
                />
              </div>
              {allDone && (
                <Button variant="ghost" size="sm" onClick={resetAll} className="text-xs tracking-wide">
                  NEW PAPER
                </Button>
              )}
            </div>
          )}

          {phase === "error" && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Analysis failed - check backend connection</span>
                <Button size="sm" variant="outline" onClick={runPipeline} className="ml-4">Try Again</Button>
              </AlertDescription>
            </Alert>
          )}

          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-4">
            Specialist Agents ← Parallel Execution
          </p>

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

          {selectedAgent && selectedAgentObj && apiData?.agents?.[selectedAgent] && (
            <div className="mt-6">
              <ResultPanel
                agent={selectedAgentObj}
                data={apiData.agents[selectedAgent]}
                onClose={() => setSelectedAgent(null)}
              />
            </div>
          )}

          {showSynthesis && (
            <div className="mt-6">
              <SynthesisPanel data={apiData.agents.synthesis} />
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto space-y-8 hidden lg:block">
          {allDone && trustScore != null && (
            <div className="animate-fade-up">
              <TrustScoreMeter score={trustScore} />
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
              Pipeline Log
            </p>
            <PipelineLog entries={log} isAnalyzing={phase === "analyzing"} />
          </div>

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
