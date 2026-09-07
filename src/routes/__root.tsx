import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CinematicLoader } from "@/components/CinematicLoader";
import { GravityWaterCanvas } from "@/components/GravityWaterCanvas";
import { CustomCursor } from "@/components/environment/CustomCursor";
import { EnvironmentalBackground } from "@/components/environment/EnvironmentalBackground";
import { EnvironmentDevPanel } from "@/components/environment/EnvironmentDevPanel";
import { LabAmbience } from "@/components/LabAmbience";
import { PageTransition } from "@/components/PageTransition";
import { ParticleField } from "@/components/ParticleField";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";

export function NotFoundComponent() {
  return (
    <main className="not-found-page">
      <div className="not-found-grid" aria-hidden="true" />
      <div className="not-found-copy">
        <p className="eyebrow">ARCHIVE ERROR · 404</p>
        <h1>FILE NOT FOUND</h1>
        <p>The address you entered is not in the EXCLADE archive. Return to the home terminal and continue from there.</p>
        <Link to="/" className="primary-cta">RETURN TO HOME <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  );
}

export function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "KSR College of Engineering · Department of CSE (IoT)" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [showLoader, setShowLoader] = useState(true);
  const [routeChanging, setRouteChanging] = useState(false);
  const firstPath = useRef(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowLoader(false);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }

    setRouteChanging(true);
    const timer = window.setTimeout(() => setRouteChanging(false), 700);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="exclade-app">
        <CustomCursor />
        <EnvironmentalBackground />
         {import.meta.env.DEV && <EnvironmentDevPanel />}
        {showLoader && <CinematicLoader />}
        {!showLoader && (
          <>
            <PageTransition active={routeChanging} pathname={pathname} />
            <GravityWaterCanvas />
            <ScrollProgress />
            <ParticleField />
            <LabAmbience />
            <SiteNav />
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <main key={pathname} className="route-view">
              <Outlet />
            </main>
            <SiteFooter />
          </>
        )}
      </div>
    </QueryClientProvider>
  );
}
