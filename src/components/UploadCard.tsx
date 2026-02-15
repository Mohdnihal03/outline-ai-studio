import { useState, useCallback } from "react";
import { Upload, CheckCircle2 } from "lucide-react";

const UploadCard = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setFileName(file.name);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto animate-fade-up-delay-2">
      <div className="card-glass rounded-2xl p-6 sm:p-8 border border-border-soft/50">
        <label
          htmlFor="pdf-upload"
          className={`border-upload rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center cursor-pointer ${
            isDragging ? "border-foreground/30 scale-[1.02] bg-accent/30" : ""
          } ${fileName ? "border-solid border-accent" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {fileName ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-foreground text-center truncate max-w-[250px]">{fileName}</p>
              <p className="text-xs text-muted-foreground">Click to change file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-accent/60 flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop your research paper here
                </p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse · PDF up to 20MB</p>
              </div>
            </div>
          )}
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <button className="w-full mt-5 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 tracking-wide">
          Analyze Paper
        </button>
      </div>
    </div>
  );
};

export default UploadCard;
