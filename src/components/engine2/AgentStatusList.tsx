import { Agent, AgentStatus } from "./types";

interface AgentStatusListProps {
  agents: Agent[];
  statuses: Record<string, AgentStatus>;
}

const AgentStatusList = ({ agents, statuses }: AgentStatusListProps) => {
  return (
    <div className="space-y-2">
      {agents.map((agent) => {
        const status = statuses[agent.id] || "idle";
        return (
          <div key={agent.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-sm"
                style={{ color: status !== "idle" ? agent.color : "hsl(var(--muted-foreground))" }}
              >
                {agent.icon}
              </span>
              <span className="text-xs text-foreground">{agent.label}</span>
            </div>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: status === "idle" ? "hsl(var(--border))" : agent.color,
                boxShadow: status === "running" ? `0 0 6px ${agent.color}` : "none",
                animation: status === "running" ? "pulse 2s ease-in-out infinite" : "none",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default AgentStatusList;
