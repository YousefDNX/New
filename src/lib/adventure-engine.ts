import {
  ADVENTURE_REGIONS,
  type AdventureInteractiveObject,
  type AdventureRegion,
  type AdventureRegionId,
} from "@/data/adventure-world";

export interface AdventureWorldState {
  activeRegion: AdventureRegionId;
  playerX: number;
  playerY: number;
  unlockedRegions: AdventureRegionId[];
  activatedSwitches: string[];
  collectedRelics: string[];
  completedQuests: string[];
  discoveredLore: string[];
  lastEventMessage: string;
}

export function createInitialAdventureState(): AdventureWorldState {
  const starter = ADVENTURE_REGIONS[0]!;
  return {
    activeRegion: starter.id,
    playerX: starter.spawnX,
    playerY: starter.spawnY,
    unlockedRegions: ["courtyard"],
    activatedSwitches: [],
    collectedRelics: [],
    completedQuests: [],
    discoveredLore: [],
    lastEventMessage:
      "Welcome to BTC Adventure World! Move with Arrow Keys / WASD or the D-Pad, then Interact (Space/Enter) near sparkling tiles.",
  };
}

export function getRegionById(regionId: AdventureRegionId): AdventureRegion {
  return ADVENTURE_REGIONS.find((r) => r.id === regionId) ?? ADVENTURE_REGIONS[0]!;
}

export function isObjectUnlocked(
  obj: AdventureInteractiveObject,
  state: AdventureWorldState,
): boolean {
  if (obj.requiredSwitches && obj.requiredSwitches.length > 0) {
    const swSet = new Set(state.activatedSwitches);
    if (!obj.requiredSwitches.every((id) => swSet.has(id))) {
      return false;
    }
  }
  if (
    typeof obj.requiredRelicsCount === "number" &&
    state.collectedRelics.length < obj.requiredRelicsCount
  ) {
    return false;
  }
  return true;
}

export function getNearbyObjects(state: AdventureWorldState): AdventureInteractiveObject[] {
  const region = getRegionById(state.activeRegion);
  return region.objects.filter((obj) => {
    const dist = Math.abs(obj.x - state.playerX) + Math.abs(obj.y - state.playerY);
    return dist <= 1;
  });
}

export function stepAdventureMove(
  state: AdventureWorldState,
  dx: number,
  dy: number,
): { nextState: AdventureWorldState; moved: boolean } {
  const region = getRegionById(state.activeRegion);
  const nextX = state.playerX + dx;
  const nextY = state.playerY + dy;

  if (nextX < 0 || nextY < 0 || nextX >= region.width || nextY >= region.height) {
    return { nextState: state, moved: false };
  }

  const row = region.grid[nextY];
  if (!row || row[nextX] === "#") {
    return { nextState: state, moved: false };
  }

  const autoObj = region.objects.find((o) => o.x === nextX && o.y === nextY);
  let msg = state.lastEventMessage;
  if (autoObj) {
    msg = `Near ${autoObj.label} — press Interact to inspect or activate.`;
  }

  return {
    moved: true,
    nextState: {
      ...state,
      playerX: nextX,
      playerY: nextY,
      lastEventMessage: msg,
    },
  };
}

export function travelToRegion(
  state: AdventureWorldState,
  targetRegion: AdventureRegionId,
): AdventureWorldState {
  if (!state.unlockedRegions.includes(targetRegion)) {
    return {
      ...state,
      lastEventMessage:
        "That region is still sealed. Solve the gate puzzle or collect required relics first.",
    };
  }
  const region = getRegionById(targetRegion);
  return {
    ...state,
    activeRegion: region.id,
    playerX: region.spawnX,
    playerY: region.spawnY,
    lastEventMessage: `Entered ${region.name}: ${region.subtitle}`,
  };
}

export type AdventureInteractOutcome =
  | { kind: "none"; nextState: AdventureWorldState }
  | { kind: "message"; nextState: AdventureWorldState }
  | {
      kind: "quest";
      nextState: AdventureWorldState;
      quest: NonNullable<AdventureInteractiveObject["quest"]>;
    }
  | { kind: "relic"; nextState: AdventureWorldState; relicName: string; relicId: string };

