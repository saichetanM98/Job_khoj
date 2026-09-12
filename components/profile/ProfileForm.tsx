"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import {
  Calendar,
  ChevronDown,
  Plus,
  X,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import { UserProfile, WorkExperienceRole, EducationRecord } from "@/types";
import { saveProfile } from "@/app/actions/profile";

export interface ProfileFormHandle {
  applyExtracted: (extracted: Partial<UserProfile>) => void;
  getFormData: () => Partial<UserProfile>;
}

export interface ProfileFormProps {
  initialProfile?: UserProfile | null;
  userEmail?: string;
  onProfileChange?: (profile: Partial<UserProfile>) => void;
  onProfileSaved?: (profile: UserProfile) => void;
}

export const ProfileForm = forwardRef<ProfileFormHandle, ProfileFormProps>(function ProfileForm(
  {
    initialProfile,
    userEmail = "",
    onProfileChange,
    onProfileSaved,
  },
  ref
) {
  // Form State initialized with either initialProfile or clean defaults
  const [fullName, setFullName] = useState(
    initialProfile?.full_name ?? (userEmail ? userEmail.split("@")[0] : "")
  );
  const [email] = useState(
    initialProfile?.email ?? userEmail ?? ""
  );

  const [phone, setPhone] = useState(initialProfile?.phone ?? "");
  const [location, setLocation] = useState(initialProfile?.location ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(
    initialProfile?.linkedin_url ?? ""
  );
  const [portfolioUrl, setPortfolioUrl] = useState(
    initialProfile?.portfolio_url ?? ""
  );
  const [workAuthorization, setWorkAuthorization] = useState(
    initialProfile?.work_authorization ?? "Citizen"
  );

  // Professional Info
  const [currentTitle, setCurrentTitle] = useState(
    initialProfile?.current_title ?? ""
  );
  const [experienceLevel, setExperienceLevel] = useState(
    initialProfile?.experience_level ?? "Junior"
  );
  const [yearsExperience, setYearsExperience] = useState(
    initialProfile?.years_experience?.toString() ?? "0"
  );

  // Skills
  const [skills, setSkills] = useState<string[]>(
    initialProfile?.skills ?? []
  );
  const [skillInput, setSkillInput] = useState("");

  // Industries
  const [industries, setIndustries] = useState<string[]>(
    initialProfile?.industries ?? []
  );
  const [industryInput, setIndustryInput] = useState("");

  // Work Experience
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceRole[]>(
    initialProfile?.work_experience && initialProfile.work_experience.length > 0
      ? initialProfile.work_experience
      : [
          {
            company: "",
            job_title: "",
            start_date: "",
            end_date: "",
            currently_working: false,
            responsibilities: "",
          },
        ]
  );

  // Education
  const [education, setEducation] = useState<EducationRecord>(
    initialProfile?.education ?? {
      highest_degree: "Bachelor's Degree",
      field_of_study: "",
      institution: "",
      graduation_year: "",
    }
  );

  // Job Preferences
  const [jobTitlesSeeking, setJobTitlesSeeking] = useState(
    initialProfile?.job_titles_seeking?.join(", ") ?? ""
  );
  const [remotePreference, setRemotePreference] = useState(
    initialProfile?.remote_preference ?? "Any"
  );
  const [salaryExpectation, setSalaryExpectation] = useState(
    initialProfile?.salary_expectation ?? ""
  );
  const [preferredLocations, setPreferredLocations] = useState(
    initialProfile?.preferred_locations?.join(", ") ?? ""
  );
  const [coverLetterTone, setCoverLetterTone] = useState(
    initialProfile?.cover_letter_tone ?? "Formal"
  );

  // Sync state if initialProfile changes from server revalidation
  useEffect(() => {
    if (initialProfile) {
      if (initialProfile.full_name !== undefined && initialProfile.full_name !== null) {
        setFullName(initialProfile.full_name);
      }
      if (initialProfile.phone !== undefined && initialProfile.phone !== null) {
        setPhone(initialProfile.phone);
      }
      if (initialProfile.location !== undefined && initialProfile.location !== null) {
        setLocation(initialProfile.location);
      }
      if (initialProfile.linkedin_url !== undefined && initialProfile.linkedin_url !== null) {
        setLinkedinUrl(initialProfile.linkedin_url);
      }
      if (initialProfile.portfolio_url !== undefined && initialProfile.portfolio_url !== null) {
        setPortfolioUrl(initialProfile.portfolio_url);
      }
      if (initialProfile.work_authorization !== undefined && initialProfile.work_authorization !== null) {
        setWorkAuthorization(initialProfile.work_authorization);
      }
      if (initialProfile.current_title !== undefined && initialProfile.current_title !== null) {
        setCurrentTitle(initialProfile.current_title);
      }
      if (initialProfile.experience_level !== undefined && initialProfile.experience_level !== null) {
        setExperienceLevel(initialProfile.experience_level);
      }
      if (initialProfile.years_experience !== undefined && initialProfile.years_experience !== null) {
        setYearsExperience(initialProfile.years_experience.toString());
      }
      if (initialProfile.skills) {
        setSkills(initialProfile.skills);
      }
      if (initialProfile.industries) {
        setIndustries(initialProfile.industries);
      }
      if (initialProfile.work_experience && initialProfile.work_experience.length > 0) {
        setWorkExperiences(initialProfile.work_experience);
      }
      if (initialProfile.education) {
        setEducation(initialProfile.education);
      }
      if (initialProfile.job_titles_seeking) {
        setJobTitlesSeeking(initialProfile.job_titles_seeking.join(", "));
      }
      if (initialProfile.remote_preference) {
        setRemotePreference(initialProfile.remote_preference);
      }
      if (initialProfile.salary_expectation) {
        setSalaryExpectation(initialProfile.salary_expectation);
      }
      if (initialProfile.preferred_locations) {
        setPreferredLocations(initialProfile.preferred_locations.join(", "));
      }
      if (initialProfile.cover_letter_tone) {
        setCoverLetterTone(initialProfile.cover_letter_tone);
      }
    }
  }, [initialProfile]);

  // Expose imperative handle for parent component
  useImperativeHandle(ref, () => ({
    getFormData() {
      return {
        full_name: fullName,
        email,
        phone,
        location,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        work_authorization: workAuthorization,
        current_title: currentTitle,
        experience_level: experienceLevel,
        years_experience: parseInt(yearsExperience) || 0,
        skills,
        industries,
        work_experience: workExperiences,
        education,
        job_titles_seeking: jobTitlesSeeking
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        remote_preference: remotePreference,
        salary_expectation: salaryExpectation,
        preferred_locations: preferredLocations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        cover_letter_tone: coverLetterTone,
      };
    },
    applyExtracted(extracted: Partial<UserProfile>) {
      if (extracted.full_name) setFullName(extracted.full_name);
      if (extracted.phone) setPhone(extracted.phone);
      if (extracted.location) setLocation(extracted.location);
      if (extracted.linkedin_url) setLinkedinUrl(extracted.linkedin_url);
      if (extracted.portfolio_url) setPortfolioUrl(extracted.portfolio_url);
      if (extracted.work_authorization) setWorkAuthorization(extracted.work_authorization);
      if (extracted.current_title) setCurrentTitle(extracted.current_title);
      if (extracted.experience_level) setExperienceLevel(extracted.experience_level);
      if (typeof extracted.years_experience === "number") setYearsExperience(extracted.years_experience.toString());
      if (extracted.skills && extracted.skills.length > 0) setSkills(extracted.skills);
      if (extracted.industries && extracted.industries.length > 0) setIndustries(extracted.industries);
      if (extracted.work_experience && extracted.work_experience.length > 0) setWorkExperiences(extracted.work_experience);
      if (extracted.education) setEducation(extracted.education);
      if (extracted.job_titles_seeking && extracted.job_titles_seeking.length > 0) setJobTitlesSeeking(extracted.job_titles_seeking.join(", "));
      if (extracted.remote_preference) setRemotePreference(extracted.remote_preference);
      if (extracted.salary_expectation) setSalaryExpectation(extracted.salary_expectation);
      if (extracted.preferred_locations && extracted.preferred_locations.length > 0) setPreferredLocations(extracted.preferred_locations.join(", "));
      if (extracted.cover_letter_tone) setCoverLetterTone(extracted.cover_letter_tone);

      notifyChange(extracted);
    },
  }));

  // UI state
  const [isSaving, setIsSaving] = useState(false);

  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Handler for adding skill
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      setSkillInput("");
      notifyChange({ skills: updated });
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    notifyChange({ skills: updated });
  };

  // Handler for adding industry
  const handleAddIndustry = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = industryInput.trim();
    if (trimmed && !industries.includes(trimmed)) {
      const updated = [...industries, trimmed];
      setIndustries(updated);
      setIndustryInput("");
      notifyChange({ industries: updated });
    }
  };

  const handleRemoveIndustry = (industryToRemove: string) => {
    const updated = industries.filter((i) => i !== industryToRemove);
    setIndustries(updated);
    notifyChange({ industries: updated });
  };

  // Work experience handlers
  const handleAddRole = () => {
    const newRole: WorkExperienceRole = {
      company: "",
      job_title: "",
      start_date: "",
      end_date: "",
      currently_working: false,
      responsibilities: "",
    };
    const updated = [...workExperiences, newRole];
    setWorkExperiences(updated);
    notifyChange({ work_experience: updated });
  };

  const handleRemoveRole = (index: number) => {
    const updated = workExperiences.filter((_, idx) => idx !== index);
    setWorkExperiences(updated);
    notifyChange({ work_experience: updated });
  };

  const handleRoleChange = (
    index: number,
    field: keyof WorkExperienceRole,
    value: string | boolean
  ) => {
    const updated = [...workExperiences];
    updated[index] = { ...updated[index], [field]: value };
    setWorkExperiences(updated);
    notifyChange({ work_experience: updated });
  };

  // Notify parent of state changes for live calculation of completion ring
  const notifyChange = (partial: Partial<UserProfile>) => {
    onProfileChange?.({
      full_name: fullName,
      email,
      phone,
      location,
      linkedin_url: linkedinUrl,
      portfolio_url: portfolioUrl,
      work_authorization: workAuthorization,
      current_title: currentTitle,
      experience_level: experienceLevel,
      years_experience: parseInt(yearsExperience) || 0,
      skills,
      industries,
      work_experience: workExperiences,
      education,
      job_titles_seeking: jobTitlesSeeking
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      remote_preference: remotePreference,
      salary_expectation: salaryExpectation,
      preferred_locations: preferredLocations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      cover_letter_tone: coverLetterTone,
      ...partial,
    });
  };

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      const res = await saveProfile({
        full_name: fullName,
        phone,
        location,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        work_authorization: workAuthorization,
        current_title: currentTitle,
        experience_level: experienceLevel,
        years_experience: parseInt(yearsExperience) || 0,
        skills,
        industries,
        work_experience: workExperiences,
        education,
        job_titles_seeking: jobTitlesSeeking
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        remote_preference: remotePreference,
        salary_expectation: salaryExpectation,
        preferred_locations: preferredLocations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        cover_letter_tone: coverLetterTone,
      });

      if (res.success) {
        setSaveStatus("success");
        if (res.profile) {
          onProfileSaved?.(res.profile);
        }
        setTimeout(() => setSaveStatus("idle"), 4000);
      } else {
        setSaveStatus("error");
        setErrorMessage(res.error || "Failed to save profile.");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">
          Profile Information
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          This context is used to accurately represent you in agent interactions.
        </p>
      </div>

      <div className="border-b border-border" />

      {/* 1. Personal Info */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-text-primary">
          Personal Info
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              FULL NAME
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                notifyChange({ full_name: e.target.value });
              }}
              placeholder="Faizan Ali"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full rounded-lg border border-border bg-surface-secondary px-3.5 py-2.5 text-sm text-text-secondary focus:outline-none cursor-default"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              PHONE NUMBER
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                notifyChange({ phone: e.target.value });
              }}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              LOCATION
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                notifyChange({ location: e.target.value });
              }}
              placeholder="City, Country"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              LINKEDIN URL
            </label>
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => {
                setLinkedinUrl(e.target.value);
                notifyChange({ linkedin_url: e.target.value });
              }}
              placeholder="https://linkedin.com/in/faizan"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
          </div>

          {/* Portfolio / GitHub */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              PORTFOLIO / GITHUB
            </label>
            <input
              type="text"
              value={portfolioUrl}
              onChange={(e) => {
                setPortfolioUrl(e.target.value);
                notifyChange({ portfolio_url: e.target.value });
              }}
              placeholder="https://github.com/jsmastery"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
          </div>
        </div>

        {/* Work Authorization */}
        <div className="w-full md:w-1/2 md:pr-2.5 pt-1">
          <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
            WORK AUTHORIZATION
          </label>
          <div className="relative">
            <select
              value={workAuthorization}
              onChange={(e) => {
                setWorkAuthorization(e.target.value);
                notifyChange({ work_authorization: e.target.value });
              }}
              className="w-full appearance-none rounded-lg border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition cursor-pointer"
            >
              <option value="Citizen">Citizen</option>
              <option value="Permanent Resident">Permanent Resident</option>
              <option value="Work Visa (H1-B, etc.)">Work Visa (H1-B, etc.)</option>
              <option value="Need Sponsorship">Need Sponsorship</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          </div>
        </div>
      </div>

      <div className="border-b border-border" />

      {/* 2. Professional Info */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-text-primary">
          Professional Info
        </h3>

        {/* Current / Recent Job Title */}
        <div>
          <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
            CURRENT/RECENT JOB TITLE
          </label>
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => {
              setCurrentTitle(e.target.value);
              notifyChange({ current_title: e.target.value });
            }}
            placeholder="Frontend Engineer"
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Experience Level */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              EXPERIENCE LEVEL
            </label>
            <div className="relative">
              <select
                value={experienceLevel}
                onChange={(e) => {
                  setExperienceLevel(e.target.value);
                  notifyChange({ experience_level: e.target.value });
                }}
                className="w-full appearance-none rounded-lg border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition cursor-pointer"
              >
                <option value="Entry">Entry Level</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Principal">Principal</option>
                <option value="Director">Director / Executive</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            </div>
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              YEARS OF EXPERIENCE
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={yearsExperience}
              onChange={(e) => {
                setYearsExperience(e.target.value);
                notifyChange({ years_experience: parseInt(e.target.value) || 0 });
              }}
              placeholder="4"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
            SKILLS
          </label>
          <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add a skill"
              className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddSkill()}
              className="border-l border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Skill Tags */}
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1 text-xs font-medium text-text-primary hover:bg-surface-secondary transition-colors shadow-2xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-text-secondary hover:text-error transition-colors cursor-pointer"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Industries Worked In */}
        <div>
          <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
            INDUSTRIES WORKED IN (OPTIONAL)
          </label>
          <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition">
            <input
              type="text"
              value={industryInput}
              onChange={(e) => setIndustryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddIndustry();
                }
              }}
              placeholder="E.g. FinTech, Healthcare"
              className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddIndustry()}
              className="border-l border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Industry Tags */}
          {industries.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {industries.map((ind) => (
                <span
                  key={ind}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1 text-xs font-medium text-text-primary hover:bg-surface-secondary transition-colors shadow-2xs"
                >
                  {ind}
                  <button
                    type="button"
                    onClick={() => handleRemoveIndustry(ind)}
                    className="text-text-secondary hover:text-error transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-border" />

      {/* 3. Work Experience */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">
            Work Experience
          </h3>
          <button
            type="button"
            onClick={handleAddRole}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add role
          </button>
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          {workExperiences.map((role, index) => (
            <div
              key={index}
              className="relative rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-4"
            >
              {workExperiences.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRole(index)}
                  className="absolute right-4 top-4 text-text-muted hover:text-error transition-colors p-1"
                  title="Remove role"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
                    COMPANY NAME
                  </label>
                  <input
                    type="text"
                    value={role.company}
                    onChange={(e) =>
                      handleRoleChange(index, "company", e.target.value)
                    }
                    placeholder="Vercel"
                    className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
                  />
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
                    JOB TITLE
                  </label>
                  <input
                    type="text"
                    value={role.job_title}
                    onChange={(e) =>
                      handleRoleChange(index, "job_title", e.target.value)
                    }
                    placeholder="Frontend Engineer"
                    className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
                    START DATE
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={role.start_date}
                      onChange={(e) =>
                        handleRoleChange(index, "start_date", e.target.value)
                      }
                      placeholder="January 2022"
                      className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
                    />
                    <Calendar className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dark" />
                  </div>
                </div>

                {/* End Date with Currently working here checkbox */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase text-text-dark tracking-wider">
                      END DATE
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-text-dark font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={role.currently_working}
                        onChange={(e) =>
                          handleRoleChange(
                            index,
                            "currently_working",
                            e.target.checked
                          )
                        }
                        className="h-3.5 w-3.5 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
                      />
                      Currently working here
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={role.currently_working}
                    value={role.currently_working ? "-------- ----" : role.end_date}
                    onChange={(e) =>
                      handleRoleChange(index, "end_date", e.target.value)
                    }
                    placeholder="-------- ----"
                    className={`w-full rounded-lg border border-border px-3.5 py-2.5 text-sm transition ${
                      role.currently_working
                        ? "bg-surface-secondary text-text-muted cursor-not-allowed"
                        : "bg-surface text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    }`}
                  />
                </div>
              </div>

              {/* Key Responsibilities */}
              <div>
                <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
                  KEY RESPONSIBILITIES
                </label>
                <textarea
                  rows={3}
                  value={role.responsibilities}
                  onChange={(e) =>
                    handleRoleChange(index, "responsibilities", e.target.value)
                  }
                  placeholder="Built Next.js features and optimized web vitals. Led a team of 3 developers."
                  className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition resize-y min-h-[85px]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-border" />

      {/* 4. Education */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-text-primary">Education</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Highest Degree */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              HIGHEST DEGREE
            </label>
            <div className="relative">
              <select
                value={education.highest_degree}
                onChange={(e) => {
                  const updated = {
                    ...education,
                    highest_degree: e.target.value,
                  };
                  setEducation(updated);
                  notifyChange({ education: updated });
                }}
                className="w-full appearance-none rounded-lg border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition cursor-pointer"
              >
                <option value="High School">High School</option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="MBA">Master of Business Administration (MBA)</option>
                <option value="Doctorate">Doctorate / Ph.D.</option>
                <option value="Bootcamp">Bootcamp / Self-taught</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            </div>
          </div>

          {/* Field of Study */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              FIELD OF STUDY
            </label>
            <input
              type="text"
              value={education.field_of_study}
              onChange={(e) => {
                const updated = {
                  ...education,
                  field_of_study: e.target.value,
                };
                setEducation(updated);
                notifyChange({ education: updated });
              }}
              placeholder="Computer Science"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
          </div>

          {/* Institution Name */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              INSTITUTION NAME
            </label>
            <input
              type="text"
              value={education.institution}
              onChange={(e) => {
                const updated = {
                  ...education,
                  institution: e.target.value,
                };
                setEducation(updated);
                notifyChange({ education: updated });
              }}
              placeholder="E.g. State University"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              GRADUATION YEAR
            </label>
            <input
              type="text"
              value={education.graduation_year}
              onChange={(e) => {
                const updated = {
                  ...education,
                  graduation_year: e.target.value,
                };
                setEducation(updated);
                notifyChange({ education: updated });
              }}
              placeholder="YYYY"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-border" />

      {/* 5. Job Preferences */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-text-primary">
          Job Preferences
        </h3>

        {/* Job Titles Seeking */}
        <div>
          <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
            JOB TITLES SEEKING
          </label>
          <input
            type="text"
            value={jobTitlesSeeking}
            onChange={(e) => {
              setJobTitlesSeeking(e.target.value);
              notifyChange({
                job_titles_seeking: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
            }}
            placeholder="Frontend Engineer, React Developer"
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Remote Preference */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              REMOTE PREFERENCE
            </label>
            <div className="relative">
              <select
                value={remotePreference}
                onChange={(e) => {
                  setRemotePreference(e.target.value);
                  notifyChange({ remote_preference: e.target.value });
                }}
                className="w-full appearance-none rounded-lg border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition cursor-pointer"
              >
                <option value="Any">Any</option>
                <option value="Remote Only">Remote Only</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            </div>
          </div>

          {/* Salary Expectation */}
          <div>
            <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
              SALARY EXPECTATION (OPTIONAL)
            </label>
            <input
              type="text"
              value={salaryExpectation}
              onChange={(e) => {
                setSalaryExpectation(e.target.value);
                notifyChange({ salary_expectation: e.target.value });
              }}
              placeholder="E.g. $120k+"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
            />
          </div>
        </div>

        {/* Preferred Locations */}
        <div>
          <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
            PREFERRED LOCATIONS (OPTIONAL)
          </label>
          <input
            type="text"
            value={preferredLocations}
            onChange={(e) => {
              setPreferredLocations(e.target.value);
              notifyChange({
                preferred_locations: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
            }}
            placeholder="E.g. New York, London"
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
          />
        </div>

        {/* Cover Letter Tone */}
        <div>
          <label className="block text-xs font-semibold uppercase text-text-dark tracking-wider mb-1.5">
            COVER LETTER TONE
          </label>
          <div className="relative">
            <select
              value={coverLetterTone}
              onChange={(e) => {
                setCoverLetterTone(e.target.value);
                notifyChange({ cover_letter_tone: e.target.value });
              }}
              className="w-full appearance-none rounded-lg border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition cursor-pointer"
            >
              <option value="Formal">Formal (Professional, structured, respectful)</option>
              <option value="Conversational">Conversational (Warm, approachable, natural)</option>
              <option value="Persuasive">Persuasive (High-conviction, results-driven)</option>
              <option value="Direct">Direct (Concise, punchy, to-the-point)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          </div>
        </div>
      </div>

      {/* Status alerts */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 rounded-lg border border-success-light bg-success-lightest p-4 text-sm font-medium text-success-foreground">
          <Check className="h-4 w-4" />
          Profile saved successfully!
        </div>
      )}

      {saveStatus === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-error-border bg-error-light p-4 text-sm font-medium text-error">
          <X className="h-4 w-4" />
          {errorMessage || "Failed to save profile. Please check your inputs."}
        </div>
      )}

      {/* Save Button */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-accent hover:bg-accent-dark text-accent-foreground font-semibold py-3.5 px-6 rounded-xl transition-all shadow text-center cursor-pointer text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Saving Profile...
          </>
        ) : (
          "Save Profile"
        )}
      </button>
    </form>
  );
});

