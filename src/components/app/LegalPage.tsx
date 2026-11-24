import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-5 py-5">
        <Link to="/">
          <Logo />
        </Link>
        <LanguageSwitcher compact />
      </header>
      <article className="mx-auto max-w-3xl space-y-4 px-5 pb-20 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {children}
      </article>
    </div>
  );
}
