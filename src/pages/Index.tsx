import UploadCard from "@/components/UploadCard";
import Navbar from "@/components/Navbar";
import { FileText, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="bg-page-gradient min-h-screen relative overflow-hidden">
      <Navbar />
      {/* Dot pattern background */}
      <div className="absolute inset-0 dot-pattern animate-fade-in-slow" />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-accent/40 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-accent/30 blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-2xl flex flex-col items-center gap-16 py-24">
          {/* Badge */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/60 border border-border-soft text-xs font-medium text-muted-foreground tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Research Analysis
            </div>
          </div>

          {/* Hero */}
          <div className="text-center -mt-4 animate-fade-up">
            <div className="glow-title inline-block">
              <h1 className="text-title-gradient text-6xl sm:text-8xl font-extrabold tracking-[-0.03em] leading-none">
                Outline AI
              </h1>
            </div>
            <p className="animate-fade-up-delay text-muted-foreground text-lg sm:text-xl mt-8 font-serif italic">
              Structured Thinking for Research Papers
            </p>
          </div>

          {/* Upload */}
          <UploadCard />

          {/* Bottom hint */}
          <div className="animate-fade-up-delay-2 flex items-center gap-2 text-muted-foreground/50 text-xs">
            <FileText className="w-3.5 h-3.5" />
            <span>Supports PDF research papers up to 20MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
