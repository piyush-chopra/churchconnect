import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  ChevronDown,
  Church,
  Compass,
  FileText,
  Heart,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Upload,
  Users,
  X,
} from "lucide-react";
import { api, categories, skillOptions, salary, isStaticPreview } from "./api";
import type { User, Resume, Job, Application } from "./api";
import communityPhoto from "./assets/community.webp";
type Page =
  "discover" | "saved" | "applications" | "profile" | "employer" | "about";
type Modal =
  | { kind: "auth"; register?: boolean; role?: "candidate" | "employer" }
  | { kind: "upload" }
  | { kind: "job"; job: Job }
  | { kind: "post" }
  | { kind: "install" }
  | null;
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
const pageTitles: Record<Page, string> = {
  discover: "Find your next chapter",
  saved: "Your saved opportunities",
  applications: "Your journey, at a glance",
  profile: "A little more about you",
  employer: "Build your ministry team",
  about: "Meaningful work. Human connections.",
};
function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <span className="brand-mark">
        <Church size={23} strokeWidth={1.5} />
      </span>
      {!compact && (
        <span>
          church<span className="brand-light">connect</span>
          <span className="brand-dot">.</span>
        </span>
      )}
    </span>
  );
}
function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const d = ref.current;
    d?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      d?.close();
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      className={wide ? "dialog wide" : "dialog"}
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-header">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <Compass size={36} strokeWidth={1.3} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
function AuthForm({
  register = false,
  onModeChange,
  initialRole = "candidate",
  onSuccess,
}: {
  register?: boolean;
  onModeChange: (register: boolean) => void;
  initialRole?: "candidate" | "employer";
  onSuccess: (u: User) => void;
}) {
  const [role, setRole] = useState(initialRole),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const result = await api<{ user: User }>(
        `auth/${register ? "register" : "login"}/`,
        { method: "POST", body: JSON.stringify({ ...data, role }) },
      );
      onSuccess(result.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="form">
      <p className="muted">
        {register
          ? "Your next chapter starts with a connection."
          : "Welcome back. Let’s pick up where you left off."}
      </p>
      {register && (
        <>
          <div className="segmented">
            <button
              type="button"
              className={role === "candidate" ? "selected" : ""}
              onClick={() => setRole("candidate")}
            >
              I’m finding a job
            </button>
            <button
              type="button"
              className={role === "employer" ? "selected" : ""}
              onClick={() => setRole("employer")}
            >
              I’m hiring
            </button>
          </div>
          <Field label="Full name">
            <input name="name" autoComplete="name" maxLength={150} required />
          </Field>
          {role === "employer" && (
            <Field label="Church or organization">
              <input name="organization" maxLength={120} required />
            </Field>
          )}
        </>
      )}
      <Field label="Email address">
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={150}
        />
      </Field>
      <Field label="Password">
        <input
          name="password"
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
          minLength={register ? 8 : 1}
          required
        />
      </Field>
      {register && (
        <small>
          Use at least 8 characters. Avoid common or entirely numeric passwords.
        </small>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="button primary full" disabled={busy}>
        {busy ? "Please wait…" : register ? "Create your account" : "Sign in"}
        <ArrowRight size={17} />
      </button>
      <p className="form-switch">
        {register ? "Already have an account?" : "New to ChurchConnect?"}{" "}
        <button
          type="button"
          className="text-button"
          onClick={() => {
            onModeChange(!register);
            setError("");
          }}
        >
          {register ? "Sign in" : "Create an account"}
        </button>
      </p>
    </form>
  );
}
function UploadForm({ onSuccess }: { onSuccess: (r: Resume) => void }) {
  const [file, setFile] = useState<File | null>(null),
    [drag, setDrag] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  function choose(f?: File) {
    setError("");
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("Choose a file smaller than 5 MB.");
      return;
    }
    if (!/\.(pdf|docx|txt)$/i.test(f.name)) {
      setError("Choose a PDF, DOCX, or TXT file.");
      return;
    }
    setFile(f);
  }
  async function upload() {
    if (!file) return;
    setBusy(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    try {
      const data = await api<{ resume: Resume }>("resumes/", {
        method: "POST",
        body,
      });
      onSuccess(data.resume);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="form">
      <p className="muted">
        Bring your experience. We’ll help you see where it fits.
      </p>
      <button
        type="button"
        className={`dropzone ${drag ? "drag" : ""}`}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          choose(e.dataTransfer.files[0]);
        }}
      >
        <span className="upload-symbol">
          <Upload size={27} />
        </span>
        <strong>{file ? file.name : "Drop your résumé here"}</strong>
        <span>
          {file
            ? "Click to choose a different file"
            : "or click to browse your files"}
        </span>
        <small>PDF, DOCX or TXT · Up to 5 MB</small>
      </button>
      <input
        ref={input}
        type="file"
        className="visually-hidden"
        tabIndex={-1}
        accept=".pdf,.docx,.txt"
        aria-label="Résumé file"
        onChange={(e) => choose(e.target.files?.[0])}
      />
      <p className="privacy-line">
        <ShieldCheck size={17} />
        Private to you. Shared only with employers you apply to.
      </p>
      <p className="fine-print">
        We extract text and look for ministry-related skills. Matches show
        keyword overlap, not a hiring recommendation. Scanned PDFs are not
        supported.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button
        className="button primary full"
        disabled={!file || busy}
        onClick={upload}
      >
        {busy ? "Reading your résumé…" : "Upload & find my matches"}
        <ArrowRight size={17} />
      </button>
    </div>
  );
}
function PostForm({ onSuccess }: { onSuccess: () => void }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const data = { ...Object.fromEntries(form), skills: form.getAll("skills") };
    try {
      await api("jobs/", { method: "POST", body: JSON.stringify(data) });
      onSuccess();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="form" onSubmit={submit}>
      <p className="muted">
        Tell candidates about the work and the people behind it.
      </p>
      <Field label="Job title">
        <input
          name="title"
          required
          maxLength={120}
          placeholder="e.g. Youth Ministry Director"
        />
      </Field>
      <div className="form-grid">
        <Field label="Location">
          <input
            name="location"
            required
            maxLength={120}
            placeholder="Austin, TX"
          />
        </Field>
        <Field label="Ministry area">
          <select name="category">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Job type">
          <select name="type">
            {["Full-time", "Part-time", "Contract", "Volunteer"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Work arrangement">
          <select name="work_mode">
            {["On-site", "Hybrid", "Remote"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Annual salary minimum (USD)">
          <input
            name="salary_min"
            type="number"
            min="0"
            max="1000000"
            placeholder="50000"
          />
        </Field>
        <Field label="Annual salary maximum (USD)">
          <input
            name="salary_max"
            type="number"
            min="0"
            max="1000000"
            placeholder="65000"
          />
        </Field>
      </div>
      <Field label="About the role">
        <textarea name="description" required rows={5} maxLength={12000} />
      </Field>
      <Field label="Experience & requirements">
        <textarea name="requirements" required rows={4} maxLength={8000} />
      </Field>
      <fieldset className="skills-field">
        <legend>Relevant skills</legend>
        <div className="skill-picker">
          {skillOptions.map((s) => (
            <label key={s}>
              <input type="checkbox" name="skills" value={s} />
              {s}
            </label>
          ))}
        </div>
      </fieldset>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="button primary full" disabled={busy}>
        {busy ? "Publishing…" : "Publish position"}
        <ArrowUpRight size={17} />
      </button>
    </form>
  );
}
function JobCard({
  job,
  saved,
  onSave,
  onOpen,
  applied,
}: {
  job: Job;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  applied: boolean;
}) {
  const Icon =
    job.category === "Worship & Music"
      ? Leaf
      : job.category === "Outreach"
        ? Heart
        : job.category === "Youth & Children"
          ? Users
          : Church;
  return (
    <article className="job-card">
      <div className="job-card-top">
        <span className={`company-logo ${job.color}`}>
          <Icon size={27} strokeWidth={1.45} />
        </span>
        <div className="job-heading">
          <span className="company-name">{job.church}</span>
          <button className="job-title" onClick={onOpen}>
            {job.title}
          </button>
        </div>
        <button
          className={`icon-button bookmark ${saved ? "is-saved" : ""}`}
          onClick={onSave}
          aria-label={`${saved ? "Unsave" : "Save"} ${job.title}`}
          aria-pressed={saved}
        >
          <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="job-meta">
        <span>
          <MapPin size={14} />
          {job.location}
        </span>
        <span>
          <BriefcaseBusiness size={14} />
          {job.type}
        </span>
        <span className="work-mode">{job.work_mode}</span>
      </div>
      <div className="job-bottom">
        <div className="tags">
          <span className="tag">{job.category}</span>
          {job.match_score !== null && (
            <span className="match-tag">
              <Sparkles size={12} />
              {job.match_score}% skill overlap
            </span>
          )}
          {applied && (
            <span className="match-tag">
              <Check size={12} />
              Applied
            </span>
          )}
        </div>
        <span className="salary">
          {salary(job)}
          {job.salary_max > 0 && <small>/ year</small>}
        </span>
      </div>
    </article>
  );
}
function JobDetails({
  job,
  user,
  resume,
  applied,
  onAuth,
  onUpload,
  onApply,
}: {
  job: Job;
  user: User | null;
  resume: Resume | null;
  applied: boolean;
  onAuth: () => void;
  onUpload: () => void;
  onApply: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [note, setNote] = useState("");
  async function apply() {
    if (!user) {
      onAuth();
      return;
    }
    if (!resume) {
      onUpload();
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("applications/", {
        method: "POST",
        body: JSON.stringify({ job_id: job.id, cover_note: note }),
      });
      onApply();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="job-detail">
      <div className="detail-company">
        <span className={`company-logo ${job.color}`}>
          <Church size={27} />
        </span>
        <div>
          <strong>{job.church}</strong>
          <p>
            <MapPin size={15} />
            {job.location}
          </p>
        </div>
      </div>
      <div className="detail-facts">
        <span>{job.type}</span>
        <span>{job.work_mode}</span>
        <span>
          {salary(job)} {job.salary_max ? "per year" : ""}
        </span>
      </div>
      {job.is_demo && (
        <p className="notice">
          Sample listing. You can try the application flow; no real employer
          receives it.
        </p>
      )}
      <h3>About the opportunity</h3>
      <p className="preserve-lines">{job.description}</p>
      <h3>What you’ll bring</h3>
      <ul className="requirements">
        {job.requirements
          .split("\n")
          .filter(Boolean)
          .map((r, i) => (
            <li key={i}>{r}</li>
          ))}
      </ul>
      <h3>Skills for this role</h3>
      <div className="tags">
        {job.skills.map((s) => (
          <span
            key={s}
            className={resume?.skills.includes(s) ? "tag match-tag" : "tag"}
          >
            {resume?.skills.includes(s) && <Check size={13} />} {s}
          </span>
        ))}
      </div>
      {resume && (
        <p className="fine-print">
          Matched by keywords in your résumé. Skills and suitability are
          reviewed by the employer.
        </p>
      )}
      {user?.role !== "employer" && !applied && (
        <Field label="A short introduction (optional)">
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={5000}
            placeholder="What draws you to this community?"
          />
        </Field>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="detail-action">
        {user?.role === "employer" ? (
          <p className="muted">You’re viewing this listing as an employer.</p>
        ) : (
          <>
            <p>
              <ShieldCheck size={16} />
              {applied
                ? "Your application has been submitted."
                : resume
                  ? `Applying with ${resume.name}`
                  : "Your résumé is shared only when you apply."}
            </p>
            <button
              className="button primary"
              disabled={applied || busy || !job.is_active}
              onClick={apply}
            >
              {applied
                ? "Application submitted"
                : busy
                  ? "Submitting…"
                  : !user
                    ? "Sign in to apply"
                    : !resume
                      ? "Upload résumé to apply"
                      : "Submit application"}
              {applied ? <CheckCheck size={18} /> : <ArrowRight size={18} />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("churchconnect-theme", next);
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
  }
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [page, setPage] = useState<Page>(() =>
      location.hash.slice(1) in pageTitles
        ? (location.hash.slice(1) as Page)
        : "discover",
    ),
    [jobs, setJobs] = useState<Job[]>([]),
    [saved, setSaved] = useState<number[]>([]),
    [applied, setApplied] = useState<number[]>([]),
    [resume, setResume] = useState<Resume | null>(null),
    [applications, setApplications] = useState<Application[]>([]),
    [modal, setModal] = useState<Modal>(null),
    [query, setQuery] = useState(""),
    [locationQuery, setLocationQuery] = useState(""),
    [search, setSearch] = useState({ q: "", location: "" }),
    [category, setCategory] = useState(""),
    [type, setType] = useState(""),
    [remote, setRemote] = useState(false),
    [sort, setSort] = useState("newest"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [revision, setRevision] = useState(0),
    [showFilters, setShowFilters] = useState(false),
    [mobileNav, setMobileNav] = useState(false),
    [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null),
    [online, setOnline] = useState(navigator.onLine),
    [actionBusy, setActionBusy] = useState(false);
  useEffect(() => {
    api<{ user: User }>("session/")
      .then((d) => setUser(d.user))
      .catch((e) => setError(e.message))
      .finally(() => setReady(true));
    const hash = () => {
      const next = location.hash.slice(1);
      setPage(next in pageTitles ? (next as Page) : "discover");
    };
    const install = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPrompt);
    };
    const network = () => setOnline(navigator.onLine);
    window.addEventListener("hashchange", hash);
    window.addEventListener("beforeinstallprompt", install);
    window.addEventListener("online", network);
    window.addEventListener("offline", network);
    return () => {
      window.removeEventListener("hashchange", hash);
      window.removeEventListener("beforeinstallprompt", install);
      window.removeEventListener("online", network);
      window.removeEventListener("offline", network);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    setLoading(true);
    setError("");
    const params = new URLSearchParams(
      page === "discover"
        ? { ...search, category, type, work_mode: remote ? "Remote" : "", sort }
        : page === "employer" && user?.role === "employer"
          ? { mine: "1" }
          : page === "saved"
            ? { sort }
            : {},
    );
    api<{
      jobs: Job[];
      saved: number[];
      applied: number[];
      resume: Resume | null;
    }>(`jobs/?${params}`)
      .then((d) => {
        if (active) {
          setJobs(d.jobs);
          setSaved(d.saved);
          setApplied(d.applied);
          setResume(d.resume);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ready, search, category, type, remote, sort, revision, user, page]);
  useEffect(() => {
    if (!user || page !== "applications") return;
    let active = true;
    setLoading(true);
    api<{ applications: Application[] }>("applications/")
      .then((d) => {
        if (active) setApplications(d.applications);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, user, revision]);
  function go(next: Page) {
    location.hash = next;
    setPage(next);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function upload() {
    if (!user) {
      setModal({ kind: "auth", register: true });
      return;
    }
    if (user.role === "employer") {
      setToast("Use a candidate account to upload a résumé.");
      return;
    }
    setModal({ kind: "upload" });
  }
  async function save(job: Job) {
    if (!user) {
      setModal({ kind: "auth", register: true });
      return;
    }
    if (user.role === "employer") {
      setToast("Saved jobs are available with a candidate account.");
      return;
    }
    const next = !saved.includes(job.id);
    try {
      await api(`jobs/${job.id}/save/`, {
        method: "POST",
        body: JSON.stringify({ saved: next }),
      });
      setSaved((prev) =>
        next
          ? [...new Set([...prev, job.id])]
          : prev.filter((id) => id !== job.id),
      );
      setToast(
        next
          ? "Saved to your opportunities."
          : "Opportunity removed from saved jobs.",
      );
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  async function logoutUser() {
    try {
      await api("auth/logout/", { method: "POST" });
      setUser(null);
      setApplications([]);
      setSaved([]);
      setResume(null);
      go("discover");
      setToast("You’ve been signed out.");
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  async function install() {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } else setModal({ kind: "install" });
  }
  function reset() {
    setQuery("");
    setLocationQuery("");
    setSearch({ q: "", location: "" });
    setCategory("");
    setType("");
    setRemote(false);
  }
  const visibleJobs =
    page === "saved" ? jobs.filter((j) => saved.includes(j.id)) : jobs;
  const nav = [
    { id: "discover" as Page, label: "Discover jobs", icon: Compass },
    { id: "saved" as Page, label: "Saved opportunities", icon: Bookmark },
    {
      id: "applications" as Page,
      label: user?.role === "employer" ? "Applicants" : "My applications",
      icon: BriefcaseBusiness,
    },
    {
      id: "profile" as Page,
      label:
        user?.role === "employer" ? "My organization" : "My résumé & profile",
      icon: FileText,
    },
  ];
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside
        className={`sidebar ${mobileNav ? "open" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "Escape") setMobileNav(false);
        }}
      >
        <a
          href="#discover"
          className="brand-link"
          onClick={() => go("discover")}
          aria-label="ChurchConnect home"
        >
          <Logo />
        </a>
        <div className="sidebar-content">
          <p className="nav-caption">YOUR NEXT CHAPTER</p>
          <nav aria-label="Main navigation">
            {nav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item ${page === id ? "active" : ""}`}
                aria-current={page === id ? "page" : undefined}
                onClick={() => go(id)}
              >
                <Icon size={19} />
                <span>{label}</span>
                {id === "saved" && saved.length > 0 && (
                  <span className="nav-count">{saved.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="nav-divider" />
          <button
            className={`nav-item ${page === "employer" ? "active" : ""}`}
            onClick={() => go("employer")}
          >
            <Church size={19} />
            <span>For churches</span>
            <ArrowUpRight size={14} />
          </button>
          <button
            className={`nav-item ${page === "about" ? "active" : ""}`}
            onClick={() => go("about")}
          >
            <Heart size={19} />
            <span>Our purpose</span>
          </button>
          <div className="sidebar-bottom">
            <div className="small-invitation">
              <span className="invitation-icon">
                <Leaf size={25} strokeWidth={1.5} />
              </span>
              <h3>
                Good work.
                <br />
                Greater purpose.
              </h3>
              <p>
                A place for your gifts.
                <br />A community to grow with.
              </p>
              <button onClick={() => go("about")}>
                Get to know us <ArrowUpRight size={16} />
              </button>
            </div>
            <button className="install-button" onClick={install}>
              <ArrowDownToLine size={17} /> Get the mobile app
            </button>
          </div>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="nav-scrim"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Open navigation"
              aria-expanded={mobileNav}
            >
              <Menu size={22} />
            </button>
            <span>
              {page === "discover"
                ? "Opportunities"
                : page === "employer"
                  ? "For churches"
                  : page === "about"
                    ? "Our purpose"
                    : "Your workspace"}
            </span>
            <span className="header-divider" />
            <span className="topbar-subtitle">Work with purpose.</span>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <span className="sample-pill">
              <span />
              {isStaticPreview ? "Preview site" : "Demo workspace"}
            </span>
            {user ? (
              <>
                <button
                  className="avatar-button"
                  onClick={() => go("profile")}
                  aria-label="View your profile"
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </button>
                <button
                  className="icon-button logout"
                  onClick={logoutUser}
                  aria-label="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button
                className="button sign-in"
                onClick={() => setModal({ kind: "auth" })}
              >
                Sign in <ArrowUpRight size={15} />
              </button>
            )}
          </div>
        </header>
        <main id="main">
          <div className="content">
            {isStaticPreview && (
              <p className="notice preview-notice" role="note">
                Preview site. Explore fictional sample jobs. Accounts, résumé
                uploads, and applications aren’t available here yet.
              </p>
            )}
            <div className="page-heading">
              <div>
                <h1>
                  {pageTitles[page] || pageTitles.discover}
                  <span className="period">.</span>
                </h1>
                <p>
                  {page === "discover"
                    ? "Your gifts have a place. Let’s help you find it."
                    : page === "saved"
                      ? "Keep the roles that feel right, all in one place."
                      : page === "applications"
                        ? "Every application is a step toward something meaningful."
                        : page === "profile"
                          ? "Keep your experience ready for the right opportunity."
                          : page === "employer"
                            ? "Connect your community with people who care."
                            : "Helping people find a place where their gifts can grow."}
                </p>
              </div>
              {page === "discover" && (
                <span className="heading-note">
                  <Sparkles size={17} aria-hidden="true" /> A calling, not just
                  a career.
                </span>
              )}
            </div>
            {!online && (
              <p className="notice" role="status">
                You’re offline. The app shell is available; reconnect to load
                jobs or submit changes.
              </p>
            )}
            {error && (
              <div className="error global-error" role="alert">
                {error}
                <button
                  className="text-button"
                  onClick={() => setRevision((r) => r + 1)}
                >
                  Try again
                </button>
              </div>
            )}
            {(page === "discover" || page === "saved") && (
              <>
                {page === "discover" && (
                  <>
                    <section className="hero">
                      <div className="hero-copy">
                        <h2>
                          Meaningful work.
                          <br />
                          <em>A place to belong.</em>
                        </h2>
                        <p>
                          Connect with churches and communities
                          <br className="desktop-only" /> looking for someone
                          just like you.
                        </p>
                        <button className="button hero-button" onClick={upload}>
                          Find my matches <ArrowUpRight size={18} />
                        </button>
                      </div>
                      <div className="hero-media">
                        <img
                          className="hero-photo"
                          src={communityPhoto}
                          alt=""
                          width={1000}
                          height={667}
                          fetchPriority="high"
                        />
                      </div>
                    </section>
                    <form
                      className="search-bar"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setSearch({ q: query, location: locationQuery });
                      }}
                    >
                      <label className="search-input">
                        <Search size={20} />
                        <span className="visually-hidden">
                          Search roles, skills, or churches
                        </span>
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Job title, skill, or church"
                        />
                      </label>
                      <label className="location-input">
                        <MapPin size={19} />
                        <span className="visually-hidden">
                          City, state, or remote
                        </span>
                        <input
                          value={locationQuery}
                          onChange={(e) => setLocationQuery(e.target.value)}
                          placeholder="City, state, or remote"
                        />
                      </label>
                      <button
                        className="button primary search-submit"
                        type="submit"
                      >
                        Find opportunities <ArrowRight size={17} />
                      </button>
                    </form>
                  </>
                )}
                <div className="board-layout">
                  <section className="job-board" aria-labelledby="jobs-title">
                    <div className="section-title">
                      <div>
                        <h2 id="jobs-title">
                          {page === "saved"
                            ? "Worth coming back to"
                            : "Explore opportunities"}
                        </h2>
                        <span className="result-count" aria-live="polite">
                          {loading
                            ? "Loading…"
                            : `${visibleJobs.length} open ${visibleJobs.length === 1 ? "position" : "positions"}`}
                        </span>
                      </div>
                      <label className="sort-control">
                        <span className="visually-hidden">
                          Sort opportunities
                        </span>
                        <select
                          value={sort}
                          onChange={(e) => setSort(e.target.value)}
                        >
                          <option value="newest">Most recent</option>
                          <option value="salary">Highest salary</option>
                          {resume && (
                            <option value="match">Skill overlap</option>
                          )}
                        </select>
                        <ChevronDown size={14} />
                      </label>
                    </div>
                    {page === "discover" && (
                      <>
                        <div
                          className="category-list"
                          aria-label="Filter by ministry area"
                        >
                          <button
                            className={
                              !category ? "category active" : "category"
                            }
                            aria-pressed={!category}
                            onClick={() => setCategory("")}
                          >
                            All roles
                          </button>
                          {categories.map((c) => (
                            <button
                              key={c}
                              aria-pressed={category === c}
                              onClick={() => setCategory(c)}
                              className={
                                category === c ? "category active" : "category"
                              }
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                        <div className="filter-row">
                          <button
                            className={`filter-toggle ${showFilters ? "selected" : ""}`}
                            onClick={() => setShowFilters(!showFilters)}
                            aria-expanded={showFilters}
                          >
                            <SlidersHorizontal size={15} />
                            Filters
                            {(type || remote) && (
                              <span className="filter-dot" />
                            )}
                          </button>
                          <label className="remote-toggle">
                            <input
                              type="checkbox"
                              checked={remote}
                              onChange={(e) => setRemote(e.target.checked)}
                            />
                            <span />
                            Remote only
                          </label>
                          {(category ||
                            type ||
                            remote ||
                            search.q ||
                            search.location) && (
                            <button
                              className="text-button reset"
                              onClick={reset}
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                        {showFilters && (
                          <div className="filter-panel">
                            <Field label="Employment type">
                              <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                              >
                                <option value="">All types</option>
                                {[
                                  "Full-time",
                                  "Part-time",
                                  "Contract",
                                  "Volunteer",
                                ].map((t) => (
                                  <option key={t}>{t}</option>
                                ))}
                              </select>
                            </Field>
                          </div>
                        )}
                      </>
                    )}
                    {loading ? (
                      <div
                        className="jobs-list job-skeletons"
                        role="status"
                        aria-label="Finding opportunities"
                      >
                        <span className="visually-hidden">
                          Finding opportunities…
                        </span>
                        {[0, 1, 2].map((item) => (
                          <div
                            className="job-card skeleton-card"
                            key={item}
                            aria-hidden="true"
                          >
                            <div className="skeleton-heading">
                              <span className="skeleton-logo" />
                              <div>
                                <span />
                                <span />
                              </div>
                            </div>
                            <span className="skeleton-line" />
                            <span className="skeleton-line short" />
                          </div>
                        ))}
                      </div>
                    ) : visibleJobs.length ? (
                      <div className="jobs-list">
                        {visibleJobs.map((j) => (
                          <JobCard
                            key={j.id}
                            job={j}
                            saved={saved.includes(j.id)}
                            applied={applied.includes(j.id)}
                            onSave={() => save(j)}
                            onOpen={() => setModal({ kind: "job", job: j })}
                          />
                        ))}
                      </div>
                    ) : (
                      <Empty
                        title={
                          page === "saved"
                            ? "Make room for possibility"
                            : "No roles found just yet"
                        }
                        description={
                          page === "saved"
                            ? "Tap the bookmark on a role to save it here."
                            : "Try a different search or clear your filters to see more opportunities."
                        }
                        action={
                          <button
                            className="button secondary"
                            onClick={() => {
                              reset();
                              go("discover");
                            }}
                          >
                            Explore all roles <ArrowRight size={16} />
                          </button>
                        }
                      />
                    )}
                    <div className="board-footnote">
                      <ShieldCheck size={14} />
                      <span>
                        Sample listings are fictional. Live employer posts
                        appear alongside them.
                      </span>
                    </div>
                  </section>
                  <aside className="right-rail">
                    <section className="resume-prompt">
                      <div className="resume-icon">
                        <FileText size={25} strokeWidth={1.5} />
                        <span>
                          <Sparkles size={13} />
                        </span>
                      </div>
                      <h2>
                        {resume
                          ? "Your experience is ready."
                          : "Let your experience open doors."}
                      </h2>
                      <p>
                        {resume
                          ? "See how your skills connect with each opportunity."
                          : "Upload your résumé to discover roles that connect with your skills and experience."}
                      </p>
                      {resume && (
                        <div className="resume-file">
                          <FileText size={16} />
                          <span>{resume.name}</span>
                          <Check size={15} />
                        </div>
                      )}
                      <button className="button primary full" onClick={upload}>
                        {resume ? "Update résumé" : "Upload résumé"}
                        <Upload size={16} />
                      </button>
                      <small>
                        <ShieldCheck size={13} />
                        Your résumé stays private
                      </small>
                    </section>
                    <section className="community-note">
                      <span className="note-symbol">
                        <Heart size={23} strokeWidth={1.3} />
                      </span>
                      <h3>
                        You bring the gifts.
                        <br />
                        We help you find the place.
                      </h3>
                      <p>
                        From a first step in ministry to a new season of
                        leadership, there’s room for your next chapter.
                      </p>
                      <button
                        className="text-button"
                        onClick={() => go("about")}
                      >
                        Why ChurchConnect <ArrowUpRight size={14} />
                      </button>
                    </section>
                    <div className="hiring-link">
                      <Church size={21} strokeWidth={1.5} />
                      <div>
                        <strong>Looking for your next hire?</strong>
                        <button
                          className="text-button"
                          onClick={() => go("employer")}
                        >
                          Find people with purpose <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </aside>
                </div>
              </>
            )}
            {page === "applications" && (
              <section className="workspace-panel">
                {!user ? (
                  <Empty
                    title="Your next chapter starts here"
                    description="Sign in to keep track of your applications and their progress."
                    action={
                      <button
                        className="button primary"
                        onClick={() => setModal({ kind: "auth" })}
                      >
                        Sign in <ArrowRight size={16} />
                      </button>
                    }
                  />
                ) : loading ? (
                  <div className="loading" role="status">
                    Loading applications…
                  </div>
                ) : applications.length ? (
                  <div className="applications-list">
                    {applications.map((a) => (
                      <article className="application-row" key={a.id}>
                        <span className={`company-logo ${a.job.color}`}>
                          <BriefcaseBusiness size={25} />
                        </span>
                        <div className="application-info">
                          <h3>{a.job.title}</h3>
                          <p>
                            {user.role === "employer"
                              ? `${a.candidate.name} · ${a.candidate.email}`
                              : a.job.church}
                          </p>
                          <small>
                            Applied{" "}
                            {new Date(a.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                            {a.job.is_demo ? " · Sample listing" : ""}
                          </small>
                          {user.role === "employer" && a.cover_note && (
                            <p className="cover-note">{a.cover_note}</p>
                          )}
                        </div>
                        {user.role === "employer" ? (
                          <div className="application-controls">
                            <label>
                              <span className="visually-hidden">
                                Status for {a.candidate.name}
                              </span>
                              <select
                                value={a.status}
                                disabled={actionBusy}
                                onChange={async (e) => {
                                  setActionBusy(true);
                                  try {
                                    await api(`applications/${a.id}/`, {
                                      method: "PATCH",
                                      body: JSON.stringify({
                                        status: e.target.value,
                                      }),
                                    });
                                    setRevision((r) => r + 1);
                                    setToast("Application status updated.");
                                  } catch (e) {
                                    setToast((e as Error).message);
                                  } finally {
                                    setActionBusy(false);
                                  }
                                }}
                              >
                                {[
                                  "Submitted",
                                  "Reviewing",
                                  "Interview",
                                  "Not selected",
                                ].map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </select>
                            </label>
                            <a
                              className="text-button"
                              href={`/api/resumes/${a.resume.id}/download/`}
                            >
                              Download résumé <ArrowDownToLine size={15} />
                            </a>
                          </div>
                        ) : (
                          <span className="status-pill">
                            <span />
                            {a.status}
                          </span>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <Empty
                    title={
                      user.role === "employer"
                        ? "Your future team starts here"
                        : "Your journey is still unfolding"
                    }
                    description={
                      user.role === "employer"
                        ? "Applications to your positions will appear here."
                        : "When you apply for a role, you can follow its progress here."
                    }
                    action={
                      <button
                        className="button primary"
                        onClick={() =>
                          go(user.role === "employer" ? "employer" : "discover")
                        }
                      >
                        {user.role === "employer"
                          ? "View your listings"
                          : "Find an opportunity"}
                        <ArrowRight size={16} />
                      </button>
                    }
                  />
                )}
              </section>
            )}
            {page === "profile" && (
              <section className="workspace-panel profile-panel">
                {!user ? (
                  <Empty
                    title="Make your experience count"
                    description="Create your account to upload a résumé, save roles, and apply."
                    action={
                      <button
                        className="button primary"
                        onClick={() =>
                          setModal({ kind: "auth", register: true })
                        }
                      >
                        Create account <ArrowRight size={16} />
                      </button>
                    }
                  />
                ) : (
                  <>
                    <div className="profile-header">
                      <span className="profile-avatar">
                        {user.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                        <span className="tag">
                          {user.role === "candidate"
                            ? "Job seeker"
                            : user.organization}
                        </span>
                      </div>
                    </div>
                    {user.role === "candidate" ? (
                      <>
                        <div className="profile-section">
                          <h3>Your résumé</h3>
                          {resume ? (
                            <>
                              <div className="resume-document">
                                <FileText size={27} />
                                <div>
                                  <strong>{resume.name}</strong>
                                  <p>
                                    Uploaded{" "}
                                    {new Date(
                                      resume.created_at,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <a
                                  className="icon-button"
                                  aria-label="Download your résumé"
                                  href={`/api/resumes/${resume.id}/download/`}
                                >
                                  <ArrowDownToLine size={20} />
                                </a>
                              </div>
                              <button
                                className="button secondary"
                                onClick={upload}
                              >
                                Replace résumé <Upload size={16} />
                              </button>
                            </>
                          ) : (
                            <p>
                              Give your next opportunity a little context.
                              Upload your résumé to get started.
                            </p>
                          )}
                          {!resume && (
                            <button className="button primary" onClick={upload}>
                              Upload résumé <Upload size={16} />
                            </button>
                          )}
                        </div>
                        {resume && (
                          <div className="profile-section">
                            <h3>Skills found in your résumé</h3>
                            <p className="muted">
                              These keywords help you compare roles. They don’t
                              represent an assessment of your qualifications.
                            </p>
                            <div className="tags">
                              {resume.skills.length ? (
                                resume.skills.map((s) => (
                                  <span className="tag match-tag" key={s}>
                                    <Check size={13} />
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <p>
                                  No matching skill keywords found. You can
                                  still apply to any open role.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="profile-section">
                        <h3>{user.organization}</h3>
                        <p>
                          Post roles and review applicants from your employer
                          workspace.
                        </p>
                        <button
                          className="button primary"
                          onClick={() => go("employer")}
                        >
                          Manage positions <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                    <div className="privacy-line">
                      <ShieldCheck size={19} />
                      <p>
                        Résumé files are private. Applying shares the version
                        attached at that moment with that position’s employer.
                        Replacing your résumé does not change past applications.
                      </p>
                    </div>
                  </>
                )}
              </section>
            )}
            {page === "employer" && (
              <>
                {user?.role === "employer" ? (
                  <section className="workspace-panel">
                    <div className="section-title">
                      <div>
                        <h2>{user.organization}</h2>
                        <span className="result-count">
                          Your open and closed positions
                        </span>
                      </div>
                      <button
                        className="button primary"
                        onClick={() => setModal({ kind: "post" })}
                      >
                        <Plus size={17} />
                        Post a position
                      </button>
                    </div>
                    {loading ? (
                      <div className="loading">Loading your positions…</div>
                    ) : jobs.length ? (
                      jobs.map((j) => (
                        <div className="employer-job" key={j.id}>
                          <div>
                            <h3>{j.title}</h3>
                            <p>
                              {j.location} · {j.type} ·{" "}
                              {j.is_active ? "Open" : "Closed"}
                            </p>
                          </div>
                          <button
                            className="button secondary"
                            disabled={actionBusy}
                            onClick={async () => {
                              setActionBusy(true);
                              try {
                                await api(`jobs/${j.id}/`, {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    is_active: !j.is_active,
                                  }),
                                });
                                setRevision((r) => r + 1);
                                setToast(
                                  j.is_active
                                    ? "Position closed."
                                    : "Position reopened.",
                                );
                              } catch (e) {
                                setToast((e as Error).message);
                              } finally {
                                setActionBusy(false);
                              }
                            }}
                          >
                            {j.is_active ? "Close position" : "Reopen position"}
                          </button>
                        </div>
                      ))
                    ) : (
                      <Empty
                        title="Make space for your next great hire"
                        description="Publish a position to start receiving applications from people ready to serve."
                      />
                    )}
                    <button
                      className="text-button"
                      onClick={() => go("applications")}
                    >
                      Review applicants <ArrowRight size={17} />
                    </button>
                  </section>
                ) : (
                  <section className="employer-welcome">
                    <div>
                      <Church size={38} strokeWidth={1.2} />
                      <h2>
                        The right people
                        <br />
                        make all the difference.
                      </h2>
                      <p>
                        Share your vision. Post your open roles. Connect with
                        candidates who bring experience, care, and a heart for
                        your community.
                      </p>
                      <button
                        className="button primary"
                        onClick={() =>
                          user
                            ? setToast(
                                "Sign out and create an employer account to start hiring.",
                              )
                            : setModal({
                                kind: "auth",
                                register: true,
                                role: "employer",
                              })
                        }
                      >
                        Create an employer account <ArrowUpRight size={18} />
                      </button>
                    </div>
                    <ol className="steps">
                      <li>
                        <span>1</span>
                        <div>
                          <h3>Tell your story</h3>
                          <p>Create your organization’s account.</p>
                        </div>
                      </li>
                      <li>
                        <span>2</span>
                        <div>
                          <h3>Share an opportunity</h3>
                          <p>
                            Publish a role with clear requirements and salary.
                          </p>
                        </div>
                      </li>
                      <li>
                        <span>3</span>
                        <div>
                          <h3>Meet your next team member</h3>
                          <p>Review résumés and track applicant progress.</p>
                        </div>
                      </li>
                    </ol>
                  </section>
                )}
              </>
            )}
            {page === "about" && (
              <section className="about-page">
                <div className="about-main">
                  <Leaf size={35} strokeWidth={1.25} />
                  <h2>
                    Everyone has something
                    <br />
                    <em>meaningful to give.</em>
                  </h2>
                  <p>
                    ChurchConnect brings ministry professionals and church
                    communities together. We believe a good opportunity starts
                    with clarity: what the work involves, what you bring, and
                    who you’ll serve alongside.
                  </p>
                  <p>
                    Explore roles, keep the ones that speak to you, and share
                    your résumé when you’re ready to take the next step.
                  </p>
                  <button
                    className="button primary"
                    onClick={() => go("discover")}
                  >
                    Explore opportunities <ArrowRight size={17} />
                  </button>
                </div>
                <div className="about-aside">
                  <h3>A few things to know</h3>
                  <h4>Your information stays yours</h4>
                  <p>
                    Your résumé is not a public profile. Only you and employers
                    you apply to can download it.
                  </p>
                  <h4>Matching you can understand</h4>
                  <p>
                    We look for skill keywords in your résumé and compare them
                    with job requirements. You decide which roles fit.
                  </p>
                  <h4>A working demonstration</h4>
                  <p>
                    Seeded church names and roles are fictional. Listings
                    created by registered employers are marked separately
                    through the absence of the sample notice.
                  </p>
                </div>
              </section>
            )}
            <footer className="footer">
              <span>Made for people. Built around purpose.</span>
              <div>
                <button onClick={() => go("about")}>About & privacy</button>
                <span>ChurchConnect © {new Date().getFullYear()}</span>
              </div>
            </footer>
          </div>
        </main>
        <nav className="mobile-bottom" aria-label="Mobile navigation">
          {nav.slice(0, 4).map(({ id, label, icon: Icon }) => (
            <button
              className={page === id ? "active" : ""}
              key={id}
              onClick={() => go(id)}
            >
              <Icon size={20} />
              <span>
                {id === "discover"
                  ? "Discover"
                  : id === "saved"
                    ? "Saved"
                    : id === "applications"
                      ? "Applications"
                      : "Profile"}
              </span>
              <span className="visually-hidden">{label}</span>
            </button>
          ))}
        </nav>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {modal?.kind === "auth" && (
        <Dialog
          title={
            isStaticPreview
              ? "You’re exploring a preview"
              : modal.register
                ? "Find your place"
                : "Welcome back"
          }
          onClose={() => setModal(null)}
        >
          {isStaticPreview ? (
            <div className="form">
              <p className="muted">
                You can browse and filter sample opportunities here. Sign-in,
                saved jobs, résumé uploads, and applications will be available
                when the full service launches.
              </p>
              <button className="button primary" onClick={() => setModal(null)}>
                Continue exploring <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <AuthForm
              register={modal.register}
              onModeChange={(register) => setModal({ ...modal, register })}
              initialRole={modal.role}
              onSuccess={(u) => {
                setUser(u);
                setModal(null);
                setToast(
                  `Welcome, ${u.name.split(" ")[0]}. You’re ready to get started.`,
                );
                if (u.role === "employer") go("employer");
              }}
            />
          )}
        </Dialog>
      )}
      {modal?.kind === "upload" && (
        <Dialog
          title="Your experience belongs here"
          onClose={() => setModal(null)}
        >
          <UploadForm
            onSuccess={(r) => {
              setResume(r);
              setModal(null);
              setSort("match");
              setRevision((v) => v + 1);
              setToast("Résumé uploaded. Your skill matches are ready.");
              go("discover");
            }}
          />
        </Dialog>
      )}
      {modal?.kind === "job" && (
        <Dialog title={modal.job.title} onClose={() => setModal(null)} wide>
          <JobDetails
            job={modal.job}
            user={user}
            resume={resume}
            applied={applied.includes(modal.job.id)}
            onAuth={() => setModal({ kind: "auth" })}
            onUpload={upload}
            onApply={() => {
              setApplied((prev) => [...prev, modal.job.id]);
              setToast(
                "Application submitted. Follow its progress in My applications.",
              );
            }}
          />
        </Dialog>
      )}
      {modal?.kind === "post" && (
        <Dialog
          title="Find your next team member"
          onClose={() => setModal(null)}
          wide
        >
          <PostForm
            onSuccess={() => {
              setModal(null);
              setRevision((r) => r + 1);
              setToast("Your position is published and open for applications.");
            }}
          />
        </Dialog>
      )}
      {modal?.kind === "install" && (
        <Dialog
          title="Your next chapter, on the go"
          onClose={() => setModal(null)}
        >
          <div className="form">
            <Logo />
            <p>
              Install ChurchConnect for a home-screen shortcut and an app-like
              experience.
            </p>
            <div className="install-instructions">
              <h3>On iPhone or iPad</h3>
              <p>
                Open this site in Safari, tap Share, then choose Add to Home
                Screen.
              </p>
              <h3>On Android or desktop</h3>
              <p>
                Open the browser menu and choose Install app or Add to Home
                screen. The option appears on HTTPS sites or localhost after the
                app has loaded.
              </p>
            </div>
            <p className="fine-print">
              An internet connection is required for jobs, résumé uploads, and
              applications.
            </p>
            <button className="button primary" onClick={() => setModal(null)}>
              Got it <Check size={17} />
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
