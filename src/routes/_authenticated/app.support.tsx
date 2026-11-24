import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, Ticket, Bug, ShieldAlert, Lightbulb, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupportTicketForm } from "@/components/support/SupportTicketForm";
import { UserTicketsList } from "@/components/support/UserTicketsList";
import { FeedbackCenter } from "@/components/support/FeedbackCenter";
import { ReportProblemModal } from "@/components/support/ReportProblemModal";
import { ReportAbuseModal } from "@/components/support/ReportAbuseModal";
import { Link } from "@tanstack/react-router";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/support")({
  head: () => ({
    meta: [
      { title: `Student Support & Help Desk — ${BRAND.name}` },
      {
        name: "description",
        content: "Submit support requests, view tickets, and suggest improvements.",
      },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const { lang, effectiveBtcVisualTheme } = usePrefs();
  const isAltTheme = effectiveBtcVisualTheme === "btc_alternative";
  const isAr = lang === "ar";
  const [activeTab, setActiveTab] = useState<"new_ticket" | "my_tickets" | "feedback">(
    "new_ticket",
  );

  return (
    <div data-testid={isAltTheme ? "btc-alternative-support" : undefined} className="space-y-6">
      {/* Page Header */}
      <div
        className={
          isAltTheme
            ? "rounded-2xl border border-border bg-surface p-6 flex flex-wrap items-center justify-between gap-4"
            : "flex flex-wrap items-center justify-between gap-4"
        }
      >
        <div>
          {isAltTheme && (
            <p className="mb-1 text-xs font-semibold text-primary">
              {isAr ? "مكتب المساعدة والحماية الطلابية" : "Atelier Student Resolution Desk"}
            </p>
          )}
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2.5">
            <MessageSquare className="size-6 text-primary" />
            <span>{isAr ? "مركز الدعم وحل المشكلات" : "Support & Resolution Hub"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr
              ? "هل تحتاج إلى مساعدة، لاحظت خطأ، أو ترغب باقتراح ميزة جديدة؟ نحن هنا لدعم رحلتك."
              : "Need assistance, discovered a bug, or want to suggest a new feature? We are here to support your learning journey."}
          </p>
        </div>

        {/* Quick Diagnostic / Emergency Modals */}
        <div className="flex flex-wrap items-center gap-2">
          <FeatureGuideTrigger featureId="support-hub" />
          <ReportProblemModal
            trigger={
              <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs">
                <Bug className="size-3.5 text-destructive" />
                <span>{isAr ? "الإبلاغ عن مشكلة" : "Report Problem"}</span>
              </Button>
            }
          />
          <ReportAbuseModal
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
              >
                <ShieldAlert className="size-3.5" />
                <span>{isAr ? "الإبلاغ عن إساءة" : "Report Abuse"}</span>
              </Button>
            }
          />
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link to="/app/help">
              <HelpCircle className="size-3.5 text-primary" />
              <span>{isAr ? "مركز المساعدة" : "Browse Help Center"}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <div
        className={
          isAltTheme
            ? "inline-flex flex-wrap gap-1.5 rounded-xl border border-border bg-surface p-1 text-xs font-semibold"
            : "flex border-b border-border text-xs gap-4 font-semibold"
        }
      >
        <button
          type="button"
          onClick={() => setActiveTab("new_ticket")}
          className={
            isAltTheme
              ? `flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-colors ${
                  activeTab === "new_ticket"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`
              : `pb-2.5 transition-all flex items-center gap-1.5 ${
                  activeTab === "new_ticket"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
          }
        >
          <MessageSquare className="size-3.5" />
          <span>{isAr ? "تقديم طلب دعم" : "Submit Support Request"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("my_tickets")}
          className={
            isAltTheme
              ? `flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-colors ${
                  activeTab === "my_tickets"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`
              : `pb-2.5 transition-all flex items-center gap-1.5 ${
                  activeTab === "my_tickets"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
          }
        >
          <Ticket className="size-3.5" />
          <span>{isAr ? "تذاكري والمحادثات" : "My Tickets & Conversation History"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("feedback")}
          className={
            isAltTheme
              ? `flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-colors ${
                  activeTab === "feedback"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`
              : `pb-2.5 transition-all flex items-center gap-1.5 ${
                  activeTab === "feedback"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
          }
        >
          <Lightbulb className="size-3.5" />
          <span>{isAr ? "الاقتراحات والتطوير" : "Suggestions & Community Roadmap"}</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "new_ticket" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <SupportTicketForm onSuccess={() => setActiveTab("my_tickets")} />
          </div>
          <div className="md:col-span-4 space-y-4">
            <div className="surface-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Support Service Standards
              </h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Response times:</strong> Under 4 hours on study days.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Live thread:</strong> Replies appear directly in your ticket thread.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Security:</strong> Tickets are strictly private between you and
                    authorized staff.
                  </span>
                </li>
              </ul>
            </div>

            <div className="surface-card p-5 space-y-2">
              <h4 className="text-xs font-bold text-foreground">Have a quick question?</h4>
              <p className="text-xs text-muted-foreground">
                Check our searchable Help Center with step-by-step guides and Frequently Asked
                Questions.
              </p>
              <div className="pt-1">
                <Button asChild variant="outline" size="sm" className="w-full text-xs">
                  <Link to="/app/help">Explore Help Articles</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "my_tickets" && <UserTicketsList />}

      {activeTab === "feedback" && <FeedbackCenter />}
    </div>
  );
}
