'use server';

import { createInsforgeServer } from '@/lib/insforge-server';
import { revalidatePath } from 'next/cache';
import { UserProfile, WorkExperienceRole, EducationRecord } from '@/types';

export interface SaveProfileInput {
  full_name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  work_authorization?: string;
  current_title?: string;
  experience_level?: string;
  years_experience?: number;
  skills?: string[];
  industries?: string[];
  work_experience?: WorkExperienceRole[];
  education?: EducationRecord;
  job_titles_seeking?: string[];
  remote_preference?: string;
  salary_expectation?: string;
  preferred_locations?: string[];
  cover_letter_tone?: string;
  resume_pdf_url?: string | null;
}

export async function saveProfile(input: SaveProfileInput) {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !authData?.user) {
      return { success: false, error: 'Unauthorized: User not signed in' };
    }

    const userId = authData.user.id;
    const email = authData.user.email || '';

    // Check existing profile to preserve fields like resume_pdf_url if not explicitly provided
    const { data: existingProfile } = await insforge.database
      .from('profiles')
      .select('resume_pdf_url')
      .eq('id', userId)
      .maybeSingle();

    // Calculate completeness
    const isComplete = Boolean(
      input.full_name &&
      input.phone &&
      input.location &&
      input.current_title &&
      input.experience_level &&
      input.education?.highest_degree &&
      (input.skills && input.skills.length > 0)
    );

    const resumePdfUrl =
      input.resume_pdf_url !== undefined
        ? input.resume_pdf_url
        : (existingProfile?.resume_pdf_url ?? null);

    const profileData: Partial<UserProfile> = {
      id: userId,
      email,
      full_name: input.full_name ?? null,
      phone: input.phone ?? null,
      location: input.location ?? null,
      linkedin_url: input.linkedin_url ?? null,
      portfolio_url: input.portfolio_url ?? null,
      work_authorization: input.work_authorization ?? null,
      current_title: input.current_title ?? null,
      experience_level: input.experience_level ?? null,
      years_experience: typeof input.years_experience === 'number' ? input.years_experience : null,
      skills: input.skills ?? [],
      industries: input.industries ?? [],
      work_experience: input.work_experience ?? [],
      education: input.education ?? null,
      job_titles_seeking: input.job_titles_seeking ?? [],
      remote_preference: input.remote_preference ?? 'any',
      salary_expectation: input.salary_expectation ?? null,
      preferred_locations: input.preferred_locations ?? [],
      cover_letter_tone: input.cover_letter_tone ?? 'formal',
      resume_pdf_url: resumePdfUrl,
      is_complete: isComplete,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedRows, error: upsertError } = await insforge.database
      .from('profiles')
      .upsert([profileData], { onConflict: 'id' })
      .select();

    if (upsertError) {
      console.error('Error saving profile to InsForge:', upsertError);
      return { success: false, error: upsertError.message };
    }

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    const saved = updatedRows && updatedRows[0] ? (updatedRows[0] as UserProfile) : (profileData as UserProfile);
    return { success: true, isComplete, profile: saved };
  } catch (error) {
    console.error('Unexpected error in saveProfile:', error);
    return { success: false, error: 'Failed to save profile. Please try again.' };
  }
}

export async function uploadResume(formData: FormData) {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !authData?.user) {
      return { success: false, error: 'Unauthorized: User not signed in' };
    }

    const userId = authData.user.id;
    const file = formData.get('file') as File | null;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return { success: false, error: 'Only PDF files are allowed' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 5MB limit' };
    }

    // Delete existing resume file(s) from InsForge Storage before uploading new one
    const candidateOldPaths = [`resumes/${userId}/resume.pdf`, `${userId}/resume.pdf`];
    try {
      await insforge.storage.from('resumes').remove(candidateOldPaths);
    } catch (removeErr) {
      console.warn('[uploadResume] Notice: Old resume deletion skipped or file not found:', removeErr);
    }

    // Upload to InsForge Storage bucket "resumes" at resumes/{userId}/resume.pdf
    const storagePath = `resumes/${userId}/resume.pdf`;
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from('resumes')
      .upload(storagePath, file);

    if (uploadError || !uploadData) {
      console.error('Error uploading resume to InsForge Storage:', uploadError);
      return { success: false, error: uploadError?.message || 'Failed to upload resume file' };
    }

    const resumeUrl = uploadData.url;

    // Update profiles table with resume_pdf_url
    const { error: dbError } = await insforge.database
      .from('profiles')
      .upsert(
        [
          {
            id: userId,
            email: authData.user.email || '',
            resume_pdf_url: resumeUrl,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'id' }
      );

    if (dbError) {
      console.error('Error updating resume URL in database:', dbError);
    }

    revalidatePath('/profile');
    return { success: true, url: resumeUrl, key: uploadData.key };
  } catch (error) {
    console.error('Unexpected error in uploadResume:', error);
    return { success: false, error: 'Failed to upload resume. Please try again.' };
  }
}

export async function extractResumeProfile(formData?: FormData) {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !authData?.user) {
      return { success: false, error: 'Unauthorized: User not signed in' };
    }

    const userId = authData.user.id;
    let pdfBuffer: Buffer | null = null;

    if (formData) {
      const file = formData.get('file') as File | null;
      if (file && file.size > 0) {
        if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
          return { success: false, error: 'Only PDF files are supported for resume extraction.' };
        }
        const arrayBuffer = await file.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuffer);
      }
    }

    // If no direct file passed in formData, retrieve from InsForge Storage
    if (!pdfBuffer) {
      const pathsToTry = [`resumes/${userId}/resume.pdf`, `${userId}/resume.pdf`];
      for (const p of pathsToTry) {
        try {
          const { data: blob, error: downloadErr } = await insforge.storage
            .from('resumes')
            .download(p);
          if (!downloadErr && blob) {
            const arrayBuffer = await blob.arrayBuffer();
            pdfBuffer = Buffer.from(arrayBuffer);
            break;
          }
        } catch (e) {
          // try next path
        }
      }

      if (!pdfBuffer) {
        const { data: profile } = await insforge.database
          .from('profiles')
          .select('resume_pdf_url')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.resume_pdf_url) {
          try {
            const res = await fetch(profile.resume_pdf_url);
            if (res.ok) {
              const arrayBuffer = await res.arrayBuffer();
              pdfBuffer = Buffer.from(arrayBuffer);
            }
          } catch (fetchErr) {
            console.error('[extractResumeProfile] Failed to fetch stored resume:', fetchErr);
          }
        }
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return {
        success: false,
        error: 'No resume PDF found. Please upload a resume first.',
      };
    }

    // 1. Extract raw text from PDF buffer
    const { parsePdfText } = await import('@/lib/pdf-parser');
    const parseResult = await parsePdfText(pdfBuffer);
    if (!parseResult.success || !parseResult.text) {
      return {
        success: false,
        error: parseResult.error || 'Could not extract text from this PDF. Please try a different file.',
      };
    }

    // 2. Structured AI extraction via GPT-4o
    const { extractProfileFromResumeText } = await import('@/agent/extractor');
    const extractResult = await extractProfileFromResumeText(parseResult.text);
    if (!extractResult.success || !extractResult.data) {
      return {
        success: false,
        error: extractResult.error || 'Failed to extract profile information with AI.',
      };
    }

    return {
      success: true,
      data: extractResult.data,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[extractResumeProfile] Unexpected error:', error);
    return {
      success: false,
      error: message || 'Failed to extract profile from resume. Please try again.',
    };
  }
}

export const extractProfile = extractResumeProfile;



