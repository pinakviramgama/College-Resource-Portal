import { ArrowUpRight, BookCopy, ChevronRight, Download, FileText, Search, Sparkles, UploadCloud } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { getGetDashboardStatsQueryKey, getHealthCheckQueryKey, getListMaterialsQueryKey, getListSubjectsQueryKey, useGetDashboardStats, useHealthCheck, useListMaterials, useListSubjects } from '@workspace/api-client-react';
import { AppShell, EmptyState, SectionEyebrow, formatBytes, formatDate } from '@/components/library-shell';
import { Input } from '@/components/ui/input';

function SkeletonStrip() {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />)}</div>;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const materials = useListMaterials(undefined, { query: { queryKey: getListMaterialsQueryKey(), staleTime: 60_000 }, request: { credentials: 'include' } });
  const subjects = useListSubjects({ query: { queryKey: getListSubjectsQueryKey(), staleTime: 60_000 }, request: { credentials: 'include' } });
  const stats = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey(), staleTime: 60_000 }, request: { credentials: 'include' } });
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 300_000 }, request: { credentials: 'include' } });
  const featured = materials.data?.slice(0, 3) || [];

  return (
    <AppShell>
      <main>
        <section className="relative overflow-hidden border-b border-border bg-sidebar px-5 py-16 text-sidebar-foreground sm:px-8 sm:py-24 lg:px-16 lg:py-28">
          <div className="absolute right-[-7%] top-[-30%] size-[520px] rounded-full border-[70px] border-accent/10" />
          <div className="absolute bottom-[-55%] right-[12%] size-[420px] rounded-full border border-accent/10" />
          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-3xl animate-rise">
              <SectionEyebrow>THE COLLEGE COMMONS</SectionEyebrow>
              <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[.97] tracking-tight text-sidebar-foreground sm:text-7xl lg:text-[6.4rem]">Study from what<br /><em className="text-accent">we know.</em></h1>
              <p className="mt-8 max-w-xl text-base leading-7 text-sidebar-foreground/65 sm:text-lg">A shared shelf of exam papers, lecture notes, and the resources students actually use. Find your next useful page in a few seconds.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/materials" className="inline-flex h-12 items-center gap-3 rounded-xl bg-accent px-5 text-sm font-extrabold text-accent-foreground shadow-sm hover:-translate-y-0.5" data-testid="link-hero-browse">Browse the library <ArrowUpRight className="size-4" /></Link>
                <Link href="/upload" className="inline-flex h-12 items-center gap-3 rounded-xl border border-sidebar-border px-5 text-sm font-bold text-sidebar-foreground hover:bg-sidebar-accent" data-testid="link-hero-upload"><UploadCloud className="size-4" /> Share a resource</Link>
              </div>
            </div>
            <div className="relative mt-16 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 animate-rise delay-2">
              {[
                ['01', 'Find', 'credible course material'],
                ['02', 'Save', 'time before exams'],
                ['03', 'Share', 'what helped you'],
                ['04', 'Build', 'the commons together'],
              ].map(([num, title, text]) => <div key={num} className="border-t border-sidebar-border pt-3"><span className="font-mono-app text-[10px] text-accent">{num}</span><p className="mt-5 font-display text-xl">{title}</p><p className="mt-1 text-xs leading-5 text-sidebar-foreground/55">{text}</p></div>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <SectionEyebrow>START HERE</SectionEyebrow>
              <h2 className="max-w-xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">What are you<br /><span className="text-muted-foreground">working on?</span></h2>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Search library" placeholder="Search by title, subject, or course code" className="h-14 rounded-xl border-border bg-card pl-12 pr-4 text-sm shadow-sm" onKeyDown={(event) => { if (event.key === 'Enter') setLocation(`/materials?search=${encodeURIComponent(event.currentTarget.value)}`); }} data-testid="input-hero-search" />
              <p className="mt-2 text-right font-mono-app text-[10px] uppercase tracking-wider text-muted-foreground">Press enter to search the collection</p>
            </div>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(subjects.data || []).slice(0, 8).map((subject) => <Link key={subject.subject} href={`/materials?subject=${encodeURIComponent(subject.subject)}`} className="group flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 paper-shadow hover:border-accent-foreground/40" data-testid={`link-subject-${subject.subject.replaceAll(' ', '-')}`}><span><span className="block text-sm font-bold">{subject.subject}</span><span className="mt-1 block font-mono-app text-[10px] uppercase tracking-wider text-muted-foreground">{subject.count} resources</span></span><ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-accent-foreground" /></Link>)}
            {!subjects.isLoading && !subjects.data?.length && <div className="sm:col-span-2 lg:col-span-4"><EmptyState title="Subjects are being catalogued" body="The library shelf is getting ready. Check back shortly for course collections." /></div>}
          </div>
        </section>

        <section className="bg-[#e9dfce] px-5 py-14 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div><SectionEyebrow>FRESH ON THE SHELF</SectionEyebrow><h2 className="font-display text-4xl font-semibold leading-none sm:text-5xl">Recently shared</h2></div>
              <Link href="/materials?sort=recent" className="flex items-center gap-2 text-sm font-extrabold text-foreground underline decoration-accent-foreground underline-offset-4" data-testid="link-recent-all">See all materials <ArrowUpRight className="size-4" /></Link>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {materials.isLoading && <SkeletonStrip />}
              {!materials.isLoading && featured.map((material, index) => <Link key={material.id} href={`/materials/${material.id}`} className="group rounded-2xl border border-border bg-card p-5 paper-shadow lift animate-rise" data-testid={`card-featured-material-${material.id}`}><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-secondary text-foreground"><FileText className="size-5" /></span><span className="font-mono-app text-[10px] text-muted-foreground">0{index + 1}</span></div><p className="mt-8 font-mono-app text-[10px] uppercase tracking-wider text-muted-foreground">{material.courseCode} / {material.category}</p><h3 className="mt-2 line-clamp-2 font-display text-2xl font-semibold leading-tight group-hover:text-accent-foreground">{material.title}</h3><div className="mt-7 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground"><span>{formatDate(material.createdAt)}</span><span>{formatBytes(material.fileSize)} <Download className="ml-1 inline size-3" /></span></div></Link>)}
              {!materials.isLoading && !featured.length && <div className="lg:col-span-3"><EmptyState title="The shelf is quiet" body="No approved materials have landed yet. Be the first student to share a useful page." action={<Link href="/upload" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground" data-testid="link-empty-upload">Share a resource</Link>} /></div>}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-16">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
            <div className="rounded-2xl bg-primary p-7 text-primary-foreground sm:p-9"><Sparkles className="size-5 text-accent" /><h2 className="mt-10 font-display text-4xl font-semibold leading-none">Small acts.<br />Better study days.</h2><p className="mt-5 text-sm leading-6 text-primary-foreground/65">Found a paper that saved your week? Put it back on the shelf for someone else.</p><Link href="/upload" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent underline decoration-accent/40 underline-offset-4" data-testid="link-commons-upload">Contribute to the commons <ArrowUpRight className="size-4" /></Link></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-7"><BookCopy className="size-5 text-accent-foreground" /><p className="mt-9 font-mono-app text-[10px] uppercase tracking-widest text-muted-foreground">The collection</p><p className="mt-2 font-display text-3xl font-semibold">{stats.data?.totalMaterials ?? '—'} <span className="text-lg text-muted-foreground">materials</span></p><p className="mt-2 text-sm text-muted-foreground">Reviewed resources across your courses.</p></div>
              <div className="rounded-2xl border border-border bg-card p-7"><Download className="size-5 text-accent-foreground" /><p className="mt-9 font-mono-app text-[10px] uppercase tracking-widest text-muted-foreground">Shared momentum</p><p className="mt-2 font-display text-3xl font-semibold">{stats.data?.totalDownloads ?? '—'} <span className="text-lg text-muted-foreground">downloads</span></p><p className="mt-2 text-sm text-muted-foreground">Pages put to work by students.</p></div>
            </div>
          </div>
          <p className="mt-7 text-right font-mono-app text-[10px] uppercase tracking-widest text-muted-foreground" data-testid="status-library-health">Library systems {health.isLoading ? 'checking' : health.isError ? 'offline' : 'online'} <span className={health.isError ? 'text-destructive' : 'text-[#286052]'}>●</span></p>
        </section>
      </main>
    </AppShell>
  );
}