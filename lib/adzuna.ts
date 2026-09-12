export interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string; // snippet only — not full description
  redirect_url: string; // Adzuna tracking URL → redirects to actual job
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: "0" | "1";
  contract_type?: string;
  created?: string;
  category?: { tag: string; label: string };
}

export interface AdzunaSearchResult {
  results: AdzunaJob[];
  isFallback: boolean;
  fallbackReason?: string;
  warningLevel?: "info" | "warning" | "error";
}

// 10 realistic tech job listings matching the AdzunaJob shape
const MOCK_ADZUNA_JOBS: AdzunaJob[] = [
  {
    id: "adz-mock-001",
    title: "Senior Full Stack Engineer (Next.js / TypeScript)",
    company: { display_name: "Vercel Partner Labs" },
    location: { display_name: "San Francisco, CA" },
    description: "Seeking a Senior Full Stack Engineer experienced with Next.js App Router, React 19, TypeScript, Tailwind CSS, PostgreSQL, and serverless architectures. You will lead performance optimization and developer experience tooling.",
    redirect_url: "https://www.adzuna.com/land/ad/mock-001?se=mock&utm_medium=api",
    salary_min: 155000,
    salary_max: 195000,
    salary_is_predicted: "1",
    contract_type: "fulltime",
    created: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    category: { tag: "it-jobs", label: "IT Jobs" },
  },
  {
    id: "adz-mock-002",
    title: "Frontend React Developer",
    company: { display_name: "Stripe Integrations Hub" },
    location: { display_name: "New York, NY" },
    description: "Build clean, accessible, and high-conversion payment workflows using React, TypeScript, Tailwind CSS, state management, and modern Web APIs. Experience with client testing and responsive UI design required.",
    redirect_url: "https://www.adzuna.com/land/ad/mock-002?se=mock&utm_medium=api",
    salary_min: 130000,
    salary_max: 165000,
    salary_is_predicted: "0",
    contract_type: "fulltime",
    created: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    category: { tag: "it-jobs", label: "IT Jobs" },
  },
  {
    id: "adz-mock-003",
    title: "AI Solutions & Backend Engineer",
    company: { display_name: "Cognitive Scale AI" },
    location: { display_name: "Remote, US" },
    description: "Integrate large language models (OpenAI, Anthropic, open-source models) with Node.js/Python microservices, vector search databases (pgvector/Pinecone), and Redis caching. Looking for solid API design and prompt engineering experience.",
    redirect_url: "https://www.adzuna.com/land/ad/mock-003?se=mock&utm_medium=api",
    salary_min: 160000,
    salary_max: 210000,
    salary_is_predicted: "1",
    contract_type: "fulltime",
    created: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    category: { tag: "it-jobs", label: "IT Jobs" },
  },
  {
    id: "adz-mock-004",
    title: "Lead Cloud Platform Engineer",
    company: { display_name: "CloudScale Infra" },
    location: { display_name: "Austin, TX" },
    description: "Architect automated CI/CD pipelines, Kubernetes clusters, Docker containerization, and AWS/GCP infrastructure as code with Terraform. Must have strong Linux fundamentals and observability experience (Prometheus, Datadog).",
    redirect_url: "https://www.adzuna.com/land/ad/mock-004?se=mock&utm_medium=api",
    salary_min: 170000,
    salary_max: 220000,
    salary_is_predicted: "0",
    contract_type: "fulltime",
    created: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    category: { tag: "it-jobs", label: "IT Jobs" },
  },
  {
    id: "adz-mock-005",
    title: "Software Engineer - Core Product",
    company: { display_name: "Linear Ecosystems" },
    location: { display_name: "Remote, US" },
    description: "Join our core product engineering team building real-time collaboration applications. We utilize TypeScript, Node.js, WebSockets, Postgres, and high-performance UI components with smooth micro-animations.",
    redirect_url: "https://www.adzuna.com/land/ad/mock-005?se=mock&utm_medium=api",
    salary_min: 140000,
    salary_max: 180000,
    salary_is_predicted: "1",
    contract_type: "fulltime",
    created: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    category: { tag: "it-jobs", label: "IT Jobs" },
  },
  {
    id: "adz-mock-006",
    title: "Data Platform & Pipeline Engineer",
    company: { display_name: "DataPulse Analytics" },
    location: { display_name: "Seattle, WA" },
    description: "Responsible for large-scale data ingestion, ETL pipelines, Apache Kafka, Snowflake, Python data tooling, and real-time dashboard analytics. Experience with SQL optimization is essential.",
    redirect_url: "https://www.adzuna.com/land/ad/mock-006?se=mock&utm_medium=api",
    salary_min: 145000,
    salary_max: 185000,
    salary_is_predicted: "0",
    contract_type: "fulltime",
    created: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    category: { tag: "it-jobs", label: "IT Jobs" },
  },
  {
    id: "adz-mock-007",
    title: "Mobile App Engineer (React Native)",
    company: { display_name: "Mobility Works" },
    location: { display_name: "Chicago, IL" },
    description: "Craft cross-platform iOS and Android mobile experiences using React Native, TypeScript, native bridges, offline sync, and mobile CI/CD pipelines (Fastlane).",
    redirect_url: "https://www.adzuna.com/land/ad/mock-007?se=mock&utm_medium=api",
    salary_min: 125000,
    salary_max: 160000,
    salary_is_predicted: "1",
    contract_type: "fulltime",
    created: new Date(Date.now() - 1000 * 60 * 60 * 84).toISOString(),
    category: { tag: "it-jobs", label: "IT Jobs" },
  },
  {
    id: "adz-mock-008",
    title: "Application Security Engineer",
    company: { display_name: "Fortress Cyber Systems" },
    location: { display_name: "Boston, MA" },
    description: "Conduct security code reviews, threat modeling, penetration testing, and OAuth/SAML identity federation hardening. Experience with OWASP top 10, vulnerability scanning, and secure API gateways.",
    redirect_url: "https://www.adzuna.com/land/ad/mock-008?se=mock&utm_medium=api",
    salary_min: 150000,
    salary_max: 195000,
    salary_is_predicted: "0",
    contract_type: "fulltime",
    created: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    category: { tag: "it-jobs", label: "IT Jobs" },
  },
  {
    id: "adz-mock-009",
    title: "DevOps & Reliability Engineer",
    company: { display_name: "Apex Global Cloud" },
    location: { display_name: "Denver, CO" },
    description: "Improve site uptime, automate incident response, manage multi-region cloud infrastructure, and scale high-throughput API clusters with Docker, Kubernetes, and Terraform.",
    redirect_url: "https://www.adzuna.com/land/ad/mock-009?se=mock&utm_medium=api",
    salary_min: 135000,
    salary_max: 175000,
    salary_is_predicted: "1",
    contract_type: "fulltime",
    created: new Date(Date.now() - 1000 * 60 * 60 * 108).toISOString(),
    category: { tag: "it-jobs", label: "IT Jobs" },
  },
  {
    id: "adz-mock-010",
    title: "Staff Frontend Architect",
    company: { display_name: "NextGen Software" },
    location: { display_name: "San Francisco, CA" },
    description: "Guide frontend architecture across multiple engineering teams. Deep expertise in web performance, bundle size optimization, micro-frontends, component design systems, and TypeScript.",
    redirect_url: "https://www.adzuna.com/land/ad/mock-010?se=mock&utm_medium=api",
    salary_min: 180000,
    salary_max: 235000,
    salary_is_predicted: "0",
    contract_type: "fulltime",
    created: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    category: { tag: "it-jobs", label: "IT Jobs" },
  },
];

