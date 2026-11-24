export interface TitrationReading {
  volumeMl: number;
  ph: number;
  indicatorColor: string;
}

/**
 * Computes approximate strong acid (HCl) + strong base (NaOH) titration pH.
 * Educational simulation assuming 25.0 mL of 0.10 M HCl titrated with 0.10 M NaOH.
 */
export function computeAcidBasePh(naohVolumeMl: number): {
  ph: number;
  indicatorHex: string;
  indicatorLabel: string;
  stage: "acidic" | "equivalence" | "basic";
} {
  const acidVol = 25;
  const molarity = 0.1;
  const molesAcid = (acidVol / 1000) * molarity;
  const molesBase = (Math.max(0, naohVolumeMl) / 1000) * molarity;
  const totalVolL = (acidVol + Math.max(0, naohVolumeMl)) / 1000;

  let ph = 7.0;
  if (Math.abs(molesAcid - molesBase) < 1e-6) {
    ph = 7.0;
  } else if (molesAcid > molesBase) {
    const hConc = (molesAcid - molesBase) / totalVolL;
    ph = Math.max(0.5, Math.min(6.99, -Math.log10(hConc)));
  } else {
    const ohConc = (molesBase - molesAcid) / totalVolL;
    const poh = -Math.log10(ohConc);
    ph = Math.min(13.5, Math.max(7.01, 14 - poh));
  }

  const roundedPh = Number(ph.toFixed(2));
  if (roundedPh < 6.2) {
    return {
      ph: roundedPh,
      indicatorHex: "#f59e0b",
      indicatorLabel: "Bromothymol Yellow (Acidic)",
      stage: "acidic",
    };
  }
  if (roundedPh <= 7.8) {
    return {
      ph: roundedPh,
      indicatorHex: "#10b981",
      indicatorLabel: "Neutral Emerald (Equivalence)",
      stage: "equivalence",
    };
  }
  return {
    ph: roundedPh,
    indicatorHex: "#2563eb",
    indicatorLabel: "Bromothymol Blue (Basic)",
    stage: "basic",
  };
}

/**
 * Estimates photosynthesis O2 bubble rate (bubbles/min) using inverse-square light intensity
 * and CO2 availability saturation.
 */
export function computePhotosynthesisRate(lightDistanceCm: number, co2Pct: number): number {
  const safeDist = Math.max(10, Math.min(100, lightDistanceCm));
  const intensityFactor = Math.min(1, (20 / safeDist) ** 2);
  const co2Factor = Math.min(1, Math.max(0.05, co2Pct) / 0.12);
  return Math.round(64 * Math.min(intensityFactor, co2Factor));
}

/**
 * Approximate KNO3 & NaCl solubility (g / 100g H2O) at given temperature (0-100 C).
 */
export function computeSolubilityGrams(salt: "KNO3" | "NaCl", tempC: number): number {
  const t = Math.max(0, Math.min(100, tempC));
  if (salt === "NaCl") {
    return Number((35.7 + 0.038 * t).toFixed(1));
  }
  return Number((13.3 * Math.exp(0.029 * t)).toFixed(1));
}

export interface BodySystemNode {
  id: "skeletal" | "muscular" | "circulatory" | "respiratory" | "digestive" | "nervous" | "sensory";
  nameEn: string;
  nameAr: string;
  color: string;
  yPos: number;
  xPos: number;
  organs: string[];
  roleEn: string;
  roleAr: string;
  interlinks: string[];
}

