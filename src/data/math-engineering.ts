export type MathFunctionKind = "linear" | "quadratic" | "sine" | "exponential";

export function evaluateFunctionY(
  kind: MathFunctionKind,
  x: number,
  a: number,
  b: number,
  c: number,
): number {
  switch (kind) {
    case "linear":
      return a * x + b;
    case "quadratic":
      return a * x * x + b * x + c;
    case "sine":
      return a * Math.sin(b * x) + c;
    case "exponential":
      return a * Math.exp(Math.max(-3, Math.min(3, b * x * 0.35))) + c;
  }
}

export function computeFunctionSummary(
  kind: MathFunctionKind,
  a: number,
  b: number,
  c: number,
): string {
  switch (kind) {
    case "linear":
      return `Slope m = ${a.toFixed(1)}, y-intercept = ${b.toFixed(1)}${a !== 0 ? `, root x = ${(-b / a).toFixed(2)}` : ""}`;
    case "quadratic": {
      if (Math.abs(a) < 1e-6) return `Degenerate linear (${b.toFixed(1)}x + ${c.toFixed(1)})`;
      const vx = -b / (2 * a);
      const vy = a * vx * vx + b * vx + c;
      const disc = b * b - 4 * a * c;
      const rootLabel =
        disc < 0
          ? "no real roots"
          : disc === 0
            ? `1 root x = ${vx.toFixed(2)}`
            : `roots x = ${((-b - Math.sqrt(disc)) / (2 * a)).toFixed(2)}, ${((-b + Math.sqrt(disc)) / (2 * a)).toFixed(2)}`;
      return `Vertex (${vx.toFixed(2)}, ${vy.toFixed(2)}) · ${rootLabel}`;
    }
    case "sine":
      return `Amplitude |${a.toFixed(1)}|, angular freq ${b.toFixed(1)}, vertical shift ${c.toFixed(1)}`;
    case "exponential":
      return `${b >= 0 ? "Growth" : "Decay"} base scaling a = ${a.toFixed(1)}, asymptote y = ${c.toFixed(1)}`;
  }
}

export function computeGeometryMetrics(
  shape: "triangle" | "circle" | "rectangle" | "cylinder",
  dimA: number,
  dimB: number,
): { areaLabel: string; perimeterOrVolumeLabel: string } {
  const a = Math.max(1, dimA);
  const b = Math.max(1, dimB);
  switch (shape) {
    case "triangle": {
      const area = 0.5 * a * b;
      const hyp = Math.sqrt(a * a + b * b);
      const perimeter = a + b + hyp;
      return {
        areaLabel: `${area.toFixed(1)} cm²`,
        perimeterOrVolumeLabel: `Perimeter ${perimeter.toFixed(1)} cm`,
      };
    }
    case "circle": {
      const area = Math.PI * a * a;
      const circ = 2 * Math.PI * a;
      return {
        areaLabel: `${area.toFixed(1)} cm²`,
        perimeterOrVolumeLabel: `Circumference ${circ.toFixed(1)} cm`,
      };
    }
    case "rectangle": {
      const area = a * b;
      const perimeter = 2 * (a + b);
      return {
        areaLabel: `${area.toFixed(1)} cm²`,
        perimeterOrVolumeLabel: `Perimeter ${perimeter.toFixed(1)} cm`,
      };
    }
    case "cylinder": {
      const sa = 2 * Math.PI * a * (a + b);
      const vol = Math.PI * a * a * b;
      return {
        areaLabel: `Surface ${sa.toFixed(1)} cm²`,
        perimeterOrVolumeLabel: `Volume ${vol.toFixed(1)} cm³`,
      };
    }
  }
}

export function computeStatistics(values: number[]): {
  count: number;
  mean: number;
  median: number;
  modes: number[];
  range: number;
  min: number;
  max: number;
} {
  if (values.length === 0) {
    return { count: 0, mean: 0, median: 0, modes: [], range: 0, min: 0, max: 0 };
  }
  const sorted = [...values].sort((x, y) => x - y);
  const count = sorted.length;
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = Number((sum / count).toFixed(2));
  const mid = Math.floor(count / 2);
  const median =
    count % 2 === 1 ? sorted[mid]! : Number(((sorted[mid - 1]! + sorted[mid]!) / 2).toFixed(2));

  const freq = new Map<number, number>();
  let maxFreq = 0;
  for (const v of sorted) {
    const next = (freq.get(v) ?? 0) + 1;
    freq.set(v, next);
    if (next > maxFreq) maxFreq = next;
  }
  const modes =
    maxFreq > 1
      ? Array.from(freq.entries())
          .filter(([, f]) => f === maxFreq)
          .map(([v]) => v)
      : [];
  const min = sorted[0]!;
  const max = sorted[count - 1]!;
  return {
    count,
    mean,
    median,
    modes,
    range: Number((max - min).toFixed(2)),
    min,
    max,
  };
}

export interface TrussBridgeEvaluation {
  materialCost: number;
  safeLoadCapacityKg: number;
  utilizationPct: number;
  passed: boolean;
  failureDiagnosis: string;
}

export function evaluateTrussBridge(params: {
  spanMeters: number;
  trianglesCount: number;
  material: "balsa" | "aluminum" | "steel";
  appliedLoadKg: number;
  budgetLimit: number;
}): TrussBridgeEvaluation {
  const matFactors = {
    balsa: { costPerUnit: 8, strengthMultiplier: 1.0 },
    aluminum: { costPerUnit: 18, strengthMultiplier: 2.4 },
    steel: { costPerUnit: 30, strengthMultiplier: 4.1 },
  };
  const spec = matFactors[params.material];
  const materialCost = Math.round(
    (params.spanMeters * 2 + params.trianglesCount * 3) * spec.costPerUnit,
  );
  const geometryEfficiency =
    Math.min(1.6, 0.55 + params.trianglesCount * 0.14) * (16 / Math.max(8, params.spanMeters));
  const safeLoadCapacityKg = Math.round(110 * spec.strengthMultiplier * geometryEfficiency);
  const utilizationPct = Math.round((params.appliedLoadKg / Math.max(1, safeLoadCapacityKg)) * 100);
  const withinBudget = materialCost <= params.budgetLimit;
  const passed = params.appliedLoadKg <= safeLoadCapacityKg && withinBudget;

  let failureDiagnosis = "Structure carries target load within safety margin and budget.";
  if (!withinBudget && params.appliedLoadKg > safeLoadCapacityKg) {
    failureDiagnosis = "Exceeded both budget ceiling and bending/buckling capacity.";
  } else if (!withinBudget) {
    failureDiagnosis = `Over budget (${materialCost} > ${params.budgetLimit} credits) — reduce span or choose lighter material.`;
  } else if (params.appliedLoadKg > safeLoadCapacityKg) {
    failureDiagnosis =
      "Mid-span truss buckling under load — add triangulation gussets or stronger alloy.";
  }

  return {
    materialCost,
    safeLoadCapacityKg,
    utilizationPct,
    passed,
    failureDiagnosis,
  };
}

export function computeLeverAdvantage(
  effortArmCm: number,
  loadArmCm: number,
  loadMassKg: number,
): {
  mechanicalAdvantage: number;
  requiredEffortKg: number;
} {
  const ma = effortArmCm / Math.max(5, loadArmCm);
  return {
    mechanicalAdvantage: Number(ma.toFixed(2)),
    requiredEffortKg: Number((loadMassKg / ma).toFixed(2)),
  };
}
