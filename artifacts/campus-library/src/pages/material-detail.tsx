import { ArrowLeft, CalendarDays, Download, FileText, HardDrive, Share2, UserRound } from 'lucide-react';
import { Link, useLocation, useRoute } from 'wouter';
import { getGetMaterialQueryKey, useGetMaterial } from '@workspace/api-client-react';
import { AppShell, SectionEyebrow, StatusPill, formatBytes, formatDate } from '@/components/library-shell';
import { Button } from '@/components/ui/button';

export default function MaterialDetail() {
  const [, params] = useRoute('/materials/:id');
  const [, setLocation] = useLocation();
  const id = Number(params?.id || 0);
  const material = useGetMaterial(id, { query: { queryKey: getGetMaterialQueryKey(id), enabled: id > 0 }, request: { credentials: 'include' } });

  if (material.isLoading) return <AppShell><main className="mx-auto max-w-4xl px-5 py-14 sm:px-8"><div className="h-5 w-24 animate-pulse rounded bg-muted" /><div className="mt-12 h-12 w-3/4 animate-pulse rounded bg-muted" /><div className="mt-5 h-20 w-full animate-pulse rounded bg-muted" /><div className="mt-12 h-56 animate-pulse rounded-2xl bg-muted" /></main></AppShell>;
  if (material.isError || !material.data) return <AppShell><main className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8"><FileText className="mx-auto size-10 text-muted-foreground/50" /><h1 className="mt-5 font-display text-4xl font-semibold">This page is missing</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">We could not find that material. It may have moved off the shelf.</p><Button className="mt-7" onClick={() => setLocation('/materials')} data-testid="button-back-materials">Back to materials</Button></main></AppShell>;
  const item = material.data;
  const downloadUrl = item.objectPath ? `/api/storage${item.objectPath}` : undefined;

  return <AppShell><main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
    <Link href="/materials" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground" data-testid="link-back-materials"><ArrowLeft className="size-4" /> All materials</Link>
    <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_.7fr]">
      <div><SectionEyebrow>{item.courseCode} / {item.category}</SectionEyebrow><h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl" data-testid="text-material-title">{item.title}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground" data-testid="text-material-description">{item.description}</p><div className="mt-9 flex flex-wrap gap-3"><a href={downloadUrl || '#'} target="_blank" rel="noreferrer" aria-disabled={!downloadUrl} onClick={(event) => { if (!downloadUrl) event.preventDefault(); }} className={`inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-extrabold ${downloadUrl ? 'bg-primary text-primary-foreground hover:-translate-y-0.5' : 'pointer-events-none bg-muted text-muted-foreground'}`} data-testid="link-download-material"><Download className="size-4" /> {downloadUrl ? 'Download file' : 'File unavailable'}</a><Button variant="outline" className="h-12" onClick={() => navigator.clipboard?.writeText(window.location.href)} data-testid="button-share-material"><Share2 className="size-4" /> Copy link</Button></div></div>
      <div className="rounded-2xl border border-border bg-card p-6 paper-shadow"><div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-xl bg-secondary"><FileText className="size-5" /></span><StatusPill status={item.status} /></div><div className="mt-9 space-y-5">{[['Subject', item.subject], ['Term', `${item.semester}, ${item.year}`], ['File', item.fileName], ['Size', formatBytes(item.fileSize)], ['Added', formatDate(item.createdAt)]].map(([label, value]) => <div key={label as string} className="flex items-start justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0"><span className="font-mono-app text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span><span className="max-w-[58%] text-right text-sm font-semibold" data-testid={`text-material-${String(label).toLowerCase()}`}>{value}</span></div>)}</div></div>
    </div>
    <div className="mt-12 grid gap-4 border-t border-border pt-7 text-xs text-muted-foreground sm:grid-cols-3"><div className="flex items-center gap-2"><UserRound className="size-4 text-accent-foreground" /> Shared by {item.uploadedByName || 'a student'}</div><div className="flex items-center gap-2"><HardDrive className="size-4 text-accent-foreground" /> {item.downloads} student downloads</div><div className="flex items-center gap-2"><CalendarDays className="size-4 text-accent-foreground" /> Added {formatDate(item.createdAt)}</div></div>
  </main></AppShell>;
}