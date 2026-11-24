import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldAlert,
  Server,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminTicketManager } from "@/components/admin/AdminTicketManager";
import { AdminHelpEditor } from "@/components/admin/AdminHelpEditor";
import { AdminModerationManager } from "@/components/admin/AdminModerationManager";
import { AdminUserManager } from "@/components/admin/AdminUserManager";
import { AdminAuditLogViewer } from "@/components/admin/AdminAuditLogViewer";
import { TeacherCollaborationCenter } from "@/components/admin/TeacherCollaborationCenter";
import { useRbac } from "@/hooks/use-rbac";
import { Link } from "@tanstack/react-router";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { BRAND } from "@/config/brand";

type AdminTab = "overview" | "tickets" | "articles" | "moderation" | "users" | "audit" | "educator";

const VALID_ADMIN_TABS: readonly AdminTab[] = [
  "overview",
  "tickets",
  "articles",
  "moderation",
  "users",
  "audit",
  "educator",
] as const;

export const Route = createFileRoute("/_authenticated/app/admin")({
  validateSearch: (search: Record<string, unknown>): { tab?: AdminTab } => {
    const raw = typeof search["tab"] === "string" ? search["tab"] : undefined;
    if (raw && (VALID_ADMIN_TABS as readonly string[]).includes(raw)) {
      return { tab: raw as AdminTab };
    }
    return {};
  },
  head: () => ({
    meta: [
      { title: `Admin Control Center — ${BRAND.name}` },
      {
        name: "description",
        content: "Platform governance, ticket dispatch, and content moderation.",
      },
    ],
  }),
  component: AdminControlCenterPage,
});

function AdminControlCenterPage() {
  const rbac = useRbac();
  const { tab } = Route.useSearch();
  const [activeTab, setActiveTab] = useState<AdminTab>(tab ?? "overview");

  if (rbac.loading) {
    return (
      <div className="surface-card p-12 text-center text-sm text-muted-foreground">
        Verifying administrative credentials...
      </div>
    );
  }

  if (!rbac.isStaff) {
    return (
      <div className="surface-card p-8 md:p-12 text-center max-w-lg mx-auto space-y-4 my-8">
        <div className="size-14 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mx-auto">
          <Lock className="size-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-display text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Admin Control Center is reserved for authorized platform staff, academic
            coordinators, and system administrators.
          </p>
        </div>
        <div className="p-3 rounded-lg bg-surface-2 border border-border text-xs text-muted-foreground">
          Logged in as: <span className="font-semibold text-foreground">{rbac.role}</span>
        </div>
        <div className="pt-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/app">
              <ArrowLeft className="size-4" />
              <span>Return to Learning Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
              <Server className="size-6 text-primary" />
              Platform Control Center
            </h1>
            <Badge variant="default" className="capitalize text-xs font-semibold">
              {rbac.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational dashboard for student support queues, help documentation editing, and
            community safety.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FeatureGuideTrigger featureId="admin-control" />
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link to="/app">
              <ArrowLeft className="size-3.5" />
              <span>Student View</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border text-xs gap-4 font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === "overview"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Server className="size-3.5" />
          <span>System Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tickets")}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === "tickets"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="size-3.5" />
          <span>Ticket Queue</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("articles")}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === "articles"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-3.5" />
          <span>Help Articles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("moderation")}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === "moderation"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlertTriangle className="size-3.5" />
          <span>Safety & Bugs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === "users"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="size-3.5" />
          <span>Users & Roles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === "audit"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="size-3.5" />
          <span>Audit Trail</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("educator")}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === "educator"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-3.5" />
          <span>Educator Studio (#40)</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && <AdminOverview onNavigateTab={setActiveTab} />}
      {activeTab === "tickets" && <AdminTicketManager />}
      {activeTab === "articles" && <AdminHelpEditor />}
      {activeTab === "moderation" && <AdminModerationManager />}
      {activeTab === "users" && <AdminUserManager />}
      {activeTab === "audit" && <AdminAuditLogViewer />}
      {activeTab === "educator" && <TeacherCollaborationCenter />}
    </div>
  );
}
