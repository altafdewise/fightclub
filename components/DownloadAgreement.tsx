"use client";

import { Download, AlertCircle } from "lucide-react";
import { useState } from "react";

export function DownloadAgreement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/portal/undertaking/download");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to download undertaking");
      }

      // Create blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "BRUTAL-Undertaking.pdf";
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="?([^"]+)"?/);
        if (matches?.[1]) {
          filename = matches[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Failed to download undertaking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-white/20 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/[0.08] hover:border-white/30 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        {isLoading ? "Downloading..." : "Download Undertaking"}
      </button>

      {error && (
        <div className="flex items-start gap-2 rounded-[10px] bg-red-500/10 border border-red-500/20 p-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
