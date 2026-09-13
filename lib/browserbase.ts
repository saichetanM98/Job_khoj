import Browserbase from "@browserbasehq/sdk";

/**
 * Creates and returns a Browserbase session.
 * Uses BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID from environment.
 * 
 * @param timeoutSeconds Session timeout in seconds (default: 120s per library-docs.md)
 */
export const getBrowserbaseSession = async (timeoutSeconds = 120) => {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    throw new Error("Browserbase configuration is missing (BROWSERBASE_API_KEY or BROWSERBASE_PROJECT_ID)");
  }

  const bb = new Browserbase({ apiKey });
  const session = await bb.sessions.create({
    projectId,
    api_timeout: timeoutSeconds,
  });

  return session;
};
