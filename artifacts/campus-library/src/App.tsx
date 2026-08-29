import { useEffect, useRef, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, Show, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Home from '@/pages/home';
import Materials from '@/pages/materials';
import MaterialDetail from '@/pages/material-detail';
import Upload from '@/pages/upload';
import Admin from '@/pages/admin';
import NotFound from '@/pages/not-found';
import {
  Redirect,
  Link,
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#1e3542',
    colorForeground: '#1e3542',
    colorMutedForeground: '#65727a',
    colorDanger: '#9a3e34',
    colorBackground: '#fbf8f0',
    colorInput: '#f4efe5',
    colorInputForeground: '#1e3542',
    colorNeutral: '#d9d1c2',
    fontFamily: 'Manrope, sans-serif',
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fbf8f0] rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#d9d1c2]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#1e3542] font-semibold',
    headerSubtitle: 'text-[#65727a]',
    socialButtonsBlockButtonText: 'text-[#1e3542] font-semibold',
    formFieldLabel: 'text-[#1e3542] font-semibold',
    footerActionLink: 'text-[#1e3542] font-bold',
    footerActionText: 'text-[#65727a]',
    dividerText: 'text-[#65727a]',
    identityPreviewEditButton: 'text-[#1e3542]',
    formFieldSuccessText: 'text-[#286052]',
    alertText: 'text-[#9a3e34]',
    logoBox: 'rounded-xl overflow-hidden',
    logoImage: 'rounded-xl',
    socialButtonsBlockButton: 'border-[#d9d1c2] bg-[#f4efe5] hover:bg-[#e9dfce]',
    formButtonPrimary: 'bg-[#1e3542] text-[#fbf8f0] hover:bg-[#286052]',
    formFieldInput: 'border-[#d9d1c2] bg-[#f4efe5] text-[#1e3542]',
    footerAction: 'border-[#d9d1c2]',
    dividerLine: 'bg-[#d9d1c2]',
    alert: 'border-[#e8bbb3] bg-[#f8dfdb]',
    otpCodeFieldInput: 'border-[#d9d1c2] bg-[#f4efe5] text-[#1e3542]',
    formFieldRow: 'text-[#1e3542]',
    main: 'bg-transparent',
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) queryClient.clear();
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener]);
  return null;
}

function SignInPage() {
  return <div className="page-grid flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>;
}

function SignUpPage() {
  return <div className="page-grid flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>;
}

function HomeRedirect() {
  return <><Show when="signed-in"><Redirect to="/materials" /></Show><Show when="signed-out"><Home /></Show></>;
}

function ProtectedAdmin() {
  return <><Show when="signed-in"><Admin /></Show><Show when="signed-out"><div className="page-grid flex min-h-[100dvh] items-center justify-center bg-background p-6"><div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center paper-shadow"><ShieldIcon /><h1 className="mt-5 font-display text-4xl font-semibold">Review desk access</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in with your library steward account to review student submissions.</p><Link href="/sign-in" className="mt-7 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground" data-testid="link-admin-sign-in">Sign in to continue</Link></div></div></Show></>;
}

function ShieldIcon() {
  return <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground"><span className="font-mono-app text-lg">S</span></span>;
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/materials" component={Materials} />
        <Route path="/materials/:id" component={MaterialDetail} />
        <Route path="/upload" component={Upload} />
        <Route path="/admin" component={ProtectedAdmin} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Pick up where you left off.' } },
        signUp: { start: { title: 'Join the commons', subtitle: 'Share knowledge, one page at a time.' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return <WouterRouter base={basePath}><ClerkProviderWithRoutes /></WouterRouter>;
}

export default App;
