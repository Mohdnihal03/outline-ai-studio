import { useState, useCallback } from "react";
import { Upload } from "lucide-react";

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
    <div className="w-full max-w-lg mx-auto animate-fade-up-delay-2">
      <div className="card-glass rounded-2xl p-8">
        <label
          htmlFor="pdf-upload"
          className={`border-upload rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging ? "border-foreground/40 scale-[1.02]" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-10 h-10 text-muted-foreground mb-4" strokeWidth={1.5} />
          {fileName ? (
            <p className="text-sm font-medium text-foreground">{fileName}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">
                Upload a research paper (PDF)
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">Max file size: 20MB</p>
            </>
          )}
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <button className="w-full mt-6 bg-primary text-primary-foreground rounded-full py-3 text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          Analyze Paper
        </button>
      </div>
    </div>
  );
};

export default UploadCard;