/**
 * Searches jobs via the official Adzuna API with strict parameter rules:
 * - Always filters category=it-jobs
 * - Only passes `where` if location is provided and non-empty
 * - Falls back to realistic mock listings if keys are missing or API fails,
 *   gated by ALLOW_MOCK_FALLBACK (default true).
 */
export async function searchJobs(
  jobTitle: string,
  location?: string,
  country: string = "us",
): Promise<AdzunaSearchResult> {
  // Normalize country support (default 'us', supports 'gb', 'au', 'ca')
  const validCountries = ["us", "gb", "au", "ca"];
  const normalizedCountry = validCountries.includes(country.toLowerCase())
    ? country.toLowerCase()
    : "us";

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  // Gate fallback activation via explicit env var (default true if not 'false')
  const allowMockFallback = process.env.ALLOW_MOCK_FALLBACK !== "false";

  // Check if credentials are missing
  if (!appId || !appKey) {
    if (allowMockFallback) {
      return {
        results: MOCK_ADZUNA_JOBS,
        isFallback: true,
        fallbackReason: "Adzuna credentials (ADZUNA_APP_ID / ADZUNA_APP_KEY) are not set in environment.",
        warningLevel: "info",
      };
    }
    throw new Error("Missing Adzuna credentials and mock fallback is disabled (ALLOW_MOCK_FALLBACK=false).");
  }

  // Construct search parameters adhering strictly to library-docs.md
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: jobTitle,
    category: "it-jobs", // always filter to IT jobs
    results_per_page: "10",
    "content-type": "application/json",
  });

  // Strict location rule: Only add where if location is provided and non-empty
  if (location && location.trim().length > 0) {
    params.set("where", location.trim());
  }

  const endpoint = `https://api.adzuna.com/v1/api/jobs/${normalizedCountry}/search/1?${params.toString()}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const status = response.status;
      let warningLevel: "info" | "warning" | "error" = "warning";
      if (status === 401 || status === 403) {
        warningLevel = "error";
      } else if (status === 429) {
        warningLevel = "warning";
      }

      if (allowMockFallback) {
        return {
          results: MOCK_ADZUNA_JOBS,
          isFallback: true,
          fallbackReason: `Adzuna API returned HTTP ${status}. Using mock fallback.`,
          warningLevel,
        };
      }
      throw new Error(`Adzuna API error: ${status}`);
    }

    const data = await response.json();
    const results: AdzunaJob[] = Array.isArray(data.results) ? data.results : [];

    // If Adzuna returned 0 results for this specific query, we still return the real empty array
    return {
      results,
      isFallback: false,
    };
  } catch (error: any) {
    if (allowMockFallback) {
      return {
        results: MOCK_ADZUNA_JOBS,
        isFallback: true,
        fallbackReason: `Adzuna API request failed: ${error.message || error}. Using mock fallback.`,
        warningLevel: "warning",
      };
    }
    throw error;
  }
}
