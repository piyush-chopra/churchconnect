import sampleJobs from "./preview-jobs.json" with { type: "json" };
import type { Job } from "./api";

// Public fixtures only. Never emulate accounts or accept personal data in Pages mode.
export function previewResponse(path: string, method = "GET") {
  if (method.toUpperCase() !== "GET") {
    throw new Error(
      "Accounts, uploads, and applications are unavailable in this preview.",
    );
  }
  const [route, query = ""] = path.split("?");
  if (route === "session/") return { user: null };
  if (route !== "jobs/")
    throw new Error("This feature requires the full service.");
  const params = new URLSearchParams(query);
  const q = (params.get("q") || "").trim().toLowerCase();
  const location = (params.get("location") || "").trim().toLowerCase();
  const jobs = (sampleJobs as Job[])
    .filter(
      (job) =>
        (!q ||
          [job.title, job.church, job.description, ...job.skills]
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
        (!location || job.location.toLowerCase().includes(location)) &&
        (!params.get("category") || job.category === params.get("category")) &&
        (!params.get("type") || job.type === params.get("type")) &&
        (!params.get("work_mode") || job.work_mode === params.get("work_mode")),
    )
    .sort((a, b) =>
      params.get("sort") === "salary"
        ? b.salary_max - a.salary_max
        : b.created_at.localeCompare(a.created_at),
    );
  return { jobs, saved: [], applied: [], resume: null };
}
