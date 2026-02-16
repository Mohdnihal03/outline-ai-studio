import { BookOpen, Search, Lightbulb, AlertTriangle, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

const problems = [
  { icon: BookOpen, text: "Read papers like novels — from start to finish" },
  { icon: Search, text: "Get lost in dense math and jargon" },
  { icon: AlertTriangle, text: "Miss hidden assumptions and weak evidence" },
  { icon: Clock, text: "Spend hours summarizing instead of thinking critically" },
  { icon: Lightbulb, text: "Overlook whether a paper is even worth reading" },
];

const AboutPage = () => {
  return (
    <div className="bg-page-gradient min-h-screen relative overflow-hidden">
      <Navbar />
      {/* Dot pattern */}
      <div className="absolute inset-0 dot-pattern animate-fade-in-slow" />

      {/* Decorative orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-accent/30 blur-3xl" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-2xl py-24 sm:py-32">
          {/* Spacer for navbar */}
          <div className="h-8" />

          {/* Title */}
          <div className="animate-fade-up">
            <h1 className="text-title-gradient text-4xl sm:text-6xl font-extrabold tracking-[-0.03em] leading-tight">
              Why Outline AI
              <br />
              Exists
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl mt-6 leading-relaxed font-serif italic max-w-lg">
              The research world doesn't need more papers. It needs deeper understanding.
            </p>
          </div>

          {/* Divider */}
          <div className="my-14 h-px bg-border-soft animate-fade-up-delay" />

          {/* Content */}
          <div className="space-y-8 animate-fade-up-delay">
            <p className="text-foreground/80 text-base sm:text-lg leading-relaxed">
              Every day, thousands of new research papers are published.
            </p>

            <p className="text-foreground/80 text-base sm:text-lg leading-relaxed">
              Researchers don't struggle with access to papers.
              <br />
              <span className="text-foreground font-medium">They struggle with understanding them deeply and quickly.</span>
            </p>
          </div>

          {/* Problem cards */}
          <div className="mt-14 animate-fade-up-delay-2">
            <h2 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-6">
              Most people
            </h2>
            <div className="space-y-3">
              {problems.map(({ icon: Icon, text }, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card/60 border border-border-soft/50 hover:bg-card/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <p className="text-foreground/80 text-sm sm:text-base leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Closing */}
          <div className="mt-16 space-y-10">
            <p className="text-foreground/70 text-base sm:text-lg leading-relaxed animate-fade-up-delay-2">
              And with the explosion of research in fields like machine learning, systems, and AI, this problem is only getting worse.
            </p>

            <div className="animate-fade-up-delay-2">
              <div className="card-glass rounded-2xl p-8 sm:p-10 border border-border-soft/50 text-center">
                <p className="text-title-gradient text-xl sm:text-2xl font-bold leading-snug font-serif">
                  "We are drowning in papers —
                  <br />
                  but starving for clarity."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
