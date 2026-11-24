import { QueryClientContext } from "@tanstack/react-query";
import { doc, setDoc } from "firebase/firestore";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileAudio,
  Globe,
  GraduationCap,
  ImageIcon,
  Layers,
  ListTodo,
  Mic,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { AudioTranscriptionWidget } from "@/components/ai/AudioTranscriptionWidget";
import { GroundedSourcesPanel } from "@/components/ai/GroundedSourcesPanel";
import { VisualAidStudio } from "@/components/ai/VisualAidStudio";
import { VoiceConversationDrawer } from "@/components/ai/VoiceConversationDrawer";
import { AiTransparencyPanel } from "@/components/ai/AiTransparencyPanel";
import {
  AiKnowledgeCoachDrawer,
  type AttachedLessonContext,
} from "@/components/ai/AiKnowledgeCoachDrawer";
import { downloadTextFile } from "@/lib/safe-file";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useLocalAiConversations,
  useLocalAiLibrary,
  type AiChatMessage,
  type AiConversationRecord,
} from "@/lib/ai-workspace-store";
import type { GroundedWebSource, ProposedAiAction } from "@/lib/ai.server";
import { db } from "@/lib/firebase";
import {
  isUserEligibleForApp,
  resolveUserSignInProvider,
  waitForAuthReady,
} from "@/lib/firebase-auth";
import {
  clampString,
  generateSafeDocId,
  type StudyItemRow,
  type TaskRow,
} from "@/lib/firestore-data";
import { usePrefs } from "@/lib/preferences";
import { TEACH_ME_STYLES } from "@/data/curriculum-and-challenges";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { BRAND } from "@/config/brand";

interface MessageUiMeta {
  isGrounded?: boolean;
  sources?: GroundedWebSource[];
  searchQueries?: string[];
  proposedActions?: ProposedAiAction[];
  confirmedProposalIndexes?: number[];
}

