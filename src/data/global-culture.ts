export interface MuseumArtifact {
  id: string;
  accessionNo: string;
  title: string;
  era: string;
  provenance: string;
  context: string;
  significance: string;
}

export const MUSEUM_ARTIFACTS: MuseumArtifact[] = [
  {
    id: "art_astrolabe",
    accessionNo: "BTC-MUS-0104",
    title: "Brass Planispheric Astrolabe",
    era: "9th–11th Century (House of Wisdom, Baghdad)",
    provenance: "Inspired by Al-Khwarizmi and Mariam Al-Asturlabi celestial projection treatises",
    context:
      "Handheld analog astronomical calculator mapping local horizon altitudes to rotating star plates.",
    significance:
      "Enabled precise solar timekeeping, navigation bearings, and prayer horizon orientation.",
  },
  {
    id: "art_rosetta",
    accessionNo: "BTC-MUS-0218",
    title: "Trilingual Decree Replica (Hieroglyphic / Demotic / Greek)",
    era: "196 BCE (Memphis Decree)",
    provenance: "Comparative philology monument preserving parallel ancient scripts",
    context:
      "Carved granodiorite stele recording identical administrative clauses across three scripts.",
    significance:
      "Unlocked 3,000 years of Egyptian epigraphy through comparative script decipherment.",
  },
  {
    id: "art_gutenberg",
    accessionNo: "BTC-MUS-0309",
    title: "Movable-Type Lead Alloy Matrix",
    era: "c. 1440–1455 CE (Mainz) · Preceded by Bi Sheng (1040 CE)",
    provenance: "Ceramic and metal movable type traditions across Eurasia",
    context: "Reusable individual character punches cast in durable tin-lead-antimony alloy.",
    significance:
      "Collapsed book copying time from years per codex to hundreds of sheets per day, accelerating scientific literacy.",
  },
  {
    id: "art_antikythera",
    accessionNo: "BTC-MUS-0412",
    title: "Antikythera Epicyclic Gear Mechanism",
    era: "c. 100 BCE (Mediterranean Basin)",
    provenance: "Bronze geared astronomical dial recovered from a shipwreck",
    context: "Over 30 interlocking bronze spur gears computing lunar phases and eclipse cycles.",
    significance:
      "Oldest known analog planetary computing device demonstrating ancient precision metalwork.",
  },
  {
    id: "art_lovelace",
    accessionNo: "BTC-MUS-0520",
    title: "Ada Lovelace Bernoulli Note G",
    era: "1843 CE (London)",
    provenance: "Annotated scientific memoir on Babbage's Analytical Engine",
    context: "Step-by-step tabular trace computing Bernoulli numbers on punched-card registers.",
    significance:
      "Articulated the leap from pure arithmetic calculation to general symbolic computing.",
  },
];

export interface HistoricalEpochEvent {
  id: string;
  yearSort: number;
  yearLabel: string;
  era: "Ancient" | "Golden Age" | "Early Modern" | "Computing";
  title: string;
  sourceNote: string;
  summary: string;
}

export const HISTORY_TIMELINE_EVENTS: HistoricalEpochEvent[] = [
  {
    id: "hist_3000bce",
    yearSort: -3000,
    yearLabel: "c. 3000 BCE",
    era: "Ancient",
    title: "Sumerian Cuneiform & Faiyum Surveying",
    sourceNote: "Clay accounting tablets (Archaeological primary inscriptions)",
    summary:
      "Early symbolic writing and geometry surveys supported irrigation canals and trade ledgers.",
  },
  {
    id: "hist_820ce",
    yearSort: 820,
    yearLabel: "c. 820 CE",
    era: "Golden Age",
    title: "Al-Khwarizmi's Al-Jabr in Baghdad",
    sourceNote: "Kitab al-Mukhtasar fi Hisab al-Jabr wal-Muqabala",
    summary:
      "Systematized balancing linear and quadratic equations, giving algebra its foundational name.",
  },
  {
    id: "hist_1021ce",
    yearSort: 1021,
    yearLabel: "1021 CE",
    era: "Golden Age",
    title: "Ibn al-Haytham's Book of Optics",
    sourceNote: "Kitab al-Manazir (Controlled dark-chamber experiments)",
    summary:
      "Demonstrated experimental verification using camera obscura rays rather than untested hypothesis.",
  },
  {
    id: "hist_1687ce",
    yearSort: 1687,
    yearLabel: "1687 CE",
    era: "Early Modern",
    title: "Principia Mathematica — Universal Gravitation",
    sourceNote: "Royal Society First Edition Monograph",
    summary:
      "Unified terrestrial falling motion and planetary orbital laws into inverse-square mechanics.",
  },
  {
    id: "hist_1969ce",
    yearSort: 1969,
    yearLabel: "1969 CE",
    era: "Computing",
    title: "Apollo Guidance Computer & ARPANET Nodes",
    sourceNote: "MIT Instrumentation Lab Flight Logs",
    summary:
      "Real-time priority scheduling software navigated spacecraft while packet switching began.",
  },
];

