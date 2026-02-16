export interface Agent {
  id: string;
  label: string;
  icon: string;
  color: string;
  section: string;
  description: string;
}

export type AgentStatus = "idle" | "running" | "done";
export type Phase = "idle" | "analyzing" | "done" | "error";

export interface LogEntry {
  msg: string;
  type: "success" | "highlight" | "error" | "info";
  time: string;
}

export const AGENTS: Agent[] = [
  { id: "claim", label: "Claim Extractor", icon: "◈", color: "#E8C547", section: "Abstract + Intro", description: "Hunting explicit contribution claims" },
  { id: "evidence", label: "Evidence Mapper", icon: "◎", color: "#5BE3A0", section: "Results Section", description: "Mapping claims to experimental evidence" },
  { id: "assumption", label: "Assumption Hunter", icon: "◇", color: "#E87D5B", section: "Methodology", description: "Surfacing unjustified design choices" },
  { id: "baseline", label: "Baseline Analyzer", icon: "◉", color: "#7B9EE8", section: "Experiments", description: "Auditing comparison fairness" },
  { id: "repro", label: "Repro Checker", icon: "◑", color: "#C47BE8", section: "Full Paper", description: "Checking reproducibility completeness" },
  { id: "pseudo", label: "Pseudocode Gen", icon: "◐", color: "#E85B8A", section: "Methodology", description: "Translating method to executable logic" },
];
