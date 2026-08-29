import { ArrowLeft, LibraryBig } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="page-grid flex min-h-[100dvh] w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center paper-shadow">
        <LibraryBig className="mx-auto size-9 text-accent-foreground" />
        <p className="mt-5 font-mono-app text-[10px] uppercase tracking-[0.2em] text-muted-foreground">SHELF NOT FOUND / 404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">That page is not on our shelf.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">The link may be old, or you may have taken a wrong turn between the stacks.</p>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground" data-testid="link-not-found-home"><ArrowLeft className="size-4" /> Return to overview</Link>
      </div>
    </div>
  );
}
