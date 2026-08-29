import { useState } from 'react';
import { BookOpen, ChevronDown, Compass, FilePlus2, LibraryBig, LogOut, Menu, ShieldCheck, UploadCloud, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useClerk, useUser } from '@clerk/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={cn('flex items-center gap-3 group', compact && 'gap-2')} data-testid="link-brand-home">
      <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground shadow-sm group-hover:-rotate-3" data-testid="logo-mark">
        <BookOpen className="size-5" strokeWidth={2.2} />
        <span className="absolute bottom-2 left-1/2 h-4 w-px -translate-x-1/2 bg-accent-foreground/45" />
      </span>
      <span className={cn('leading-none', compact && 'hidden sm:block')}>
        <span className="block font-display text-xl font-semibold tracking-tight text-sidebar-foreground">Campus</span>
        <span className="mt-0.5 block font-mono-app text-[9px] uppercase tracking-[0.22em] text-accent">Library</span>
      </span>
    </Link>
  );
}

function ProfileChip() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  if (!isLoaded) return <div className="h-9 w-28 animate-pulse rounded-full bg-muted/30" data-testid="skeleton-profile" />;
  if (!user) {
    return (
      <Link href="/sign-in" className="inline-flex h-9 items-center rounded-full border border-sidebar-border px-4 text-xs font-bold text-sidebar-foreground hover:bg-sidebar-accent" data-testid="link-sign-in">
        Sign in
      </Link>
    );
  }
  const initials = (user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || 'S').toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-full bg-accent font-mono-app text-xs font-medium text-accent-foreground" data-testid="avatar-user">{initials}</span>
      <button type="button" onClick={() => signOut({ redirectUrl: '/' })} className="hidden items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground sm:flex" data-testid="button-sign-out">
        <LogOut className="size-3.5" /> Sign out
      </button>
    </div>
  );
}

const navItems = [
  { href: '/', label: 'Overview', icon: Compass },
  { href: '/materials', label: 'Browse library', icon: LibraryBig },
  { href: '/upload', label: 'Share a resource', icon: UploadCloud },
];

export function AppShell({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  return (
    <div className="min-h-[100dvh] bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col bg-sidebar px-5 py-6 lg:flex">
        <LogoMark />
        <div className="mt-12">
          <p className="mb-3 px-3 font-mono-app text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/45">Your study room</p>
          <nav className="space-y-1" aria-label="Primary navigation">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground', location === href && 'bg-sidebar-accent text-sidebar-foreground')} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
                <Icon className="size-[18px]" /> {label}
                {href === '/upload' && <span className="ml-auto rounded-full bg-accent/15 px-1.5 py-0.5 font-mono-app text-[9px] text-accent">+1</span>}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-4">
          <div className="mb-3 flex items-center gap-2 text-accent"><ShieldCheck className="size-4" /><span className="font-mono-app text-[10px] uppercase tracking-wider">Trusted shelf</span></div>
          <p className="text-xs leading-relaxed text-sidebar-foreground/65">Every student upload is checked before it reaches the library.</p>
        </div>
        <div className="mt-5 border-t border-sidebar-border pt-5"><ProfileChip /></div>
      </aside>

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-12">
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-muted lg:hidden" data-testid="button-open-menu"><Menu className="size-5" /></button>
          <div className="hidden lg:block"><p className="font-mono-app text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Academic commons / 2025–26</p></div>
          <div className="ml-auto flex items-center gap-3"><Link href="/materials" className="hidden text-xs font-bold text-muted-foreground hover:text-foreground sm:block" data-testid="link-header-browse">Find materials</Link><ProfileChip /></div>
        </header>
        {children}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-sidebar/80 backdrop-blur-sm lg:hidden" role="dialog" aria-label="Mobile navigation">
          <div className="h-full w-[280px] bg-sidebar px-5 py-6 shadow-xl animate-rise">
            <div className="flex items-center justify-between"><LogoMark compact /><button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent" data-testid="button-close-menu"><X className="size-5" /></button></div>
            <nav className="mt-12 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-sidebar-foreground/75 hover:bg-sidebar-accent', location === href && 'bg-sidebar-accent text-sidebar-foreground')} data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon className="size-[18px]" />{label}</Link>)}
            </nav>
            <div className="mt-8 border-t border-sidebar-border pt-5"><ProfileChip /></div>
          </div>
        </div>
      )}
      {admin && <div className="pointer-events-none fixed bottom-5 right-5 z-20 hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 font-mono-app text-[10px] text-muted-foreground shadow-md md:flex"><ShieldCheck className="size-3.5 text-accent-foreground" /> REVIEW MODE</div>}
    </div>
  );
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 flex items-center gap-2 font-mono-app text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground"><span className="h-px w-5 bg-accent-foreground" />{children}</p>;
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = { approved: 'bg-[#e1eee9] text-[#286052]', pending: 'bg-[#fff0c9] text-[#85651c]', rejected: 'bg-[#f8dfdb] text-[#9a3e34]' };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 font-mono-app text-[10px] uppercase tracking-wider', styles[status] || 'bg-muted text-muted-foreground')} data-testid={`status-${status}`}>{status}</span>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center"><FilePlus2 className="mx-auto mb-4 size-8 text-muted-foreground/50" /><h3 className="font-display text-2xl font-semibold">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>{action && <div className="mt-6">{action}</div>}</div>;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}