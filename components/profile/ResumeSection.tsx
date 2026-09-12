"use client";

import React, { useRef, useState } from "react";
import {
  CloudUpload,
  FileText,
  CheckCircle2,
  Loader2,
  FileCheck,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Download,
} from "lucide-react";

interface ResumeSectionProps {
  currentResumeUrl?: string | null;
  onFileSelect?: (file: File) => void;
  onExtractResume?: () => void;
  onGenerateResume?: () => void;
  isExtracting?: boolean;
  isGenerating?: boolean;
  isUploading?: boolean;
  uploadMessage?: { type: "success" | "error"; text: string } | null;
}

export function ResumeSection({
  currentResumeUrl,
  onFileSelect,
  onExtractResume,
  onGenerateResume,
  isExtracting = false,
  isGenerating = false,
  isUploading = false,
  uploadMessage = null,
}: ResumeSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFileName(file.name);
        onFileSelect?.(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      onFileSelect?.(file);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const hasResume = Boolean(selectedFileName || currentResumeUrl);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-text-primary">Resume</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Upload an existing resume to auto-fill the profile, or generate a new tailored one from your details below.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleSelectClick}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer group ${
          dragActive
            ? "border-accent bg-accent-muted/30"
            : "border-[#e2e8f0] bg-surface hover:border-accent/60 hover:bg-surface-secondary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleChange}
        />

        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-light/50 text-accent transition-transform group-hover:scale-105">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          ) : hasResume ? (
            <FileCheck className="h-6 w-6 text-accent" />
          ) : (
            <CloudUpload className="h-6 w-6 text-accent" />
          )}
        </div>

        <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
          {isUploading ? (
            <span className="text-accent">Uploading to InsForge Storage...</span>
          ) : selectedFileName ? (
            <span className="text-accent">Selected: {selectedFileName}</span>
          ) : currentResumeUrl ? (
            <span>Resume on file (Click or drag to replace)</span>
          ) : (
            "Click to upload or drag and drop"
          )}
        </p>

        <p className="mt-1 text-xs text-text-secondary">
          PDF formatting only. Maximum file size 5MB.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={isUploading || isExtracting}
            onClick={(e) => {
              e.stopPropagation();
              handleSelectClick();
            }}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary shadow-sm hover:bg-surface-secondary transition-colors cursor-pointer disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Select Resume"}
          </button>

          {/* Extract Profile from Resume Button */}
          {hasResume && onExtractResume && (
            <button
              type="button"
              disabled={isExtracting || isUploading}
              onClick={(e) => {
                e.stopPropagation();
                onExtractResume();
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-accent/40 bg-accent-muted px-4 py-2 text-sm font-medium text-accent hover:bg-accent-light transition-all shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <span>Extracting Profile with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span>Extract Profile from Resume</span>
                </>
              )}
            </button>
          )}

          {/* Download Resume Button */}
          {hasResume && (
            <a
              href="/api/resume/download"
              download="resume.pdf"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-all shadow-2xs cursor-pointer"
            >
              <Download className="h-4 w-4 text-text-muted" />
              <span>Download Resume</span>
            </a>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {uploadMessage && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3.5 text-sm font-medium ${
            uploadMessage.type === "success"
              ? "border border-success-light bg-success-lightest text-success-foreground"
              : "border border-error-border bg-error-light text-error"
          }`}
        >
          {uploadMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{uploadMessage.text}</span>
        </div>
      )}

      {/* Helper bar below dropzone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <p className="text-sm text-text-secondary">
          Need a fresh document based on the fields below?
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {currentResumeUrl && (
            <a
              href="/api/resume/preview"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-all shadow-2xs"
            >
              <ExternalLink className="h-4 w-4 text-text-muted" />
              <span>View Current Resume</span>
            </a>
          )}

          <button
            type="button"
            onClick={onGenerateResume}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 sm:px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-dark transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Resume from Profile
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

