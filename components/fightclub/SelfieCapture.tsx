"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

type Mode = "idle" | "camera" | "preview";

// Step 3 of the boxer flow. Capture via device camera (getUserMedia, front
// camera) with a file-upload fallback. Preview + retake. Uploads to the
// private boxer-selfies bucket through the server and returns the path.
export function SelfieCapture({
  onUploaded,
  uploadedPath,
}: {
  onUploaded: (path: string | null) => void;
  uploadedPath: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setMode("camera");
      // wait a tick for the video element to mount
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setError("Couldn't open the camera. Use 'Upload a photo' instead.");
      fileInputRef.current?.click();
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (b) => {
        if (!b) return;
        stopCamera();
        setBlob(b);
        setPreviewUrl(URL.createObjectURL(b));
        setMode("preview");
      },
      "image/jpeg",
      0.9
    );
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    stopCamera();
    setBlob(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMode("preview");
  }

  function retake() {
    onUploaded(null);
    setBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setMode("idle");
  }

  async function upload() {
    if (!blob || uploading) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", blob, "selfie.jpg");
      const res = await fetch("/api/fightclub/upload-selfie", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed.");
      onUploaded(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const confirmed = Boolean(uploadedPath);

  return (
    <div className="mx-auto max-w-md text-center">
      <p className="mb-6 text-sm text-[var(--fc-muted)]">
        Snap a quick selfie so we can verify you at the gate.
      </p>

      <div className="fc-card mb-5 flex aspect-square w-full items-center justify-center overflow-hidden p-0">
        {mode === "camera" ? (
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        ) : previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Selfie preview" className="h-full w-full object-cover" />
        ) : (
          <span className="select-none text-6xl opacity-20" aria-hidden>
            📷
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={onFile}
        className="hidden"
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {confirmed ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--fc-ember)]">✓ Selfie saved.</p>
          <button type="button" onClick={retake} className="btn-blood-ghost w-full">
            Retake
          </button>
        </div>
      ) : mode === "idle" ? (
        <div className="flex flex-col gap-3">
          <button type="button" onClick={startCamera} className="btn-blood w-full">
            Open Camera
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-blood-ghost w-full"
          >
            Upload a photo
          </button>
        </div>
      ) : mode === "camera" ? (
        <button type="button" onClick={capture} className="btn-blood w-full">
          Capture
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={upload}
            disabled={uploading}
            className={cn("btn-blood w-full")}
          >
            {uploading ? "Uploading…" : "Use this photo"}
          </button>
          <button type="button" onClick={retake} className="btn-blood-ghost w-full">
            Retake
          </button>
        </div>
      )}
    </div>
  );
}
