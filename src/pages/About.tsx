const AboutPage = () => {
  return (
    <div className="bg-page-gradient min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl py-24 animate-fade-up">
        {/* Title */}
        <h1 className="text-title-gradient text-4xl sm:text-5xl font-extrabold tracking-tight text-center">
          Why Outline AI Exists
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl mt-5 text-center leading-relaxed">
          The research world doesn't need more papers. It needs deeper understanding.
        </p>

        {/* Content */}
        <div className="mt-14 space-y-6 text-foreground/85 text-base leading-relaxed">
          <p>Every day, thousands of new research papers are published.</p>

          <p>
            Researchers don't struggle with access to papers.
            <br />
            They struggle with understanding them deeply and quickly.
          </p>

          <h2 className="font-bold text-foreground text-lg pt-4">Most people:</h2>

          <ul className="space-y-2.5 pl-5 list-disc marker:text-muted-foreground/50">
            <li>Read papers like novels — from start to finish</li>
            <li>Get lost in dense math and jargon</li>
            <li>Miss hidden assumptions and weak evidence</li>
            <li>Spend hours summarizing instead of thinking critically</li>
            <li>Overlook whether a paper is even worth reading</li>
          </ul>

          <p className="pt-2">
            And with the explosion of research in fields like machine learning, systems, and AI, this problem is only getting worse.
          </p>
        </div>

        {/* Final statement */}
        <p className="text-title-gradient text-xl sm:text-2xl font-bold text-center mt-16 leading-snug">
          We are drowning in papers — but starving for clarity.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
