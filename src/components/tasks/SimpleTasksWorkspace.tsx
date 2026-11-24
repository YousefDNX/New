import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { usePrefs } from "@/lib/preferences";
import { useTasks, useTaskActions, type TaskRow } from "@/hooks/use-nexora";
import { useUser } from "@/hooks/use-nexora";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const GUEST_TASKS_KEY = "btc_guest_simple_tasks_v1";

interface SimpleTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

export function SimpleTasksWorkspace() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { data: user } = useUser();
  const { data: remoteTasks = [] } = useTasks();
  const {
    addTask: addRemoteTask,
    completeTask: toggleRemoteTask,
    deleteTask: deleteRemoteTask,
  } = useTaskActions();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [guestTasks, setGuestTasks] = useState<SimpleTask[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(GUEST_TASKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [busy, setBusy] = useState(false);

  // Sync guest tasks to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(guestTasks));
    } catch (e) {
      console.warn("Could not save tasks to local storage:", e);
    }
  }, [guestTasks]);

  // Combine tasks: if logged in user has remote tasks, merge or prefer remote
  const isGuest = !user || user.isAnonymous;

  // Normalised task list
  const allTasks: SimpleTask[] = isGuest
    ? guestTasks
    : remoteTasks.map((rt) => ({
        id: rt.id,
        title: rt.title,
        description: rt.details || undefined,
        completed: rt.status === "done",
        createdAt: rt.created_at,
      }));

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setBusy(true);
    const newTask: SimpleTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: cleanTitle,
      description: description.trim() || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    try {
      if (isGuest) {
        setGuestTasks((prev) => [newTask, ...prev]);
      } else {
        await addRemoteTask({
          title: cleanTitle,
          details: description.trim() || null,
          priority: "medium",
          area: "productivity",
          recurrence: "none",
          due_at: null,
          goal_id: null,
        });
      }
      setTitle("");
      setDescription("");
      toast.success(isAr ? "تمت إضافة المهمة بنجاح" : "Task added successfully");
    } catch (err) {
      console.warn("Failed to save remote task, falling back to local:", err);
      setGuestTasks((prev) => [newTask, ...prev]);
      setTitle("");
      setDescription("");
      toast.success(isAr ? "تمت إضافة المهمة محلياً" : "Task added locally");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleTask = async (task: SimpleTask) => {
    const nextCompleted = !task.completed;
    if (isGuest) {
      setGuestTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t)),
      );
      if (nextCompleted) {
        toast.success(isAr ? "تم إكمال المهمة" : "Task marked as completed");
      } else {
        toast.info(isAr ? "تمت إعادة فتح المهمة" : "Task reopened");
      }
    } else {
      const match = remoteTasks.find((rt) => rt.id === task.id);
      if (match) {
        try {
          await toggleRemoteTask(match, 0);
          if (nextCompleted) {
            toast.success(isAr ? "تم إكمال المهمة" : "Task marked as completed");
          } else {
            toast.info(isAr ? "تمت إعادة فتح المهمة" : "Task reopened");
          }
        } catch {
          // fallback to local toggle
          setGuestTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t)),
          );
        }
      } else {
        setGuestTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t)),
        );
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (isGuest) {
      setGuestTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.info(isAr ? "تم حذف المهمة" : "Task deleted");
    } else {
      try {
        await deleteRemoteTask(taskId);
        toast.info(isAr ? "تم حذف المهمة" : "Task deleted");
      } catch {
        setGuestTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast.info(isAr ? "تم حذف المهمة" : "Task deleted");
      }
    }
  };

  const filteredTasks = allTasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = allTasks.filter((t) => !t.completed).length;
  const completedCount = allTasks.filter((t) => t.completed).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CheckSquare className="size-7 text-primary shrink-0" />
            <span>{isAr ? "مهامي" : "My Tasks"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "قائمة مهام بسيطة وسهلة لمتابعة واجباتك وأعمالك اليومية."
              : "A simple task list to track your daily schoolwork and studies."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
            {isAr ? `${activeCount} قيد الإنجاز` : `${activeCount} pending`}
          </span>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-600 dark:text-emerald-400">
            {isAr ? `${completedCount} مكتملة` : `${completedCount} completed`}
          </span>
        </div>
      </div>

      {/* Add Task Form */}
      <section className="surface-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-foreground">
          {isAr ? "إضافة مهمة جديدة" : "Add a New Task"}
        </h2>
        <form onSubmit={handleAddTask} className="space-y-3">
          <div>
            <label htmlFor="task-title-input" className="sr-only">
              {isAr ? "عنوان المهمة" : "Task Title"}
            </label>
            <Input
              id="task-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isAr
                  ? "ما الذي تريد إنجازه اليوم؟ (مطلوب)"
                  : "What do you want to accomplish? (Required)"
              }
              required
              className="text-base"
              disabled={busy}
            />
          </div>
          <div>
            <label htmlFor="task-desc-input" className="sr-only">
              {isAr ? "وصف المهمة" : "Task Description"}
            </label>
            <Textarea
              id="task-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isAr
                  ? "وصف إضافي أو تفاصيل المهمة (اختياري)..."
                  : "Additional details or notes (Optional)..."
              }
              rows={2}
              className="resize-none text-sm"
              disabled={busy}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!title.trim() || busy}
              className="gap-2 font-bold cursor-pointer"
            >
              <Plus className="size-4" />
              <span>{isAr ? "إضافة المهمة" : "Add Task"}</span>
            </Button>
          </div>
        </form>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/60 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`flex-1 rounded-md py-1.5 transition-colors cursor-pointer ${
            filter === "all"
              ? "bg-background text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {isAr ? `الكل (${allTasks.length})` : `All (${allTasks.length})`}
        </button>
        <button
          type="button"
          onClick={() => setFilter("active")}
          className={`flex-1 rounded-md py-1.5 transition-colors cursor-pointer ${
            filter === "active"
              ? "bg-background text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {isAr ? `قيد الإنجاز (${activeCount})` : `Pending (${activeCount})`}
        </button>
        <button
          type="button"
          onClick={() => setFilter("completed")}
          className={`flex-1 rounded-md py-1.5 transition-colors cursor-pointer ${
            filter === "completed"
              ? "bg-background text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {isAr ? `المكتملة (${completedCount})` : `Completed (${completedCount})`}
        </button>
      </div>

      {/* Task List */}
      <section className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="surface-card flex flex-col items-center justify-center p-12 text-center space-y-2">
            <CheckCircle2 className="size-10 text-muted-foreground/30" />
            <p className="text-sm font-semibold text-foreground">
              {filter === "completed"
                ? isAr
                  ? "لا توجد مهام مكتملة بعد"
                  : "No completed tasks yet"
                : isAr
                  ? "قائمة المهام فارغة"
                  : "No tasks found"}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {isAr
                ? "أضف مهمتك الأولى باستخدام المربع أعلاه لتنظيم واجباتك ودراستك."
                : "Add your first task above to keep your daily schoolwork organised."}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`group surface-card flex items-start justify-between gap-3 p-4 transition-all ${
                task.completed
                  ? "bg-surface-2/40 opacity-75 border-border/40"
                  : "hover:border-primary/40"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleTask(task)}
                  className="mt-0.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                  aria-label={
                    task.completed
                      ? isAr
                        ? "إعادة فتح المهمة"
                        : "Reopen task"
                      : isAr
                        ? "إكمال المهمة"
                        : "Complete task"
                  }
                >
                  {task.completed ? (
                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Circle className="size-5 hover:text-primary" />
                  )}
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className={`text-sm font-medium leading-snug break-words ${
                      task.completed
                        ? "line-through text-muted-foreground font-normal"
                        : "text-foreground font-semibold"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p
                      className={`text-xs leading-relaxed whitespace-pre-wrap break-words ${
                        task.completed
                          ? "line-through text-muted-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {task.completed && (
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task)}
                    className="p-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer rounded-md hover:bg-surface-2"
                    title={isAr ? "إعادة فتح المهمة" : "Reopen task"}
                  >
                    <RotateCcw className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer rounded-md hover:bg-destructive/10"
                  title={isAr ? "حذف المهمة" : "Delete task"}
                  aria-label={isAr ? `حذف ${task.title}` : `Delete ${task.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