export const BODY_SYSTEMS: BodySystemNode[] = [
  {
    id: "nervous",
    nameEn: "Nervous System",
    nameAr: "الجهاز العصبي",
    color: "#a855f7",
    yPos: 1.8,
    xPos: 0,
    organs: ["Brain", "Spinal Cord", "Peripheral Nerves"],
    roleEn: "Coordinates electrical and chemical signals for thought, balance, and rapid reflexes.",
    roleAr: "ينسق الإشارات الكهربائية والكيميائية للتفكير والتوازن وردود الفعل السريعة.",
    interlinks: ["Sensory Organs", "Muscular System", "Respiratory Rhythm"],
  },
  {
    id: "sensory",
    nameEn: "Sensory System",
    nameAr: "الجهاز الحسي",
    color: "#38bdf8",
    yPos: 1.55,
    xPos: 0.35,
    organs: ["Retina (Eye)", "Cochlea (Ear)", "Mechanoreceptors"],
    roleEn:
      "Transduces light, sound vibrations, pressure, and taste into neural action potentials.",
    roleAr: "يحول الضوء والصوت والضغط إلى نبضات عصبية يفسرها الدماغ.",
    interlinks: ["Nervous System"],
  },
  {
    id: "respiratory",
    nameEn: "Respiratory System",
    nameAr: "الجهاز التنفسي",
    color: "#22d3ee",
    yPos: 0.95,
    xPos: -0.3,
    organs: ["Trachea", "Bronchi", "Lungs & Alveoli"],
    roleEn: "Exchanges inhaled oxygen into capillary blood and expels carbon dioxide.",
    roleAr: "يبادل الأكسجين المستنشق مع الدم ويطرد ثاني أكسيد الكربون.",
    interlinks: ["Circulatory System", "Muscular Diaphragm"],
  },
  {
    id: "circulatory",
    nameEn: "Circulatory System",
    nameAr: "الجهاز الدوري",
    color: "#f43f5e",
    yPos: 0.85,
    xPos: 0.2,
    organs: ["Heart (4 Chambers)", "Arteries", "Veins & Capillaries"],
    roleEn:
      "Pumps oxygenated blood, nutrients, and immune cells continuously through systemic loops.",
    roleAr: "يضخ الدم المؤكسج والعناصر الغذائية عبر الجسم باستمرار.",
    interlinks: ["Respiratory System", "Digestive Nutrient Absorption"],
  },
  {
    id: "digestive",
    nameEn: "Digestive System",
    nameAr: "الجهاز الهضمي",
    color: "#f59e0b",
    yPos: 0.15,
    xPos: 0,
    organs: ["Esophagus", "Stomach", "Small & Large Intestines"],
    roleEn: "Breaks down complex macromolecules into amino acids, glucose, fatty acids, and water.",
    roleAr: "يفكك الغذاء إلى سكريات وأحماض أمينية ودهون قابلة للامتصاص.",
    interlinks: ["Circulatory System", "Nervous Vagus Signals"],
  },
  {
    id: "muscular",
    nameEn: "Muscular System",
    nameAr: "الجهاز العضلي",
    color: "#fb7185",
    yPos: -0.5,
    xPos: -0.45,
    organs: ["Skeletal Muscle Fibers", "Tendons", "Smooth Muscle"],
    roleEn: "Generates force and movement via ATP-driven actin and myosin cross-bridge cycling.",
    roleAr: "يولد القوة والحركة بمساعدة الطاقة ATP وتقلص الألياف العضلية.",
    interlinks: ["Skeletal System", "Nervous System"],
  },
  {
    id: "skeletal",
    nameEn: "Skeletal System",
    nameAr: "الجهاز الهيكلي",
    color: "#e2e8f0",
    yPos: -0.75,
    xPos: 0.45,
    organs: ["Cranium", "Vertebral Column", "Ribcage", "Femur"],
    roleEn:
      "Provides structural posture, protects vital organs, stores calcium, and forms blood cells.",
    roleAr: "يوفر الدعامة الهيكلية ويحمي الأعضاء الحيوية ويخزن الكالسيوم.",
    interlinks: ["Muscular System", "Circulatory Marrow"],
  },
];

export interface PlanetProfile {
  id: string;
  name: string;
  type: "Terrestrial" | "Gas Giant" | "Ice Giant" | "Exoplanet";
  auDistance: number;
  gravityMs2: number;
  dayHours: number;
  yearDays: number;
  moons: number;
  color: string;
  highlight: string;
}