export const WORLD_CULTURES = [
  {
    id: "cul_kw",
    region: "Kuwait & Arabian Gulf",
    languages: "Arabic, English",
    heritage:
      "Dhow maritime craft, Failaka heritage, Al-Sadu traditional weaving (UNESCO Intangible Heritage)",
    cuisineNote: "Spiced machboos rice, dates, Arabic cardamom coffee (Gahwa) hospitality.",
  },
  {
    id: "cul_jp",
    region: "Japan",
    languages: "Japanese",
    heritage:
      "Mount Fuji, Kyoto wooden temples, Kumiko joinery, seasonal Origami & Washi paper crafts",
    cuisineNote:
      "Washoku seasonal balance centered on rice, miso broth, vegetables, and grilled fish.",
  },
  {
    id: "cul_ma",
    region: "Morocco",
    languages: "Arabic, Amazigh (Tamazight), French",
    heritage:
      "Al-Qarawiyyin historic library (Fez, founded 859 CE), geometric Zellij tilework, Atlas ksour",
    cuisineNote: "Mint tea ceremonies, clay tagine slow stews, couscous shared on Fridays.",
  },
  {
    id: "cul_pe",
    region: "Peru",
    languages: "Spanish, Quechua, Aymara",
    heritage:
      "Andean agricultural terraces (Moray), Machu Picchu stone engineering, knotted Quipu records",
    cuisineNote:
      "Andean potatoes (thousands of heirloom varieties), quinoa, and coastal citrus dishes.",
  },
];

export const LANGUAGE_PHRASES = [
  {
    langName: "Arabic (العربية)",
    bcp47: "ar-KW",
    phrase: "العلم نور والتعاون يصنع المستقبل",
    romanized: "Al-'ilm nur wat-ta'awun yasna' al-mustaqbal",
    meaning: "Knowledge is light, and collaboration shapes the future.",
  },
  {
    langName: "Japanese (日本語)",
    bcp47: "ja-JP",
    phrase: "一緒に学びましょう",
    romanized: "Issho ni manabimashō",
    meaning: "Let us learn together!",
  },
  {
    langName: "Spanish (Español)",
    bcp47: "es-ES",
    phrase: "La curiosidad abre caminos",
    romanized: "La curiosidad abre caminos",
    meaning: "Curiosity opens new paths.",
  },
  {
    langName: "French (Français)",
    bcp47: "fr-FR",
    phrase: "Apprendre ensemble chaque jour",
    romanized: "Apprendre ensemble chaque jour",
    meaning: "Learning together every day.",
  },
];

export const GLOBAL_TOPICS = [
  {
    id: "glob_water",
    title: "Solar Desalination & Clean Water Access",
    citation: "Curated Curricular Summary · UNEP / IEA Water-Energy Nexus (2024)",
    disciplines: ["Physics", "Chemistry", "Civic Sustainability"],
    takeaway:
      "Coupling renewable solar heat with reverse osmosis lowers fossil carbon intensity for arid coastal cities.",
  },
  {
    id: "glob_grids",
    title: "Renewable Microgrids & Battery Storage",
    citation: "Curated Curricular Summary · IEA Renewables Outlook (2024)",
    disciplines: ["Electrical Engineering", "Economics", "Mathematics"],
    takeaway:
      "Smart storage smooths midday solar peaks into evening demand, cutting diesel backup use in remote schools.",
  },
  {
    id: "glob_literacy",
    title: "Multilingual Open Educational Resources",
    citation: "Curated Curricular Summary · UNESCO OER Recommendation",
    disciplines: ["Languages", "Accessibility", "Pedagogy"],
    takeaway:
      "Localizing STEM glossaries into home languages significantly accelerates conceptual mastery.",
  },
];

export const BOOK_CLUB_CATALOG = [
  {
    id: "book_sophie",
    title: "Sophie's World",
    author: "Jostein Gaarder",
    theme: "Philosophy & Critical Inquiry",
    summary:
      "An accessible epistolary introduction to major philosophical questions from ancient Athens to modern science.",
  },
  {
    id: "book_hidden_figures",
    title: "Hidden Figures (Young Readers' Edition)",
    author: "Margot Lee Shetterly",
    theme: "Mathematics & Spaceflight History",
    summary:
      "Chronicles Katherine Johnson, Dorothy Vaughan, and Mary Jackson computing orbital trajectories by hand and early mainframes.",
  },
  {
    id: "book_man_who_counted",
    title: "The Man Who Counted",
    author: "Malba Tahan",
    theme: "Classical Mathematics & Fairness",
    summary:
      "Mathematical fables set along historic desert caravan routes showing proportional reasoning and creative problem solving.",
  },
  {
    id: "book_cosmos",
    title: "Cosmos",
    author: "Carl Sagan",
    theme: "Astronomy & Scientific Method",
    summary:
      "Traces human curiosity from Eratosthenes measuring Earth's circumference to Voyager's interstellar journey.",
  },
];
