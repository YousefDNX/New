import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCenter } from "@/components/help/HelpCenter";
import { AppFooter } from "@/components/app/AppFooter";
import { Logo } from "@/components/app/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: `Help Center & Documentation — ${BRAND.name}` },
      {
        name: "description",
        content: `Comprehensive guides, walkthroughs, and answers to frequently asked questions about ${BRAND.name}.`,
      },
      { property: "og:title", content: `Help Center — ${BRAND.name}` },
      { property: "og:description", content: `Search guides and FAQs for ${BRAND.name}.` },
    ],
  }),
  component: PublicHelpPage,
});

function PublicHelpPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-dvh flex flex-col bg-background bg-hero">
      <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between gap-8 border-b border-border px-4 md:px-8">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <Link
            to="/"
            className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
          >
            About
          </Link>
          <Link
            to="/safety"
            className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
          >
            Safety
          </Link>
          <Link
            to="/privacy"
            className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
          >
            Privacy
          </Link>
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <Button asChild variant="glow" size="sm" className="text-xs h-8">
              <Link to="/app">Go to Workspace</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-xs h-8">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild variant="glow" size="sm" className="text-xs h-8">
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 md:py-12">
        <HelpCenter />
      </main>

      <AppFooter />
    </div>
  );
}