export const SPACE_PLANETS: PlanetProfile[] = [
  {
    id: "mercury",
    name: "Mercury",
    type: "Terrestrial",
    auDistance: 0.39,
    gravityMs2: 3.7,
    dayHours: 1408,
    yearDays: 88,
    moons: 0,
    color: "#94a3b8",
    highlight: "Extreme diurnal temperature swing (+430°C to -180°C) with negligible atmosphere.",
  },
  {
    id: "venus",
    name: "Venus",
    type: "Terrestrial",
    auDistance: 0.72,
    gravityMs2: 8.87,
    dayHours: 5832,
    yearDays: 225,
    moons: 0,
    color: "#fbbf24",
    highlight: "Dense CO2 greenhouse atmosphere creates 92 bar surface pressure and 465°C heat.",
  },
  {
    id: "earth",
    name: "Earth",
    type: "Terrestrial",
    auDistance: 1.0,
    gravityMs2: 9.81,
    dayHours: 24,
    yearDays: 365.25,
    moons: 1,
    color: "#38bdf8",
    highlight: "Liquid surface water, protective magnetosphere, and nitrogen-oxygen biosphere.",
  },
  {
    id: "mars",
    name: "Mars",
    type: "Terrestrial",
    auDistance: 1.52,
    gravityMs2: 3.72,
    dayHours: 24.6,
    yearDays: 687,
    moons: 2,
    color: "#f97316",
    highlight: "Iron-oxide regolith, Olympus Mons volcano, and polar water/CO2 ice caps.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: "Gas Giant",
    auDistance: 5.2,
    gravityMs2: 24.79,
    dayHours: 9.9,
    yearDays: 4333,
    moons: 95,
    color: "#d97706",
    highlight: "Largest Solar System planet; Great Red Spot anticyclone larger than Earth.",
  },
  {
    id: "saturn",
    name: "Saturn",
    type: "Gas Giant",
    auDistance: 9.58,
    gravityMs2: 10.44,
    dayHours: 10.7,
    yearDays: 10759,
    moons: 146,
    color: "#eab308",
    highlight: "Extensive water-ice ring system; mean density lower than liquid water.",
  },
  {
    id: "trappist1e",
    name: "TRAPPIST-1e (Exoplanet)",
    type: "Exoplanet",
    auDistance: 0.029,
    gravityMs2: 9.1,
    dayHours: 146,
    yearDays: 6.1,
    moons: 0,
    color: "#10b981",
    highlight: "Rocky Earth-sized exoplanet orbiting an ultra-cool dwarf star 40 light-years away.",
  },
];

export const SPACE_MISSIONS = [
  {
    year: "1969",
    name: "Apollo 11",
    agency: "NASA",
    summary: "First crewed lunar landing at Sea of Tranquility; returned 21.5 kg of lunar basalt.",
  },
  {
    year: "1977",
    name: "Voyager 1 & 2",
    agency: "NASA",
    summary: "Grand Tour of outer gas/ice giants; Voyager 1 entered interstellar space in 2012.",
  },
  {
    year: "1990",
    name: "Hubble Space Telescope",
    agency: "NASA / ESA",
    summary:
      "Low-Earth orbit observatory confirming accelerating cosmic expansion and deep fields.",
  },
  {
    year: "2021",
    name: "Mars Perseverance & Ingenuity",
    agency: "NASA",
    summary:
      "Jezero Crater astrobiology rover + first powered aerodynamic flight on another planet.",
  },
  {
    year: "2021",
    name: "James Webb Space Telescope (JWST)",
    agency: "NASA / ESA / CSA",
    summary:
      "Infrared spectroscopy at Sun-Earth L2 revealing early galaxies and exoplanet atmospheres.",
  },
];

export interface MoleculePreset {
  id: string;
  formula: string;
  name: string;
  geometry: string;
  bondAngle: string;
  bondType: "Polar Covalent" | "Nonpolar Covalent" | "Double Covalent" | "Ionic Crystal";
  atoms: Array<{ symbol: string; x: number; y: number; r: number; color: string }>;
  bonds: Array<{ from: number; to: number; order: 1 | 2 }>;
  note: string;
}

export const MOLECULE_PRESETS: MoleculePreset[] = [
  {
    id: "h2o",
    formula: "H₂O",
    name: "Water",
    geometry: "Bent",
    bondAngle: "104.5°",
    bondType: "Polar Covalent",
    atoms: [
      { symbol: "O", x: 140, y: 75, r: 22, color: "#ef4444" },
      { symbol: "H", x: 88, y: 122, r: 14, color: "#e2e8f0" },
      { symbol: "H", x: 192, y: 122, r: 14, color: "#e2e8f0" },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
    ],
    note: "Two lone electron pairs on oxygen compress the H-O-H angle from 109.5° to 104.5°, producing strong hydrogen bonding.",
  },
  {
    id: "co2",
    formula: "CO₂",
    name: "Carbon Dioxide",
    geometry: "Linear",
    bondAngle: "180°",
    bondType: "Double Covalent",
    atoms: [
      { symbol: "O", x: 68, y: 95, r: 20, color: "#ef4444" },
      { symbol: "C", x: 140, y: 95, r: 21, color: "#64748b" },
      { symbol: "O", x: 212, y: 95, r: 20, color: "#ef4444" },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 1, to: 2, order: 2 },
    ],
    note: "Symmetric linear double bonds cancel dipole moments, making CO₂ overall nonpolar.",
  },
  {
    id: "ch4",
    formula: "CH₄",
    name: "Methane",
    geometry: "Tetrahedral",
    bondAngle: "109.5°",
    bondType: "Nonpolar Covalent",
    atoms: [
      { symbol: "C", x: 140, y: 95, r: 21, color: "#64748b" },
      { symbol: "H", x: 140, y: 36, r: 14, color: "#e2e8f0" },
      { symbol: "H", x: 85, y: 132, r: 14, color: "#e2e8f0" },
      { symbol: "H", x: 195, y: 132, r: 14, color: "#e2e8f0" },
      { symbol: "H", x: 140, y: 152, r: 13, color: "#cbd5e1" },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
    ],
    note: "Four equivalent C–H sp³ bonds repel equally in 3D space at 109.5°.",
  },
  {
    id: "nacl",
    formula: "NaCl",
    name: "Sodium Chloride",
    geometry: "Cubic Crystal Lattice",
    bondAngle: "90° lattice",
    bondType: "Ionic Crystal",
    atoms: [
      { symbol: "Na⁺", x: 96, y: 72, r: 18, color: "#a855f7" },
      { symbol: "Cl⁻", x: 176, y: 72, r: 23, color: "#22c55e" },
      { symbol: "Cl⁻", x: 96, y: 136, r: 23, color: "#22c55e" },
      { symbol: "Na⁺", x: 176, y: 136, r: 18, color: "#a855f7" },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 1, to: 3, order: 1 },
      { from: 2, to: 3, order: 1 },
    ],
    note: "Electrostatic attraction between Na⁺ cations and Cl⁻ anions builds a rigid 3D alternating crystal.",
  },
];

