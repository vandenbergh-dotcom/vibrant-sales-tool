"use client";

import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  imageData: string | null;
  fileName?: string;
  loading?: boolean;
}

export function DownloadButton({ imageData, fileName = "recommendation-flyer.png", loading }: DownloadButtonProps) {
  const handleDownload = () => {
    if (!imageData) return;

    const link = document.createElement("a");
    link.href = imageData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!imageData) return;

    try {
      const response = await fetch(imageData);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
    } catch {
      // Fallback: open in new tab
      window.open(imageData, "_blank");
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleDownload}
        disabled={!imageData || loading}
        className="bg-[#004B87] hover:bg-[#003A6B]"
      >
        {loading ? "Generating..." : "Download PNG"}
      </Button>
      <Button
        variant="outline"
        onClick={handleCopy}
        disabled={!imageData || loading}
      >
        Copy to Clipboard
      </Button>
    </div>
  );
}
