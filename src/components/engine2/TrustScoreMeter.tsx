interface TrustScoreMeterProps {
  score: number;
}

const TrustScoreMeter = ({ score }: TrustScoreMeterProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = score < 40 ? "#E87D5B" : score < 65 ? "#E8C547" : "#5BE3A0";
  const label = score < 40 ? "LOW TRUST — significant gaps" : score < 65 ? "MODERATE TRUST — some concerns" : "HIGH TRUST — well evidenced";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[120px] h-[120px]">
        <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono" style={{ color }}>{score}</span>
          <span className="text-[9px] font-semibold tracking-widest uppercase text-muted-foreground">TRUST</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center leading-relaxed max-w-[160px]">{label}</p>
    </div>
  );
};

export default TrustScoreMeter;
