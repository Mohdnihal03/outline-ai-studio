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
  {
    id: "claim",
    label: "Claim Extractor",
    icon: "◈",
    color: "#E8C547",
    section: "Abstract + Intro",
    description: "Identifies the core problem, proposed solution, and the paper's explicit contribution claims.",
  },
  {
    id: "evidence",
    label: "Evidence Mapper",
    icon: "◎",
    color: "#5BE3A0",
    section: "Results Section",
    description: "Links each claim to the specific experiments or results that support it.",
  },
  {
    id: "assumption",
    label: "Assumption Hunter",
    icon: "◇",
    color: "#E87D5B",
    section: "Methodology",
    description: "Surfaces hidden or critical assumptions that the method depends on.",
  },
  {
    id: "baseline",
    label: "Baseline Analyzer",
    icon: "◉",
    color: "#7B9EE8",
    section: "Experiments",
    description: "Checks whether comparisons are fair and whether stronger baselines are missing.",
  },
  {
    id: "repro",
    label: "Repro Checker",
    icon: "◑",
    color: "#C47BE8",
    section: "Full Paper",
    description: "Audits what is needed to reproduce the results: data, hyperparameters, and compute.",
  },
  {
    id: "pseudo",
    label: "Pseudocode Gen",
    icon: "◐",
    color: "#E85B8A",
    section: "Methodology",
    description: "Turns the method into readable pseudocode and a step-by-step code walkthrough.",
  },
];
