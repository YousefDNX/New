import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Compass,
  Gem,
  KeyRound,
  RotateCcw,
  ScrollText,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ADVENTURE_REGIONS, type AdventureInteractiveObject } from "@/data/adventure-world";
import {
  completeAdventureQuest,
  createInitialAdventureState,
  getNearbyObjects,
  getRegionById,
  interactAdventureTile,
  isObjectUnlocked,
  stepAdventureMove,
  travelToRegion,
} from "@/lib/adventure-engine";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

export function AdventureWorldGame() {
  const { state, update } = useStudentEcosystem();
  const adventure = state.adventure;

  const region = useMemo(() => getRegionById(adventure.activeRegion), [adventure.activeRegion]);
  const nearbyObjects = useMemo(() => getNearbyObjects(adventure), [adventure]);

  const [activeQuest, setActiveQuest] = useState<NonNullable<
    AdventureInteractiveObject["quest"]
  > | null>(null);
  const [questFeedback, setQuestFeedback] = useState<string | null>(null);

  const handleMove = useCallback(
    (dx: number, dy: number) => {
      update((prev) => {
        const res = stepAdventureMove(prev.adventure, dx, dy);
        return res.moved ? { ...prev, adventure: res.nextState } : prev;
      });
    },
    [update],
  );

  const handleInteract = useCallback(() => {
    const outcome = interactAdventureTile(adventure);
    if (outcome.kind === "quest") {
      setQuestFeedback(null);
      setActiveQuest(outcome.quest);
      return;
    }
    update((prev) => ({
      ...prev,
      adventure: outcome.nextState,
    }));
    if (outcome.kind === "relic") {
      toast.success(`Claimed Relic: ${outcome.relicName}!`);
    }
  }, [adventure, update]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (activeQuest) return;

      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        handleMove(0, -1);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleMove(0, 1);
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleMove(-1, 0);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleMove(1, 0);
      } else if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        handleInteract();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeQuest, handleMove, handleInteract]);

  const answerQuestOption = (optIdx: number) => {
    if (!activeQuest) return;
    if (optIdx === activeQuest.correctIndex) {
      update((prev) => ({
        ...prev,
        adventure: completeAdventureQuest(prev.adventure, activeQuest.id, activeQuest.rewardNote),
      }));
      toast.success(activeQuest.rewardNote);
      setActiveQuest(null);
      setQuestFeedback(null);
    } else {
      setQuestFeedback("Not quite! Re-read the challenge clues carefully and try another option.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Region Teleport Bar */}
      <div className="surface-card space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="size-4" />
              <span>BTC Adventure World · Citadel of Change</span>
            </div>
            <h2 className="mt-1 font-display text-lg font-bold text-foreground">
              {region.name} · {region.nameAr}
            </h2>
            <p className="text-xs text-muted-foreground">{region.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <FeatureGuideTrigger featureId="adventure-world" />
            <span className="inline-flex items-center gap-1 rounded-lg border border-xp/40 bg-xp/10 px-3 py-1.5 font-mono font-bold text-xp">
              <Gem className="size-3.5" />
              <span>Relics: {adventure.collectedRelics.length}/4</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-3 py-1.5 font-mono font-semibold text-foreground">
              <ScrollText className="size-3.5 text-primary" />
              <span>Lore: {adventure.discoveredLore.length}/4</span>
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                update((prev) => ({ ...prev, adventure: createInitialAdventureState() }));
                toast.info("Adventure World reset to Courtyard starting plaza.");
              }}
            >
              <RotateCcw className="size-3.5" />
              <span>Reset World</span>
            </Button>
          </div>
        </div>

        {/* Region Navigator */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ADVENTURE_REGIONS.map((reg) => {
            const unlocked = adventure.unlockedRegions.includes(reg.id);
            const active = adventure.activeRegion === reg.id;
            return (
              <button
                key={reg.id}
                type="button"
                disabled={!unlocked}
                onClick={() =>
                  update((prev) => ({
                    ...prev,
                    adventure: travelToRegion(prev.adventure, reg.id),
                  }))
                }
                className={`rounded-xl border p-3 text-start text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : unlocked
                      ? "border-border bg-surface-2 hover:border-primary/40 text-foreground"
                      : "border-border/50 bg-surface-2/40 text-muted-foreground opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{reg.name}</span>
                  <span>{unlocked ? "Open" : "Sealed"}</span>
                </div>
                <div className="mt-0.5 text-[0.65rem] text-muted-foreground">
                  {reg.unlockRequirementDesc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Playable Grid + Controls & Telemetry */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="surface-card flex flex-col items-center justify-center space-y-4 p-5 lg:col-span-2">
          <div
            className="grid gap-1 rounded-2xl border border-border bg-background p-3 shadow-inner"
            style={{ gridTemplateColumns: `repeat(${region.width}, minmax(0, 1fr))` }}
            role="grid"
            aria-label={`${region.name} Exploration Map`}
          >
            {region.grid.map((rowStr, y) =>
              rowStr.split("").map((cell, x) => {
                const isPlayer = adventure.playerX === x && adventure.playerY === y;
                const obj = region.objects.find((o) => o.x === x && o.y === y);
                const isWall = cell === "#";

                let cellStyle = isWall
                  ? "bg-muted/80 border-border/40 text-muted-foreground/30"
                  : "bg-surface-2 border-border/50 text-foreground";
                let symbol = isWall ? "▪" : "";

                if (obj) {
                  if (obj.kind === "switch") {
                    const active = adventure.activatedSwitches.includes(obj.id);
                    symbol = active ? "⚡" : "◎";
                    cellStyle = active
                      ? "bg-success/25 border-success text-success"
                      : "bg-xp/20 border-xp/60 text-xp";
                  } else if (obj.kind === "relic") {
                    const owned = adventure.collectedRelics.includes(obj.id);
                    const unlocked = isObjectUnlocked(obj, adventure);
                    symbol = owned ? "✓" : unlocked ? "◆" : "◈";
                    cellStyle = owned
                      ? "bg-success/15 border-success/40 text-success"
                      : unlocked
                        ? "bg-xp/30 border-xp text-xp animate-pulse"
                        : "bg-surface border-border text-muted-foreground";
                  } else if (obj.kind === "npc") {
                    symbol = "★";
                    cellStyle = "bg-primary/20 border-primary/50 text-primary";
                  } else if (obj.kind === "lore") {
                    symbol = "📜";
                    cellStyle = "bg-secondary border-primary/40 text-foreground";
                  } else if (obj.kind === "portal") {
                    const unlocked = isObjectUnlocked(obj, adventure);
                    symbol = unlocked ? "🌀" : "🔒";
                    cellStyle = unlocked
                      ? "bg-primary/25 border-primary text-primary"
                      : "bg-destructive/15 border-destructive/40 text-destructive";
                  }
                }

                if (isPlayer) {
                  symbol = "🧭";
                  cellStyle =
                    "bg-primary text-primary-foreground border-primary shadow-sm scale-105";
                }

                return (
                  <div
                    key={`${x}_${y}`}
                    title={
                      obj ? obj.label : isPlayer ? "Your Explorer" : isWall ? "Stone Wall" : "Path"
                    }
                    className={`flex size-8 sm:size-10 items-center justify-center rounded-md border text-xs sm:text-sm font-bold transition-all ${cellStyle}`}
                  >
                    {symbol}
                  </div>
                );
              }),
            )}
          </div>

          <div className="w-full rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
            <span className="font-bold text-primary">World Log: </span>
            {adventure.lastEventMessage}
          </div>
        </div>

        {/* Accessible D-Pad, Interact Action & Quest Log */}
        <div className="surface-card flex flex-col justify-between space-y-4 p-5 text-xs">
          <div className="space-y-3">
            <div className="font-display text-sm font-bold text-foreground">
              Controls (Arrow Keys / WASD / Tap)
            </div>
            <div className="mx-auto grid w-40 grid-cols-3 gap-1.5">
              <div />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleMove(0, -1)}
                aria-label="Move North"
              >
                <ArrowUp className="size-4" />
              </Button>
              <div />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleMove(-1, 0)}
                aria-label="Move West"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="glow"
                onClick={handleInteract}
                aria-label="Interact with nearby tile"
                title="Interact (Space / Enter)"
              >
                <Compass className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleMove(1, 0)}
                aria-label="Move East"
              >
                <ArrowRight className="size-4" />
              </Button>
              <div />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleMove(0, 1)}
                aria-label="Move South"
              >
                <ArrowDown className="size-4" />
              </Button>
              <div />
            </div>

            <Button type="button" variant="glow" className="w-full" onClick={handleInteract}>
              <KeyRound className="size-4" />
              <span>
                {nearbyObjects.length > 0
                  ? `Interact: ${nearbyObjects[0]!.label}`
                  : "Interact (Space / Enter)"}
              </span>
            </Button>
          </div>

          <div className="space-y-2 border-t border-border/80 pt-3">
            <div className="font-display text-sm font-bold text-foreground">
              Nearby & Region Objectives
            </div>
            <div className="space-y-1.5">
              {region.objects.map((o) => {
                const done =
                  (o.kind === "switch" && adventure.activatedSwitches.includes(o.id)) ||
                  (o.kind === "relic" && adventure.collectedRelics.includes(o.id)) ||
                  (o.kind === "lore" && adventure.discoveredLore.includes(o.id)) ||
                  (o.kind === "npc" && o.quest && adventure.completedQuests.includes(o.quest.id));
                return (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[0.7rem]"
                  >
                    <span className="truncate font-medium text-foreground">{o.label}</span>
                    <span className={done ? "font-bold text-success" : "text-muted-foreground"}>
                      {done ? "Solved" : o.kind}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[0.68rem] text-muted-foreground">
            Legend: 🧭 Explorer · ◎/⚡ Switch · ★ Mentor Quest · 📜 Lore · ◆ Relic · 🌀/🔒 Gate
          </div>
        </div>
      </div>

      {/* NPC Academic Quest Dialog */}
      <Dialog open={activeQuest !== null} onOpenChange={(o) => !o && setActiveQuest(null)}>
        <DialogContent className="surface-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <UserCheck className="size-4 text-primary" />
              <span>{activeQuest?.npcName}</span>
            </DialogTitle>
            <DialogDescription>
              Solve this academic challenge to earn Citadel progression recognition.
            </DialogDescription>
          </DialogHeader>
          {activeQuest && (
            <div className="space-y-3 py-2 text-xs">
              <p className="font-semibold text-foreground">{activeQuest.prompt}</p>
              <div className="space-y-2">
                {activeQuest.options.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => answerQuestOption(idx)}
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-start text-foreground hover:border-primary/60 hover:bg-primary/10"
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {questFeedback && (
                <div className="rounded-lg bg-xp/10 p-2.5 text-xp">{questFeedback}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
