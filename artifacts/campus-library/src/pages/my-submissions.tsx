import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, FileText, XCircle } from "lucide-react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";

import {
  AppShell,
  SectionEyebrow,
  StatusPill,
  EmptyState,
  formatBytes,
  formatDate,
} from "@/components/library-shell";

type Submission = {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  courseCode: string;
  category: string;
  semester: string;
  year: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: "pending" | "approved" | "rejected";
  reviewNote: string | null;
  createdAt: string;
};

export default function MySubmissions() {
  const { user, isLoaded } = useUser();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadSubmissions() {
      try {
        setLoading(true);

        const response = await fetch(
          "/api/materials/my-submissions",
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load your submissions.");
        }

        const data = await response.json();

        setSubmissions(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your submissions.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadSubmissions();
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <AppShell>
        <main className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <div className="h-10 w-64 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-40 animate-pulse rounded-2xl bg-muted" />
        </main>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <main className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="font-display text-4xl font-semibold">
            Sign in to view your submissions
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in to see the resources you have uploaded.
          </p>

          <Link
            href="/sign-in"
            className="mt-7 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
          >
            Sign in
          </Link>
        </main>
      </AppShell>
    );
  }

  const pendingCount = submissions.filter(
    (item) => item.status === "pending",
  ).length;

  const approvedCount = submissions.filter(
    (item) => item.status === "approved",
  ).length;

  const rejectedCount = submissions.filter(
    (item) => item.status === "rejected",
  ).length;

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14">

        <SectionEyebrow>YOUR CONTRIBUTIONS</SectionEyebrow>

        <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          My submissions
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          Track the materials you have uploaded and see their review status.
        </p>

        {/* STATUS SUMMARY */}

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="rounded-2xl bg-[#fff0c9] p-5">
            <Clock3 className="size-5" />

            <p className="mt-4 font-mono-app text-[10px] uppercase tracking-widest">
              Pending
            </p>

            <p className="mt-2 font-display text-3xl font-semibold">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl bg-[#e1eee9] p-5">
            <CheckCircle2 className="size-5" />

            <p className="mt-4 font-mono-app text-[10px] uppercase tracking-widest">
              Approved
            </p>

            <p className="mt-2 font-display text-3xl font-semibold">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f8dfdb] p-5">
            <XCircle className="size-5" />

            <p className="mt-4 font-mono-app text-[10px] uppercase tracking-widest">
              Rejected
            </p>

            <p className="mt-2 font-display text-3xl font-semibold">
              {rejectedCount}
            </p>
          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-destructive/30 bg-[#f8dfdb] p-5 text-sm text-[#7c3029]">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!loading && !error && submissions.length === 0 && (
          <div className="mt-8">
            <EmptyState
              title="No submissions yet"
              body="Upload a resource and it will appear here with its review status."
              action={
                <Link
                  href="/upload"
                  className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
                >
                  Share a resource
                </Link>
              }
            />
          </div>
        )}

        {/* SUBMISSIONS */}

        {!loading && !error && submissions.length > 0 && (
          <div className="mt-8 space-y-4">

            {submissions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-card p-5 paper-shadow"
              >

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary">
                    <FileText className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="font-display text-2xl font-semibold">
                        {item.title}
                      </h2>

                      <StatusPill status={item.status} />

                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.courseCode} · {item.subject} · {item.category}
                    </p>

                    <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono-app text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span>{item.semester}</span>
                      <span>{item.year}</span>
                      <span>{formatBytes(item.fileSize)}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </p>

                    {/* PENDING */}

                    {item.status === "pending" && (
                      <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#fff0c9] px-4 py-3 text-sm text-[#85651c]">

                        <Clock3 className="mt-0.5 size-4 shrink-0" />

                        <span>
                          Your submission is waiting for admin review.
                        </span>

                      </div>
                    )}

                    {/* APPROVED */}

                    {item.status === "approved" && (
                      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#e1eee9] px-4 py-3">

                        <div className="flex items-center gap-2 text-sm text-[#286052]">

                          <CheckCircle2 className="size-4" />

                          <span>
                            Your resource has been approved.
                          </span>

                        </div>

                        <Link
                          href={`/materials/${item.id}`}
                          className="shrink-0 text-sm font-bold text-[#286052] underline"
                        >
                          View
                        </Link>

                      </div>
                    )}

                    {/* REJECTED */}

                    {item.status === "rejected" && (
                      <div className="mt-4 rounded-xl bg-[#f8dfdb] px-4 py-3">

                        <div className="flex items-center gap-2 text-sm font-semibold text-[#9a3e34]">

                          <XCircle className="size-4" />

                          <span>
                            Your submission was rejected.
                          </span>

                        </div>

                        {item.reviewNote && (
                          <p className="mt-2 text-sm text-[#7c3029]">
                            <strong>Reason:</strong>{" "}
                            {item.reviewNote}
                          </p>
                        )}

                      </div>
                    )}

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>
    </AppShell>
  );
}
