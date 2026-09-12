"use client";

import React, { useState, useEffect } from "react";
import { CompletionBanner } from "@/components/profile/CompletionBanner";
import { ResumeSection } from "@/components/profile/ResumeSection";
import { ProfileForm, ProfileFormHandle } from "@/components/profile/ProfileForm";
import { UserProfile } from "@/types";
import { uploadResume, extractResumeProfile } from "@/app/actions/profile";

interface ProfileClientProps {
  initialProfile: UserProfile | null;
  userEmail: string;
}

export function ProfileClient({ initialProfile, userEmail }: ProfileClientProps) {
  const formRef = React.useRef<ProfileFormHandle>(null);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const [uploadMessage, setUploadMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sync state if initialProfile changes from server revalidation
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  // Calculate missing fields and dynamic completion percentage
  const calculateCompleteness = (current: Partial<UserProfile> | null) => {
    const missing: string[] = [];

    const hasName = Boolean(current?.full_name && current.full_name.trim().length > 0);
    const hasEmail = Boolean((current?.email && current.email.trim().length > 0) || userEmail);
    const hasTitle = Boolean(current?.current_title && current.current_title.trim().length > 0);
    const hasExpLevel = Boolean(current?.experience_level && current.experience_level.trim().length > 0);
    const hasSkills = Boolean(current?.skills && current.skills.length > 0);
    const hasWorkExp = Boolean(current?.work_experience && current.work_experience.length > 0);
    const hasDegree = Boolean(current?.education?.highest_degree);

    const hasPhone = Boolean(current?.phone && current.phone.trim().length > 0);
    const hasLocation = Boolean(current?.location && current.location.trim().length > 0);
    const hasEducationDetails = Boolean(
      current?.education?.institution &&
      current?.education?.institution.trim().length > 0 &&
      current?.education?.graduation_year &&
      current?.education?.graduation_year.trim().length > 0
    );

    if (!hasPhone) missing.push("PHONE");
    if (!hasLocation) missing.push("LOCATION");
    if (!hasEducationDetails) missing.push("EDUCATION");

    // 10 Core requirements
    let score = 0;
    if (hasName) score += 1;
    if (hasEmail) score += 1;
    if (hasTitle) score += 1;
    if (hasExpLevel) score += 1;
    if (hasSkills) score += 1;
    if (hasWorkExp) score += 1;
    if (hasDegree) score += 1;
    if (hasPhone) score += 1;
    if (hasLocation) score += 1;
    if (hasEducationDetails) score += 1;

    const percentage = Math.min(100, Math.max(0, Math.round((score / 10) * 100)));

    return { percentage, missing };
  };

  const completeness = calculateCompleteness(profile);

  const handleProfileChange = (updatedPartial: Partial<UserProfile>) => {
    setProfile((prev) => ({
      ...(prev || ({} as UserProfile)),
      ...updatedPartial,
    } as UserProfile));
  };

  const handleProfileSaved = (savedProfile: UserProfile) => {
    setProfile(savedProfile);
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadResume(formData);

      if (res.success && res.url) {
        setProfile((prev) => ({
          ...(prev || ({} as UserProfile)),
          resume_pdf_url: res.url,
        } as UserProfile));
        setUploadMessage({
          type: "success",
          text: `Resume "${file.name}" uploaded to InsForge Storage! Click "Extract Profile from Resume" to auto-fill your profile.`,
        });
      } else {
        setUploadMessage({
          type: "error",
          text: res.error || "Failed to upload resume file.",
        });
      }
    } catch (err) {
      console.error(err);
      setUploadMessage({
        type: "error",
        text: "An unexpected error occurred while uploading.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleExtractResume = async () => {
    setIsExtracting(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await extractResumeProfile(selectedFile ? formData : undefined);

      if (res.success && res.data) {
        const extracted = res.data;

        // Apply imperatively to form without clobbering existing user inputs
        formRef.current?.applyExtracted(extracted);

        setProfile((prev) => ({
          ...(prev || ({} as UserProfile)),
          ...extracted,
          email: prev?.email || userEmail,
          id: prev?.id || "",
          resume_pdf_url: prev?.resume_pdf_url || null,
        } as UserProfile));

        setUploadMessage({
          type: "success",
          text: "Profile data successfully extracted with AI! Review the fields below and click Save Profile.",
        });
      } else {
        setUploadMessage({
          type: "error",
          text: res.error || "Failed to extract profile from resume.",
        });
      }
    } catch (err) {
      console.error("[ProfileClient] Extraction error:", err);
      setUploadMessage({
        type: "error",
        text: "An unexpected error occurred during profile extraction.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    setUploadMessage(null);
    try {
      // Get current live form data from imperative handle or fall back to profile state
      const liveFormData = formRef.current?.getFormData() || profile || {};

      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(liveFormData),
      });

      const data = await res.json();

      if (res.ok && data.success && data.resume_pdf_url) {
        setProfile((prev) => ({
          ...(prev || ({} as UserProfile)),
          ...liveFormData,
          resume_pdf_url: data.resume_pdf_url,
        } as UserProfile));

        if (data.ai_polished === false) {
          setUploadMessage({
            type: "error",
            text: data.warning || "AI polish unavailable — resume generated from your saved profile data. Try again shortly.",
          });
        } else {
          setUploadMessage({
            type: "success",
            text: "Resume successfully generated and saved! Click 'View Current Resume' to inspect your new document.",
          });
        }
      } else {
        setUploadMessage({
          type: "error",
          text: data.error || "Failed to generate resume from profile.",
        });
      }
    } catch (err) {
      console.error("[ProfileClient] Resume generation error:", err);
      setUploadMessage({
        type: "error",
        text: "An unexpected error occurred while generating the resume.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-[860px] space-y-6">
      {/* 1. Completion Banner */}
      <CompletionBanner
        percentage={completeness.percentage}
        missingFields={completeness.missing}
      />

      {/* 2. Resume Section */}
      <ResumeSection
        currentResumeUrl={profile?.resume_pdf_url}
        onFileSelect={handleFileSelect}
        onExtractResume={handleExtractResume}
        onGenerateResume={handleGenerateResume}
        isExtracting={isExtracting}
        isGenerating={isGenerating}
        isUploading={isUploading}
        uploadMessage={uploadMessage}
      />

      {/* 3. Profile Information Form */}
      <ProfileForm
        ref={formRef}
        initialProfile={profile}
        userEmail={userEmail}
        onProfileChange={handleProfileChange}
        onProfileSaved={handleProfileSaved}
      />
    </div>
  );
}


