"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadZoneProps {
  onUploadComplete?: (counts: Record<string, number>) => void;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))) {
      setFile(droppedFile);
    } else {
      toast.error("Please upload an .xlsx or .xls file");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Data uploaded successfully! ${data.counts.products} products, ${data.counts.stores} stores, ${data.counts.purchaseHistory} transactions, ${data.counts.promotions} promotions`);
        onUploadComplete?.(data.counts);
        setFile(null);
      } else {
        toast.error(data.error || "Upload failed");
      }

      if (data.errors?.length > 0) {
        data.errors.forEach((err: string) => toast.warning(err));
      }
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <div className="text-gray-500 space-y-2">
            <p className="text-lg font-medium">Drop Excel file here</p>
            <p className="text-sm">or click to browse</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Choose file
            </label>
          </div>

          {file && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>

        {file && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 w-full bg-[#004B87] hover:bg-[#003A6B]"
          >
            {uploading ? "Uploading & Parsing..." : "Upload & Parse"}
          </Button>
        )}

        <p className="text-xs text-gray-400 mt-3">
          Expected sheets: Products, Stores, PurchaseHistory, Promotions. Only non-empty sheets will be imported.
        </p>
      </CardContent>
    </Card>
  );
}
