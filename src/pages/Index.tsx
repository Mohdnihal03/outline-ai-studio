import UploadCard from "@/components/UploadCard";

const Index = () => {
  return (
    <div className="bg-page-gradient min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl flex flex-col items-center gap-12 py-20">
        {/* Hero */}
        <div className="text-center animate-fade-up">
          <div className="glow-title inline-block">
            <h1 className="text-title-gradient text-6xl sm:text-7xl font-extrabold tracking-tight">
              Outline AI
            </h1>
          </div>
          <p className="animate-fade-up-delay text-muted-foreground text-lg sm:text-xl mt-6 tracking-wide">
            Structured Thinking for Research Papers
          </p>
        </div>

        {/* Upload */}
        <UploadCard />
      </div>
    </div>
  );
};

export default Index;