export function computeKinematicsPoint(
  v0: number,
  a: number,
  t: number,
): {
  velocity: number;
  displacement: number;
} {
  return {
    velocity: Number((v0 + a * t).toFixed(2)),
    displacement: Number((v0 * t + 0.5 * a * t * t).toFixed(2)),
  };
}

export function computePendulumPeriod(lengthMeters: number, gravity = 9.81): number {
  const safeL = Math.max(0.1, lengthMeters);
  return Number((2 * Math.PI * Math.sqrt(safeL / gravity)).toFixed(2));
}

export function computeOhmsCircuit(params: {
  voltage: number;
  r1: number;
  r2: number;
  mode: "series" | "parallel";
}): {
  equivalentR: number;
  currentAmps: number;
  powerWatts: number;
} {
  const safeR1 = Math.max(1, params.r1);
  const safeR2 = Math.max(1, params.r2);
  const eq = params.mode === "series" ? safeR1 + safeR2 : (safeR1 * safeR2) / (safeR1 + safeR2);
  const current = params.voltage / eq;
  const power = params.voltage * current;
  return {
    equivalentR: Number(eq.toFixed(2)),
    currentAmps: Number(current.toFixed(3)),
    powerWatts: Number(power.toFixed(2)),
  };
}

export const EARTH_LAYERS = [
  {
    id: "plate_tectonics",
    title: "Plate Tectonics & Ring of Fire",
    source: "USGS Curated Summary",
    mechanism: "Convergent subduction, divergent mid-ocean ridges, and transform faults.",
    fact: "Approximately 90% of global earthquakes occur along tectonic plate boundaries.",
  },
  {
    id: "rock_cycle",
    title: "The Rock Cycle (Igneous -> Sedimentary -> Metamorphic)",
    source: "Curated Earth Science",
    mechanism:
      "Weathering, compaction/cementation, heat & pressure metamorphism, and magma melting.",
    fact: "Any rock type can transform into either of the other two classes over geological timescales.",
  },
  {
    id: "ocean_climate",
    title: "Ocean Thermohaline Currents & Climate",
    source: "NOAA / NASA Educational Summary",
    mechanism: "Temperature and salinity density gradients drive deep global conveyor circulation.",
    fact: "Oceans absorb over 90% of excess planetary thermal energy trapped by greenhouse gases.",
  },
];

export const WEATHER_VS_CLIMATE_CARDS = [
  {
    id: "wc_1",
    statement: "Kuwait City reached 47°C this Tuesday afternoon with dusty northwest winds.",
    answer: "weather" as const,
    why: "Describes short-term atmospheric conditions at a specific hour or day.",
  },
  {
    id: "wc_2",
    statement:
      "30-year NOAA records show Gulf summer average temperatures rose by ~1.5°C since 1980.",
    answer: "climate" as const,
    why: "Measures multi-decade statistical averages and long-term regional shifts.",
  },
  {
    id: "wc_3",
    statement: "A sudden cold front dropped 18 mm of rain in two hours over Amman.",
    answer: "weather" as const,
    why: "Single passing frontal precipitation event.",
  },
  {
    id: "wc_4",
    statement:
      "Mediterranean coastal regions typically experience dry summers and mild wet winters.",
    answer: "climate" as const,
    why: "Describes expected long-term seasonal patterns across decades.",
  },
];
