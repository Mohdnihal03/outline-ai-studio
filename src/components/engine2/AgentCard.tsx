import { Agent, AgentStatus } from "./types";

interface AgentCardProps {
  agent: Agent;
  status: AgentStatus;
  onClick: () => void;
}

const statusLabels: Record<AgentStatus, string> = {
  idle: "WAITING",
  running: "ANALYZING",
  done: "COMPLETE",
};

const AgentCard = ({ agent, status, onClick }: AgentCardProps) => {
  const isClickable = status === "done";

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className="relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm p-5 transition-all duration-200 box-border"
      style={{
        borderColor: status === "running" ? agent.color : status === "done" ? `${agent.color}40` : undefined,
        boxShadow: status === "running" ? `0 0 20px ${agent.color}25` : undefined,
        cursor: isClickable ? "pointer" : "default",
      }}
    >
      {status === "running" && (
        <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
          <div
            className="h-full w-full animate-[scan_1.5s_ease-in-out_infinite]"
            style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }}
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl" style={{ color: status !== "idle" ? agent.color : "hsl(var(--muted-foreground))" }}>
          {agent.icon}
        </span>
        <span
          className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
          style={{
            borderColor: `${agent.color}40`,
            color: agent.color,
            backgroundColor: `${agent.color}10`,
          }}
        >
          {statusLabels[status]}
        </span>
      </div>

      <h3 className="text-sm font-semibold leading-none tracking-tight text-foreground mb-1.5">
        {agent.label}
      </h3>

      <p className="text-xs text-muted-foreground mb-2">{agent.description}</p>

      <p className="text-[10px] font-medium tracking-wide" style={{ color: agent.color }}>
        Section: {agent.section}
      </p>

      {status === "done" && (
        <p className="text-xs font-medium mt-3 tracking-wide" style={{ color: agent.color }}>
          VIEW RESULTS
        </p>
      )}
    </div>
  );
};

export default AgentCard;
