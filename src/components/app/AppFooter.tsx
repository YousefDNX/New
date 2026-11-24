import { Link } from "@tanstack/react-router";
import { ShieldCheck, Bug, Lock } from "lucide-react";
import { Logo } from "./Logo";
import { ReportProblemModal } from "@/components/support/ReportProblemModal";
import { useRbac } from "@/hooks/use-rbac";
import { usePrefs } from "@/lib/preferences";
import { getBrand } from "@/config/brand";

export function AppFooter() {
  const brand = getBrand();
  const rbac = useRbac();
  const { lang, t, effectiveUiExperience } = usePrefs();
  const isAr = lang === "ar";

  const footerClass =
    effectiveUiExperience === "editorial_atelier"
      ? "mt-auto border-t border-border bg-surface/60 pt-12 pb-16 px-4 md:px-8 text-xs text-muted-foreground"
      : effectiveUiExperience === "command_os"
        ? "mt-auto border-t border-border/80 bg-surface/40 backdrop-blur-md pt-10 pb-24 px-4 md:px-8 text-xs text-muted-foreground"
        : effectiveUiExperience === "focus_deck"
          ? "mt-auto border-t border-border/60 bg-surface/40 pt-10 pb-16 px-4 md:px-8 text-xs text-muted-foreground"
          : "mt-auto border-t border-border/80 bg-surface/55 backdrop-blur-md pt-12 pb-16 px-4 md:px-8 text-xs text-muted-foreground";

  return (
    <footer className={footerClass}>
      <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand & Mission */}
        <div className="col-span-2 space-y-3">
          <Logo />
          <p className="text-xs leading-relaxed max-w-sm text-muted-foreground/90">
            {isAr ? brand.missionAr : brand.mission}
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t("footer.accessibilityBadge")}</span>
          </div>
        </div>

        {/* Learning Hub */}
        <div className="space-y-2.5">
          <div className="font-semibold text-foreground text-xs">{t("footer.env.title")}</div>
          <ul className="space-y-2">
            <li>
              <Link to="/app" className="hover:text-primary transition-colors">
                {t("footer.env.growth")}
              </Link>
            </li>
            <li>
              <Link to="/app/study" className="hover:text-primary transition-colors">
                {t("footer.env.study")}
              </Link>
            </li>
            <li>
              <Link to="/app/tasks" className="hover:text-primary transition-colors">
                {t("footer.env.productivity")}
              </Link>
            </li>
            <li>
              <Link to="/app/ai" className="hover:text-primary transition-colors">
                {t("footer.env.ai")}
              </Link>
            </li>
            <li>
              <Link to="/app/care" className="hover:text-primary transition-colors">
                {t("footer.env.care")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Community */}
        <div className="space-y-2.5">
          <div className="font-semibold text-foreground text-xs">{t("footer.support.title")}</div>
          <ul className="space-y-2">
            <li>
              <Link to="/help" className="hover:text-primary transition-colors">
                {t("footer.helpCenter")}
              </Link>
            </li>
            <li>
              <Link to="/app/support" className="hover:text-primary transition-colors">
                {t("footer.contactSupport")}
              </Link>
            </li>
            <li>
              <Link to="/app/support" className="hover:text-primary transition-colors">
                {t("nav.supportTickets")}
              </Link>
            </li>
            <li>
              <ReportProblemModal
                trigger={
                  <button
                    type="button"
                    className="hover:text-primary transition-colors text-start flex items-center gap-1"
                  >
                    <Bug className="size-3 text-destructive shrink-0" />
                    <span>{t("footer.report")}</span>
                  </button>
                }
              />
            </li>
            <li>
              <Link to="/community-guidelines" className="hover:text-primary transition-colors">
                {t("landing.footer.safety")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Governance */}
        <div className="space-y-2.5">
          <div className="font-semibold text-foreground text-xs">{t("landing.footer.privacy")}</div>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="hover:text-primary transition-colors">
                {t("landing.nav.about")}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-primary transition-colors">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-primary transition-colors">
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <Link to="/safety" className="hover:text-primary transition-colors">
                {t("landing.footer.safety")}
              </Link>
            </li>
            {rbac.isStaff && (
              <li className="pt-1">
                <Link
                  to="/app/admin"
                  className="text-primary font-semibold flex items-center gap-1 hover:underline"
                >
                  <Lock className="size-3 shrink-0" />
                  <span>{t("nav.adminCenter")}</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-6xl mt-10 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-[11px] text-muted-foreground">
        <div>{isAr ? brand.copyrightAr : brand.copyright}</div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:underline">
            {t("landing.nav.about")}
          </Link>
          <Link to="/help" className="hover:underline">
            {t("landing.nav.helpCenter")}
          </Link>
          <Link to="/terms" className="hover:underline">
            {t("footer.terms")}
          </Link>
          <Link to="/privacy" className="hover:underline">
            {t("footer.privacy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