export function interactAdventureTile(state: AdventureWorldState): AdventureInteractOutcome {
  const nearby = getNearbyObjects(state);
  const region = getRegionById(state.activeRegion);

  // Prioritize standing directly on tile, otherwise first adjacent object
  const target = nearby.find((o) => o.x === state.playerX && o.y === state.playerY) ?? nearby[0];

  if (!target) {
    return {
      kind: "none",
      nextState: {
        ...state,
        lastEventMessage: `Exploring ${region.name}. Move adjacent to a glowing tile (switch, NPC, lore tablet, relic, or portal) to interact.`,
      },
    };
  }

  if (target.kind === "switch") {
    const already = state.activatedSwitches.includes(target.id);
    if (already) {
      return {
        kind: "message",
        nextState: { ...state, lastEventMessage: `${target.label} is already energized.` },
      };
    }
    const nextSwitches = [...state.activatedSwitches, target.id];
    const nextState: AdventureWorldState = {
      ...state,
      activatedSwitches: nextSwitches,
      lastEventMessage: `Activated ${target.label}! Check nearby gates or relic chambers.`,
    };
    return { kind: "message", nextState };
  }

  if (target.kind === "lore") {
    const known = state.discoveredLore.includes(target.id);
    const nextLore = known ? state.discoveredLore : [...state.discoveredLore, target.id];
    return {
      kind: "message",
      nextState: {
        ...state,
        discoveredLore: nextLore,
        lastEventMessage: target.loreText ?? `${target.label} examined.`,
      },
    };
  }

  if (target.kind === "npc" && target.quest) {
    if (state.completedQuests.includes(target.quest.id)) {
      return {
        kind: "message",
        nextState: {
          ...state,
          lastEventMessage: `${target.quest.npcName}: "Well solved, explorer! Your mastery keeps Citadel beacons shining."`,
        },
      };
    }
    return {
      kind: "quest",
      nextState: state,
      quest: target.quest,
    };
  }

  if (target.kind === "relic") {
    if (!isObjectUnlocked(target, state)) {
      return {
        kind: "message",
        nextState: {
          ...state,
          lastEventMessage: `${target.label} is shielded! Activate this region's resonance switch(es) first.`,
        },
      };
    }
    if (state.collectedRelics.includes(target.id)) {
      return {
        kind: "message",
        nextState: {
          ...state,
          lastEventMessage: `You already hold ${target.relicName ?? target.label}.`,
        },
      };
    }
    const nextRelics = [...state.collectedRelics, target.id];
    const unlocked = new Set(state.unlockedRegions);
    if (nextRelics.length >= 2) {
      unlocked.add("observatory");
    }
    return {
      kind: "relic",
      relicId: target.id,
      relicName: target.relicName ?? target.label,
      nextState: {
        ...state,
        collectedRelics: nextRelics,
        unlockedRegions: Array.from(unlocked),
        lastEventMessage: `Relic Claimed: ${target.relicName ?? target.label}! (${nextRelics.length}/4 Relics)`,
      },
    };
  }

  if (target.kind === "portal" && target.targetRegion) {
    if (!isObjectUnlocked(target, state)) {
      const reason =
        typeof target.requiredRelicsCount === "number"
          ? `Requires at least ${target.requiredRelicsCount} Relics collected (${state.collectedRelics.length}/${target.requiredRelicsCount}).`
          : "Portal sealed — activate this region's switch puzzle first.";
      return {
        kind: "message",
        nextState: { ...state, lastEventMessage: reason },
      };
    }
    const unlocked = new Set(state.unlockedRegions);
    unlocked.add(target.targetRegion);
    const dest = getRegionById(target.targetRegion);
    return {
      kind: "message",
      nextState: {
        ...state,
        unlockedRegions: Array.from(unlocked),
        activeRegion: dest.id,
        playerX: dest.spawnX,
        playerY: dest.spawnY,
        lastEventMessage: `Teleported to ${dest.name}! ${dest.subtitle}`,
      },
    };
  }

  return { kind: "none", nextState: state };
}

export function completeAdventureQuest(
  state: AdventureWorldState,
  questId: string,
  rewardNote: string,
): AdventureWorldState {
  if (state.completedQuests.includes(questId)) return state;
  return {
    ...state,
    completedQuests: [...state.completedQuests, questId],
    lastEventMessage: `Quest Complete! ${rewardNote}`,
  };
}
