export type AdventureRegionId = "courtyard" | "library" | "harbor" | "observatory";

export type TileLegendChar = "#" | "." | "S" | "G" | "N" | "R" | "L" | "P" | "E";

export interface AdventureInteractiveObject {
  id: string;
  regionId: AdventureRegionId;
  x: number;
  y: number;
  kind: "switch" | "gate" | "npc" | "relic" | "lore" | "portal";
  label: string;
  targetRegion?: AdventureRegionId;
  requiredSwitches?: string[];
  requiredRelicsCount?: number;
  relicName?: string;
  loreText?: string;
  quest?: {
    id: string;
    npcName: string;
    prompt: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
    rewardNote: string;
  };
}

export interface AdventureRegion {
  id: AdventureRegionId;
  name: string;
  nameAr: string;
  subtitle: string;
  themeColor: string;
  width: number;
  height: number;
  spawnX: number;
  spawnY: number;
  /** Row strings of uniform width: '#' = wall, '.' = walkable */
  grid: string[];
  unlockRequirementDesc: string;
  objects: AdventureInteractiveObject[];
}

export const ADVENTURE_REGIONS: AdventureRegion[] = [
  {
    id: "courtyard",
    name: "Academy Courtyard",
    nameAr: "فناء الأكاديمية",
    subtitle: "Starting plaza — awaken the Sun Dial switch to unlock the Library Gate.",
    themeColor: "#14b8a6",
    width: 10,
    height: 8,
    spawnX: 1,
    spawnY: 6,
    unlockRequirementDesc: "Starter region — open immediately",
    grid: [
      "##########",
      "#...#....#",
      "#.#.#.##.#",
      "#.#......#",
      "#..####.##",
      "#........#",
      "#....#...#",
      "##########",
    ],
    objects: [
      {
        id: "sw_courtyard_dial",
        regionId: "courtyard",
        x: 3,
        y: 1,
        kind: "switch",
        label: "Courtyard Resonance Switch",
      },
      {
        id: "lore_courtyard_founder",
        regionId: "courtyard",
        x: 1,
        y: 3,
        kind: "lore",
        label: "Founder's Tablet",
        loreText:
          "Lore #1: 'Curiosity becomes mastery only when knowledge is tested, questioned, and shared.'",
      },
      {
        id: "npc_elena",
        regionId: "courtyard",
        x: 5,
        y: 3,
        kind: "npc",
        label: "Mentor Elena",
        quest: {
          id: "q_elena_vocab",
          npcName: "Mentor Elena",
          prompt:
            "Challenge from Mentor Elena: Which Grade 9 Unit 3 verb means 'to keep something in good condition or balance'?",
          options: ["abandon", "maintain", "ignore", "scatter"],
          correctIndex: 1,
          rewardNote: "Elena honors your precision! Gate switch resonance boosted.",
        },
      },
      {
        id: "relic_compass",
        regionId: "courtyard",
        x: 8,
        y: 1,
        kind: "relic",
        label: "Compass of Inquiry",
        relicName: "Compass of Inquiry",
        requiredSwitches: ["sw_courtyard_dial"],
      },
      {
        id: "gate_to_library",
        regionId: "courtyard",
        x: 8,
        y: 6,
        kind: "portal",
        label: "Gate to Clockwork Library",
        targetRegion: "library",
        requiredSwitches: ["sw_courtyard_dial"],
      },
    ],
  },
  {
    id: "library",
    name: "Clockwork Library",
    nameAr: "مكتبة التروس المضيئة",
    subtitle: "Align both Twin Brass Dials to open the Archives Codex Chamber.",
    themeColor: "#6366f1",
    width: 10,
    height: 8,
    spawnX: 1,
    spawnY: 6,
    unlockRequirementDesc: "Activate Courtyard Resonance Switch and step through courtyard portal",
    grid: [
      "##########",
      "#....#...#",
      "#.##.#.#.#",
      "#......#.#",
      "###.####.#",
      "#........#",
      "#..#.....#",
      "##########",
    ],
    objects: [
      {
        id: "sw_lib_alpha",
        regionId: "library",
        x: 1,
        y: 1,
        kind: "switch",
        label: "Brass Dial Alpha",
      },
      {
        id: "sw_lib_beta",
        regionId: "library",
        x: 8,
        y: 1,
        kind: "switch",
        label: "Brass Dial Beta",
      },
      {
        id: "npc_tariq",
        regionId: "library",
        x: 4,
        y: 3,
        kind: "npc",
        label: "Archivist Tariq",
        quest: {
          id: "q_tariq_logic",
          npcName: "Archivist Tariq",
          prompt:
            "Archivist Tariq asks: If all spaced flashcards double retention intervals after recall, what breaks the Ebbinghaus forgetting curve fastest?",
          options: [
            "Never testing yourself",
            "Active timed retrieval before recall fades",
            "Highlighting sentences blindly",
            "Skipping sleep before exams",
          ],
          correctIndex: 1,
          rewardNote: "Archivist Tariq grants you access to ancient Archive notes.",
        },
      },
      {
        id: "lore_lib_patterns",
        regionId: "library",
        x: 1,
        y: 5,
        kind: "lore",
        label: "Archive Scroll",
        loreText:
          "Lore #2: 'Every advanced theorem hides three simple prerequisites waiting to be strengthened.'",
      },
      {
        id: "relic_codex",
        regionId: "library",
        x: 6,
        y: 1,
        kind: "relic",
        label: "Codex of Patterns",
        relicName: "Codex of Patterns",
        requiredSwitches: ["sw_lib_alpha", "sw_lib_beta"],
      },
      {
        id: "portal_lib_to_harbor",
        regionId: "library",
        x: 8,
        y: 6,
        kind: "portal",
        label: "Conduit Bridge to Innovation Harbor",
        targetRegion: "harbor",
        requiredSwitches: ["sw_lib_alpha", "sw_lib_beta"],
      },
    ],
  },
  {
    id: "harbor",
    name: "Innovation Harbor",
    nameAr: "ميناء الابتكار",
    subtitle: "Energize the Tidal Turbine Switch and solve Engineer Nadia's STEM design check.",
    themeColor: "#0ea5e9",
    width: 10,
    height: 8,
    spawnX: 1,
    spawnY: 6,
    unlockRequirementDesc: "Align Twin Brass Dials in Clockwork Library",
    grid: [
      "##########",
      "#........#",
      "#.##..##.#",
      "#.#....#.#",
      "#.#.##.#.#",
      "#........#",
      "#...##...#",
      "##########",
    ],
    objects: [
      {
        id: "sw_harbor_turbine",
        regionId: "harbor",
        x: 8,
        y: 1,
        kind: "switch",
        label: "Tidal Dynamo Switch",
      },
      {
        id: "npc_nadia",
        regionId: "harbor",
        x: 4,
        y: 3,
        kind: "npc",
        label: "Engineer Nadia",
        quest: {
          id: "q_nadia_stem",
          npcName: "Engineer Nadia",
          prompt:
            "Engineer Nadia tests your STEM reasoning: If two coastal microgrids cut power losses from 20% down to 5%, what fraction of original loss remains?",
          options: ["1/2 (50%)", "1/4 (25%)", "3/4 (75%)", "4/5 (80%)"],
          correctIndex: 1,
          rewardNote: "Engineer Nadia calibrates your Dynamo Core telemetry!",
        },
      },
      {
        id: "lore_harbor_energy",
        regionId: "harbor",
        x: 1,
        y: 1,
        kind: "lore",
        label: "Harbor Blueprint",
        loreText: "Lore #3: 'Clean engineering turns natural constraint into elegant efficiency.'",
      },
      {
        id: "relic_dynamo",
        regionId: "harbor",
        x: 5,
        y: 1,
        kind: "relic",
        label: "Dynamo Core",
        relicName: "Dynamo Core",
        requiredSwitches: ["sw_harbor_turbine"],
      },
      {
        id: "portal_harbor_to_obs",
        regionId: "harbor",
        x: 8,
        y: 6,
        kind: "portal",
        label: "Sky Lift to Observatory Peak",
        targetRegion: "observatory",
        requiredRelicsCount: 2,
      },
    ],
  },
  {
    id: "observatory",
    name: "Observatory Peak",
    nameAr: "قمة المرصد الفلكي",
    subtitle: "Summit sanctuary — requires 2 Relics to enter. Claim the Starlight Emblem.",
    themeColor: "#f59e0b",
    width: 10,
    height: 8,
    spawnX: 1,
    spawnY: 6,
    unlockRequirementDesc: "Collect at least 2 Relics across the Citadel",
    grid: [
      "##########",
      "#........#",
      "#.###.##.#",
      "#........#",
      "#.##.###.#",
      "#........#",
      "#....#...#",
      "##########",
    ],
    objects: [
      {
        id: "sw_obs_prism",
        regionId: "observatory",
        x: 1,
        y: 1,
        kind: "switch",
        label: "Constellation Mirror Switch",
      },
      {
        id: "npc_sami",
        regionId: "observatory",
        x: 4,
        y: 3,
        kind: "npc",
        label: "Astronomer Sami",
        quest: {
          id: "q_sami_critical",
          npcName: "Astronomer Sami",
          prompt:
            "Astronomer Sami asks: When two telescopes show brightness dipping at exact 4-day intervals, what distinguishes scientific certainty from guesswork?",
          options: [
            "Repeating controlled measurements & checking confounding noise",
            "Picking whichever answer sounds nicer",
            "Ignoring contradictory observations",
            "Dropping units from equations",
          ],
          correctIndex: 0,
          rewardNote: "Sami unveils the Constellation Mirror alignment!",
        },
      },
      {
        id: "lore_obs_starlight",
        regionId: "observatory",
        x: 8,
        y: 5,
        kind: "lore",
        label: "Starlight Inscription",
        loreText:
          "Lore #4: 'Students who think critically illuminate paths for everyone beside them — Be The Change.'",
      },
      {
        id: "relic_starlight",
        regionId: "observatory",
        x: 8,
        y: 1,
        kind: "relic",
        label: "Starlight Emblem",
        relicName: "Starlight Emblem",
        requiredSwitches: ["sw_obs_prism"],
      },
      {
        id: "portal_obs_to_courtyard",
        regionId: "observatory",
        x: 1,
        y: 6,
        kind: "portal",
        label: "Return Lift to Academy Courtyard",
        targetRegion: "courtyard",
      },
    ],
  },
];
