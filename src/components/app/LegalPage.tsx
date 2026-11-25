import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppFooter } from "./AppFooter";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-5 py-5">
        <Link to="/">
          <Logo />
        </Link>
        <LanguageSwitcher compact />
      </header>
      <article className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-5 pb-20 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {children}
      </article>
      <AppFooter />
    </div>
  );
}
