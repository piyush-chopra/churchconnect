export type User = {
  id: number;
  name: string;
  email: string;
  role: "candidate" | "employer";
  organization: string;
};
export type Resume = {
  id: number;
  name: string;
  skills: string[];
  created_at: string;
};
export type Job = {
  id: number;
  title: string;
  church: string;
  location: string;
  category: string;
  type: string;
  work_mode: string;
  salary_min: number;
  salary_max: number;
  description: string;
  requirements: string;
  skills: string[];
  color: string;
  is_demo: boolean;
  is_active: boolean;
  created_at: string;
  matched_skills: string[];
  match_score: number | null;
};
export type Application = {
  id: number;
  job: Job;
  candidate: { name: string; email: string };
  resume: Resume;
  cover_note: string;
  status: string;
  created_at: string;
};
let token = "";
export const isStaticPreview = import.meta.env.VITE_STATIC_PREVIEW === "true";
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (isStaticPreview) {
    const { previewResponse } = await import("./preview");
    return previewResponse(path, options.method) as T;
  }
  const form = options.body instanceof FormData;
  const response = await fetch(`/api/${path}`, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(!form && options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "X-CSRFToken": token } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({
    error:
      response.status === 403
        ? "Your session expired. Refresh the page and try again."
        : "The server could not complete the request. Please try again.",
  }));
  if (!response.ok)
    throw new Error(data.error || "Something went wrong. Please try again.");
  if (data.csrfToken) token = data.csrfToken;
  return data as T;
}
export const categories = [
  "Pastoral",
  "Worship & Music",
  "Youth & Children",
  "Operations",
  "Outreach",
  "Media & Creative",
];
export const skillOptions = [
  "Leadership",
  "Teaching",
  "Youth ministry",
  "Worship",
  "Pastoral care",
  "Community outreach",
  "Administration",
  "Communication",
  "Event planning",
  "Volunteer management",
  "Media production",
  "Finance",
  "Children’s ministry",
  "Theology",
  "Technology",
];
export const salary = (j: Job) =>
  j.salary_max
    ? `$${(j.salary_min / 1000).toFixed(0)}k – $${(j.salary_max / 1000).toFixed(0)}k`
    : "Salary not listed";