export function AiWorkspace() {
  const { t, lang, ai, study, ecosystem, buildAiContextSummary } = usePrefs();
  const qc = useContext(QueryClientContext);
  const { conversations, saveConversation, renameConversation, deleteConversation } =
    useLocalAiConversations();
  const {
    tasks: savedAiTasks,
    flashcards: savedAiCards,
    notes: savedAiNotes,
    saveTask: saveLocalAiTask,
    saveFlashcard: saveLocalAiFlashcard,
    removeTask: removeLocalAiTask,
    removeFlashcard: removeLocalAiFlashcard,
    removeNote: removeLocalAiNote,
  } = useLocalAiLibrary();

  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [messageMeta, setMessageMeta] = useState<Record<string, MessageUiMeta>>({});
  const [subject, setSubject] = useState<string>("General");
  const [tutorMode, setTutorMode] = useState<"direct" | "socratic">("direct");
  const [teachingStyleId, setTeachingStyleId] = useState<string>("simple_everyday");
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(
    ecosystem.searchGroundingDefault,
  );
  const { update: updateEcosystem } = useStudentEcosystem();
  const [activeToolDrawer, setActiveToolDrawer] = useState<
    "none" | "voice" | "transcribe" | "image" | "transparency" | "docs"
  >("none");
  const [attachedContext, setAttachedContext] = useState<AttachedLessonContext | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [failedPrompt, setFailedPrompt] = useState<{
    text: string;
    prior: AiChatMessage[];
  } | null>(null);

  // Rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  // Confirmation modal for Task / Flashcard creation
  const [confirmKind, setConfirmKind] = useState<"task" | "flashcard" | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    setUseSearchGrounding(ecosystem.searchGroundingDefault);
  }, [ecosystem.searchGroundingDefault]);

  useEffect(() => {
    let active = true;
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((data: { configured?: boolean }) => {
        if (active) setAiConfigured(Boolean(data.configured));
      })
      .catch(() => {
        if (active) setAiConfigured(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.title.toLowerCase().includes(q) || (c.subject ?? "").toLowerCase().includes(q),
    );
  }, [conversations, search]);

  const selectConversation = (conv: AiConversationRecord) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages ?? []);
    if (conv.subject) setSubject(conv.subject);
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setMessageMeta({});
    setChatError(null);
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const lines = [
      `# ${BRAND.shortName} Study Tutor — ${subject}`,
      "",
      ...messages.map(
        (m) =>
          `### ${m.role === "user" ? "Student" : `${BRAND.shortName} Mentor`}\n\n${m.content}\n`,
      ),
    ];
    downloadTextFile(
      lines.join("\n"),
      `${BRAND.shortName.toLowerCase()}-tutor-${new Date().toISOString().slice(0, 10)}.md`,
      "text/markdown;charset=utf-8",
    );
  };

  const sendMessage = async (textOverride?: string, baseMessages?: AiChatMessage[]) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const prior = baseMessages ?? messages;
    const userMsg: AiChatMessage = {
      id: `u_${Date.now().toString(36)}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    const nextHistory = [...prior, userMsg];
    setMessages(nextHistory);
    setChatError(null);
    setFailedPrompt(null);
    if (!textOverride) setInput("");
    setSending(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30_000);

    try {
      const openTasks = savedAiTasks
        .slice(0, 6)
        .map((tk) => `${tk.title} (${tk.subject})`)
        .join("; ");

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          history: prior.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          modelTier: "balanced",
          useSearchGrounding,
          tutorMode,
          teachingStyle: TEACH_ME_STYLES.find((s) => s.id === teachingStyleId)?.instruction,
          ...(attachedContext ? { lessonContext: attachedContext } : {}),
          prefs: {
            responseLanguage: ai.responseLanguage === "ui" ? lang : ai.responseLanguage,
            responseLength: ai.responseLength,
            tone: ai.tone,
            complexity: study.complexity,
            stepByStep: study.stepByStep,
            examplesFirst: study.examplesFirst,
            clarifyingQuestions: ai.clarifyingQuestions,
          },
          context: {
            profileSummary: ai.shareProfile
              ? "General student study assistant (any subject)"
              : null,
            tasksSummary: ai.shareTasks ? openTasks || "No pending tasks" : null,
            growthSummary: ai.shareGrowth
              ? `${savedAiTasks.length} AI tasks, ${savedAiCards.length} AI flashcards`
              : null,
          },
        }),
      });

      const payload = (await res.json()) as {
        ok?: boolean;
        text?: string;
        isGrounded?: boolean;
        sources?: GroundedWebSource[];
        searchQueries?: string[];
        proposedActions?: ProposedAiAction[];
        code?: string;
        message?: string;
      };

      if (!res.ok || !payload.ok || !payload.text) {
        if (payload.code === "NOT_CONFIGURED") setAiConfigured(false);
        const errMsg =
          payload.message ||
          (res.status === 503
            ? t("ai.notConfigured")
            : "The study mentor service returned an error. Please try again.");
        setChatError(errMsg);
        setFailedPrompt({ text, prior });
        setMessages(prior);
        if (!textOverride) setInput(text);
        toast.error(errMsg);
        return;
      }

      const botId = `a_${Date.now().toString(36)}`;
      const botMsg: AiChatMessage = {
        id: botId,
        role: "assistant",
        content: payload.text,
        created_at: new Date().toISOString(),
      };

      setMessageMeta((prev) => ({
        ...prev,
        [botId]: {
          isGrounded: Boolean(payload.isGrounded),
          sources: payload.sources ?? [],
          searchQueries: payload.searchQueries ?? [],
          proposedActions: payload.proposedActions ?? [],
          confirmedProposalIndexes: [],
        },
      }));

      const updatedMessages = [...nextHistory, botMsg];
      setMessages(updatedMessages);

      if (ai.saveHistory) {
        const saved = await saveConversation({
          ...(activeConvId ? { id: activeConvId } : {}),
          title: text.slice(0, 60),
          subject: "General",
          messages: updatedMessages,
        });
        setActiveConvId(saved.id);
      }
    } catch (err) {
      const timedOut = err instanceof Error && err.name === "AbortError";
      const errMsg = timedOut
        ? "The request timed out after 30 seconds. Check your connection and retry."
        : "Unable to reach the study mentor endpoint. Check your connection and retry.";
      setChatError(errMsg);
      setFailedPrompt({ text, prior });
      setMessages(prior);
      if (!textOverride) setInput(text);
      toast.error(errMsg);
    } finally {
      window.clearTimeout(timeoutId);
      setSending(false);
    }
  };

  const getEligibleUid = async (): Promise<string | null> => {
    try {
      const user = await waitForAuthReady();
      if (!user) return null;
      const provider = await resolveUserSignInProvider(user);
      return isUserEligibleForApp(user, provider) ? user.uid : null;
    } catch {
      return null;
    }
  };

  const syncTaskToFirestore = async (payload: {
    title: string;
    details?: string | null;
    subject?: string | null;
    priority?: "low" | "medium" | "high";
  }): Promise<boolean> => {
    const userId = await getEligibleUid();
    if (!userId) return false;
    const title = clampString(payload.title, 200);
    if (!title) return false;
    const now = new Date().toISOString();
    const id = generateSafeDocId("task");
    const taskDoc: TaskRow = {
      id,
      user_id: userId,
      title,
      details: clampString(payload.details, 2000),
      priority: payload.priority ?? "medium",
      status: "todo",
      area: "academic",
      subject: clampString(payload.subject, 60),
      recurrence: "none",
      subtasks: [],
      due_at: null,
      goal_id: null,
      completed_at: null,
      created_at: now,
    };
    try {
      await setDoc(doc(db, "tasks", id), taskDoc);
      void qc?.invalidateQueries({ queryKey: ["tasks"] });
      return true;
    } catch {
      return false;
    }
  };

  const syncFlashcardToFirestore = async (payload: {
    front: string;
    back: string;
    subject: string;
    difficulty?: "easy" | "medium" | "hard";
  }): Promise<boolean> => {
    const userId = await getEligibleUid();
    if (!userId) return false;
    const title = clampString(payload.front, 160);
    if (!title) return false;
    const now = new Date().toISOString();
    const id = generateSafeDocId("study");
    const cardDoc: StudyItemRow = {
      id,
      user_id: userId,
      kind: "flashcard",
      subject: clampString(payload.subject, 60) ?? "General",
      deck: "AI Tutor",
      title,
      content: clampString(payload.front, 4000) ?? title,
      answer: clampString(payload.back, 2000),
      difficulty: payload.difficulty ?? "medium",
      mistake_reason: null,
      mistake_status: "open",
      review_count: 0,
      next_review_at: now,
      created_at: now,
      updated_at: now,
    };
    try {
      await setDoc(doc(db, "study_items", id), cardDoc);
      void qc?.invalidateQueries({ queryKey: ["study_items"] });
      return true;
    } catch {
      return false;
    }
  };

  const handleConfirmProposal = async (
    msgId: string,
    proposalIdx: number,
    proposal: ProposedAiAction,
  ) => {
    try {
      if (proposal.kind === "task") {
        saveLocalAiTask({
          title: proposal.title,
          details: proposal.details || null,
          subject: proposal.subject || subject,
          priority: proposal.priority,
        });
        await syncTaskToFirestore({
          title: proposal.title,
          details: proposal.details || null,
          subject: proposal.subject || subject,
          priority: proposal.priority,
        });
        toast.success(t("dash.tasks.toastAdd"));
      } else if (proposal.kind === "flashcard") {
        saveLocalAiFlashcard({
          front: proposal.front,
          back: proposal.back,
          subject: proposal.subject || subject,
          difficulty: proposal.difficulty,
        });
        await syncFlashcardToFirestore({
          front: proposal.front,
          back: proposal.back,
          subject: proposal.subject || subject,
          difficulty: proposal.difficulty,
        });
        toast.success(t("study.toCard"));
      } else if (proposal.kind === "revision_plan") {
        for (const step of proposal.steps) {
          saveLocalAiTask({
            title: step.title,
            details: step.details || proposal.summary,
            subject: proposal.subject || subject,
            priority: step.priority,
          });
          await syncTaskToFirestore({
            title: step.title,
            details: step.details || proposal.summary,
            subject: proposal.subject || subject,
            priority: step.priority,
          });
        }
        toast.success(`${proposal.steps.length} revision tasks added.`);
      }

      setMessageMeta((prev) => {
        const cur = prev[msgId] ?? {};
        const done = new Set(cur.confirmedProposalIndexes ?? []);
        done.add(proposalIdx);
        return {
          ...prev,
          [msgId]: { ...cur, confirmedProposalIndexes: Array.from(done) },
        };
      });
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  const handleCopyMessage = async (msgId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId((cur) => (cur === msgId ? null : cur)), 1800);
    } catch {
      toast.error("Copy unavailable");
    }
  };

  const handleRetryFromAssistant = (assistantIdx: number) => {
    const priorMessages = messages.slice(0, assistantIdx);
    const lastUserIdx = [...priorMessages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx < 0) return;
    const realUserIdx = priorMessages.length - 1 - lastUserIdx;
    const userPrompt = priorMessages[realUserIdx]?.content;
    if (!userPrompt) return;
    void sendMessage(userPrompt, priorMessages.slice(0, realUserIdx));
  };

  const openConfirmCreate = (kind: "task" | "flashcard", sourceText: string) => {
    const firstLine =
      sourceText
        .split("\n")[0]
        ?.replace(/^#+\s*/, "")
        .slice(0, 100) || "";
    setDraftTitle(firstLine);
    setDraftBody(sourceText.slice(0, 1500));
    setConfirmKind(kind);
  };

  const handleConfirmCreate = async () => {
    if (!draftTitle.trim() || !confirmKind) return;
    setSavingAction(true);
    try {
      if (confirmKind === "task") {
        const title = draftTitle.trim();
        const details = draftBody.trim() || null;
        saveLocalAiTask({
          title,
          details,
          subject,
          priority: "medium",
        });
        await syncTaskToFirestore({
          title,
          details,
          subject,
          priority: "medium",
        });
        toast.success(t("dash.tasks.toastAdd"));
      } else {
        const front = draftTitle.trim();
        const back = draftBody.trim();
        saveLocalAiFlashcard({
          front,
          back,
          subject,
          difficulty: "medium",
        });
        await syncFlashcardToFirestore({
          front,
          back,
          subject,
          difficulty: "medium",
        });
        toast.success(t("study.toCard"));
      }
      setConfirmKind(null);
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setSavingAction(false);
    }
  };

  const quickPrompts = [
    t("ai.quick.plan"),
    t("ai.quick.explain"),
    t("ai.quick.cards"),
    t("ai.quick.quiz"),
    t("ai.tpl.feynman"),
    t("ai.tpl.cram"),
  ];

  return (
    <div className="space-y-5 pb-12">
      <PageHeader
        title={t("ai.title")}
        subtitle={t("ai.sub")}
        actions={
          <FeatureGuideTrigger
            featureId={
              activeToolDrawer === "voice"
                ? "ai-voice-drawer"
                : activeToolDrawer === "transcribe"
                  ? "ai-audio-transcribe"
                  : activeToolDrawer === "image"
                    ? "ai-visual-aid"
                    : activeToolDrawer === "transparency"
                      ? "ai-transparency"
                      : "ai-tutor"
            }
          />
        }
      />

      {/* Explicit Privacy Shield & Scope Preview */}
      <div className="surface-card space-y-2 border-primary/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <ShieldCheck className="size-4 shrink-0" />
            <span>{t("ai.privacyBanner")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!ai.saveHistory && (
              <span className="border-s-2 border-border ps-2 text-[0.7rem] text-muted-foreground">
                {t("ai.historyOff")}
              </span>
            )}
            <Button
              type="button"
              size="sm"
              variant={activeToolDrawer === "voice" ? "glow" : "outline"}
              onClick={() => setActiveToolDrawer((d) => (d === "voice" ? "none" : "voice"))}
              className="h-7 text-xs"
            >
              <Mic className="size-3.5" />
              <span>{t("p5.voice.title")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeToolDrawer === "transcribe" ? "glow" : "outline"}
              onClick={() =>
                setActiveToolDrawer((d) => (d === "transcribe" ? "none" : "transcribe"))
              }
              className="h-7 text-xs"
            >
              <FileAudio className="size-3.5" />
              <span>{t("p5.transcribe.title")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeToolDrawer === "image" ? "glow" : "outline"}
              onClick={() => setActiveToolDrawer((d) => (d === "image" ? "none" : "image"))}
              className="h-7 text-xs"
            >
              <ImageIcon className="size-3.5" />
              <span>{t("p5.image.title")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeToolDrawer === "docs" ? "glow" : "outline"}
              onClick={() => setActiveToolDrawer((d) => (d === "docs" ? "none" : "docs"))}
              className="h-7 text-xs"
            >
              <BookMarked className="size-3.5" />
              <span>{lang === "ar" ? "الملفات والمدرب الذكي" : "Docs, Knowledge & Coach"}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeToolDrawer === "transparency" ? "glow" : "outline"}
              onClick={() =>
                setActiveToolDrawer((d) => (d === "transparency" ? "none" : "transparency"))
              }
              className="h-7 text-xs"
            >
              <ShieldCheck className="size-3.5" />
              <span>Model & Transparency (#50)</span>
            </Button>
          </div>
        </div>
        <div className="text-[0.72rem] text-muted-foreground">
          <strong className="text-foreground">{t("ai.contextLabel")}:</strong>{" "}
          {buildAiContextSummary()}
          {attachedContext ? ` · Attached Document: "${attachedContext.title}"` : ""}
        </div>
      </div>

      {/* Expandable Unified AI Tools inside AI Workspace */}
      {activeToolDrawer === "docs" && (
        <AiKnowledgeCoachDrawer
          subject={subject}
          attachedContext={attachedContext}
          onAttachContext={(ctx) => setAttachedContext(ctx)}
          onClearContext={() => setAttachedContext(null)}
          onSendPromptWithContext={(promptText) => void sendMessage(promptText)}
          savedAiTasksCount={savedAiTasks.length}
          savedAiCardsCount={savedAiCards.length}
        />
      )}
      {activeToolDrawer === "voice" && (
        <VoiceConversationDrawer contextSummary={buildAiContextSummary()} />
      )}
      {activeToolDrawer === "transcribe" && (
        <AppErrorBoundary
          fallbackTitle="Audio transcription encountered a problem"
          fallbackDesc="Microphone or audio file decoding failed safely. Your chat conversation is intact."
        >
          <AudioTranscriptionWidget
            subject={subject}
            onInsertTranscript={(text) => {
              setInput((prev) => (prev ? `${prev}\n${text}` : text));
              toast.success("Transcript inserted into chat composer.");
            }}
          />
        </AppErrorBoundary>
      )}
      {activeToolDrawer === "image" && (
        <AppErrorBoundary
          fallbackTitle="Visual Aid Studio encountered a problem"
          fallbackDesc="Image upload or generation reset safely. Your chat conversation is intact."
        >
          <VisualAidStudio defaultPrompt="Educational concept diagram" />
        </AppErrorBoundary>
      )}
      {activeToolDrawer === "transparency" && <AiTransparencyPanel />}

      {/* Honest Server Key Status Banner */}
      {aiConfigured === false && (
        <div className="surface-card flex items-start gap-3 border-xp/40 bg-xp/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-xp" />
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-foreground">{t("ai.notConfigured")}</p>
            <p className="text-muted-foreground">{t("ai.notConfiguredHint")}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Saved Conversations Sidebar */}
        <aside className="surface-card flex flex-col gap-3 p-4 lg:col-span-1">
          <Button type="button" variant="glow" size="sm" onClick={handleNewChat} className="w-full">
            <Plus className="size-3.5" />
            <span>{t("ai.newChat")}</span>
          </Button>

          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("ai.searchChats")}
              className="h-8 ps-8 text-xs"
            />
          </div>

          <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("ai.savedChats")}
          </div>

          <div className="max-h-96 space-y-1.5 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">{t("ai.noChats")}</p>
            ) : (
              filteredConversations.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between gap-1 rounded-lg border px-2.5 py-2 text-xs ${
                    activeConvId === c.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {renamingId === c.id ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (renameDraft.trim()) {
                          await renameConversation(c.id, renameDraft.trim());
                          toast.success(t("common.save"));
                        }
                        setRenamingId(null);
                      }}
                      className="flex flex-1 items-center gap-1"
                    >
                      <Input
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        className="h-6 text-xs"
                        autoFocus
                      />
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => selectConversation(c)}
                      className="min-w-0 flex-1 truncate text-start font-medium"
                    >
                      {c.title}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setRenamingId(c.id);
                      setRenameDraft(c.title);
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground"
                    aria-label={t("ai.rename")}
                  >
                    <Pencil className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteConversation(c.id);
                      if (activeConvId === c.id) handleNewChat();
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {(savedAiTasks.length > 0 || savedAiCards.length > 0 || savedAiNotes.length > 0) && (
            <div className="space-y-1.5 border-t border-border/80 pt-3">
              <div className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Saved Study Items ({savedAiTasks.length + savedAiCards.length + savedAiNotes.length}
                )
              </div>
              <div className="max-h-36 space-y-1 overflow-y-auto text-[0.72rem]">
                {savedAiTasks.slice(0, 4).map((tk) => (
                  <div
                    key={tk.id}
                    className="flex items-center justify-between gap-1 rounded border border-border bg-surface-2 px-2 py-1"
                  >
                    <span className="truncate text-foreground">Task: {tk.title}</span>
                    <button
                      type="button"
                      onClick={() => removeLocalAiTask(tk.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete saved AI task"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
                {savedAiCards.slice(0, 4).map((fc) => (
                  <div
                    key={fc.id}
                    className="flex items-center justify-between gap-1 rounded border border-border bg-surface-2 px-2 py-1"
                  >
                    <span className="truncate text-foreground">Card: {fc.front}</span>
                    <button
                      type="button"
                      onClick={() => removeLocalAiFlashcard(fc.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete saved AI flashcard"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
                {savedAiNotes.slice(0, 4).map((nt) => (
                  <div
                    key={nt.id}
                    className="flex items-center justify-between gap-1 rounded border border-border bg-surface-2 px-2 py-1"
                  >
                    <span className="truncate text-foreground">Note: {nt.title}</span>
                    <button
                      type="button"
                      onClick={() => removeLocalAiNote(nt.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete saved AI note"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Chat Panel */}
        <section className="surface-card flex min-h-[28rem] flex-col justify-between p-4 lg:col-span-3">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Bot className="size-4 text-primary" />
                <span className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground">
                  {lang === "ar"
                    ? "مساعد عام لكل المواد (عربي / English)"
                    : "General Assistant — Any Subject"}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant={tutorMode === "socratic" ? "glow" : "outline"}
                  onClick={() => setTutorMode((m) => (m === "socratic" ? "direct" : "socratic"))}
                  className="h-8 text-xs"
                  title="Socratic Coach guides you with probing questions instead of handing over full answers"
                >
                  <GraduationCap className="size-3.5" />
                  <span>{tutorMode === "socratic" ? "Socratic Coach" : "Direct Tutor"}</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={useSearchGrounding ? "glow" : "outline"}
                  onClick={() => setUseSearchGrounding((g) => !g)}
                  className="h-8 text-xs"
                >
                  <Globe className="size-3.5" />
                  <span>{t("p5.search.toggle")}</span>
                </Button>
                {messages.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleExportChat}
                    className="h-8 text-xs"
                  >
                    <Download className="size-3.5" />
                    <span>{t("ai.exportChat")}</span>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp}
                    type="button"
                    onClick={() => setInput(qp)}
                    className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[0.7rem] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    {qp}
                  </button>
                ))}
              </div>

              {/* #7 TEACH ME DIFFERENTLY (8 Pedagogical Styles) */}
              <div className="rounded-lg border border-border bg-surface-2 p-2.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[0.7rem]">
                  <span className="font-semibold text-foreground">
                    Teach Me Differently (8 Styles):
                  </span>
                  <span className="text-muted-foreground">
                    Switch mid-topic without restarting · Ends with 1 understanding check
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TEACH_ME_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        setTeachingStyleId(style.id);
                        const lastUser = [...messages].reverse().find((m) => m.role === "user");
                        if (lastUser) {
                          void sendMessage(
                            `Explain this using "${style.label}": ${lastUser.content.slice(0, 120)}`,
                          );
                        }
                      }}
                      className={`rounded-md border px-2 py-1 text-[0.68rem] font-medium transition-colors ${
                        teachingStyleId === style.id
                          ? "border-primary bg-primary/15 text-primary font-semibold"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* #8 SOCRATIC STEP PROGRESSION & ESCAPE HATCH */}
              {tutorMode === "socratic" && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
                  <span className="font-medium text-foreground">
                    Socratic Coach Active: 1 guiding question at a time. Never stuck!
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void sendMessage("Give me 1 focused hint (not the full answer yet).")
                      }
                      className="h-7 text-[0.7rem]"
                    >
                      Give 1 Hint
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void sendMessage("Ask me the next guiding step question.")}
                      className="h-7 text-[0.7rem]"
                    >
                      Next Guiding Question
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="glow"
                      onClick={() =>
                        void sendMessage(
                          "Reveal Clear Explanation: please show the direct clear explanation and worked answer now.",
                        )
                      }
                      className="h-7 text-[0.7rem]"
                    >
                      Reveal Clear Explanation
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="max-h-96 space-y-3 overflow-y-auto pe-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="mb-2 size-8 text-primary/50" />
                  <p className="max-w-md text-sm text-muted-foreground">{t("ai.sub")}</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const meta = messageMeta[m.id];
                  const proposals = meta?.proposedActions ?? [];
                  const confirmedSet = new Set(meta?.confirmedProposalIndexes ?? []);

                  return (
                    <div
                      key={m.id}
                      className={`rounded-xl border p-3.5 text-sm ${
                        m.role === "user"
                          ? "ms-auto max-w-2xl border-primary/30 bg-primary/10 text-foreground"
                          : "me-auto max-w-2xl border-border bg-surface-2 text-foreground"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>{m.role === "user" ? t("dash.studentName") : t("mod.ai.name")}</span>
                      </div>
                      <div className="whitespace-pre-wrap text-xs leading-relaxed">{m.content}</div>

                      {m.role === "assistant" && meta && (
                        <GroundedSourcesPanel
                          mode={meta.isGrounded ? "search" : "ungrounded"}
                          webSources={meta.sources ?? []}
                          searchQueries={meta.searchQueries ?? []}
                        />
                      )}

                      {m.role === "assistant" && proposals.length > 0 && (
                        <div className="mt-3 space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                          <div className="text-[0.68rem] font-bold uppercase tracking-wider text-primary">
                            {t("p5.action.proposed")}
                          </div>
                          {proposals.map((prop, pIdx) => {
                            const isDone = confirmedSet.has(pIdx);
                            return (
                              <div
                                key={`${m.id}_prop_${pIdx}`}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface p-2 text-xs"
                              >
                                <div className="min-w-0 flex-1">
                                  {prop.kind === "task" && (
                                    <div>
                                      <span className="font-semibold text-foreground">
                                        {prop.title}
                                      </span>
                                      <span className="ms-2 text-[0.68rem] text-muted-foreground">
                                        [{prop.subject} · {prop.priority}]
                                      </span>
                                    </div>
                                  )}
                                  {prop.kind === "flashcard" && (
                                    <div>
                                      <span className="font-semibold text-foreground">
                                        {prop.front}
                                      </span>
                                      <span className="ms-2 text-[0.68rem] text-muted-foreground">
                                        → {prop.back.slice(0, 80)}
                                      </span>
                                    </div>
                                  )}
                                  {prop.kind === "revision_plan" && (
                                    <div>
                                      <span className="font-semibold text-foreground">
                                        {prop.summary}
                                      </span>
                                      <span className="ms-2 text-[0.68rem] text-muted-foreground">
                                        ({prop.steps.length} steps)
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={isDone ? "outline" : "glow"}
                                  disabled={isDone}
                                  onClick={() => handleConfirmProposal(m.id, pIdx, prop)}
                                  className="h-7 text-[0.7rem]"
                                >
                                  <CheckCircle2 className="size-3" />
                                  <span>
                                    {isDone
                                      ? "Saved"
                                      : prop.kind === "task"
                                        ? t("p5.action.confirmAddTask")
                                        : prop.kind === "flashcard"
                                          ? t("p5.action.confirmAddCard")
                                          : t("p5.action.confirmAddPlan")}
                                  </span>
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {m.role === "assistant" && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-[0.7rem]"
                            onClick={() => handleCopyMessage(m.id, m.content)}
                          >
                            {copiedId === m.id ? (
                              <Check className="size-3 text-success" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                            <span>{copiedId === m.id ? "Copied" : "Copy"}</span>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-[0.7rem]"
                            disabled={sending}
                            onClick={() => handleRetryFromAssistant(idx)}
                          >
                            <RefreshCw className="size-3" />
                            <span>Retry</span>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-[0.7rem]"
                            onClick={() => openConfirmCreate("task", m.content)}
                          >
                            <ListTodo className="size-3" />
                            <span>{t("ai.act.toTask")}</span>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-[0.7rem]"
                            onClick={() => openConfirmCreate("flashcard", m.content)}
                          >
                            <Layers className="size-3" />
                            <span>{t("ai.act.toFlashcard")}</span>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-[0.7rem]"
                            onClick={() => {
                              updateEcosystem((prev) => ({
                                ...prev,
                                knowledgeLibrary: [
                                  {
                                    id: `ailib_${Date.now().toString(36)}`,
                                    title:
                                      m.content
                                        .split("\n")[0]
                                        ?.replace(/^#+\s*/, "")
                                        .slice(0, 80) || `${subject} AI Tutor Note`,
                                    subject,
                                    sourceType: "tutor_note",
                                    content: m.content,
                                    tags: [subject.toLowerCase(), tutorMode],
                                    pinnedOffline: true,
                                    createdAt: new Date().toISOString(),
                                  },
                                  ...prev.knowledgeLibrary,
                                ],
                              }));
                              toast.success("Saved AI insight to Personal Knowledge Library!");
                            }}
                          >
                            <BookMarked className="size-3" />
                            <span>Save to Library</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {chatError && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs text-foreground"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <span>{chatError}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {failedPrompt && (
                    <button
                      type="button"
                      disabled={sending}
                      onClick={() => void sendMessage(failedPrompt.text, failedPrompt.prior)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-[0.7rem] font-semibold text-foreground hover:border-primary/40"
                    >
                      <RefreshCw className="size-3" />
                      <span>{lang === "ar" ? "إعادة المحاولة" : "Retry"}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setChatError(null);
                      setFailedPrompt(null);
                    }}
                    className="text-[0.7rem] font-semibold text-muted-foreground hover:text-foreground"
                  >
                    {lang === "ar" ? "إغلاق" : "Dismiss"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="mt-4 flex gap-2 border-t border-border/80 pt-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("ai.promptPh")}
              disabled={sending}
            />
            <Button type="submit" variant="glow" disabled={sending || !input.trim()}>
              <Send className="size-4" />
              <span>{sending ? t("ai.thinking") : t("ai.send")}</span>
            </Button>
          </form>
        </section>
      </div>

      {/* Explicit Confirmation Dialog before modifying student items */}
      <Dialog open={confirmKind !== null} onOpenChange={(o) => !o && setConfirmKind(null)}>
        <DialogContent className="surface-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{t("ai.act.confirmTitle")}</DialogTitle>
            <DialogDescription>{t("ai.act.confirmDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="ai-confirm-title" className="text-xs">
                {t("dash.tasks.fieldTitle")}
              </Label>
              <Input
                id="ai-confirm-title"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ai-confirm-body" className="text-xs">
                {confirmKind === "task" ? t("study.noteBody") : t("study.cardBack")}
              </Label>
              <Textarea
                id="ai-confirm-body"
                rows={4}
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmKind(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="glow"
              disabled={savingAction || !draftTitle.trim()}
              onClick={handleConfirmCreate}
            >
              <CheckCircle2 className="size-4" />
              <span>{t("ai.act.confirmBtn")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
