import { useMemo, useState } from "react";
import { CheckCircle2, Compass, Eye, GitBranch, SlidersHorizontal } from "lucide-react";
import {
  KNOWLEDGE_GRAPH_NODES,
  findPrerequisiteGaps,
  type KnowledgeNode,
} from "@/lib/learning-intelligence";

export function VisualConceptExplorer({
  masteredNodeIds,
  onToggleMasteredNode,
}: {
  masteredNodeIds: string[];
  onToggleMasteredNode: (nodeId: string) => void;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("kn_linear_equations");
  const [visualModel, setVisualModel] = useState<"linear_slope" | "forgetting_decay">(
    "linear_slope",
  );
  const [slopeM, setSlopeM] = useState<number>(2);
  const [interceptB, setInterceptB] = useState<number>(1);
  const [reviewCountS, setReviewCountS] = useState<number>(2);

  const selectedNode: KnowledgeNode = useMemo(
    () => KNOWLEDGE_GRAPH_NODES.find((n) => n.id === selectedNodeId) ?? KNOWLEDGE_GRAPH_NODES[0]!,
    [selectedNodeId],
  );

  const gapReport = useMemo(
    () => findPrerequisiteGaps(selectedNode.id, masteredNodeIds),
    [selectedNode.id, masteredNodeIds],
  );

  // Recommend what to learn next: first non-mastered node whose prerequisites are mastered
  const nextRecommendedNodes = useMemo(() => {
    const mastered = new Set(masteredNodeIds);
    return KNOWLEDGE_GRAPH_NODES.filter(
      (n) => !mastered.has(n.id) && n.prerequisites.every((pre) => mastered.has(pre)),
    ).slice(0, 3);
  }, [masteredNodeIds]);

  const byId = useMemo(() => new Map(KNOWLEDGE_GRAPH_NODES.map((n) => [n.id, n])), []);

  // Visual coordinate mapping for linear equation y = mx + b on x in [-3..3]
  const linePoints = useMemo(() => {
    const x1 = -3;
    const x2 = 3;
    const y1 = slopeM * x1 + interceptB;
    const y2 = slopeM * x2 + interceptB;
    const toSvgX = (x: number) => 120 + x * 30;
    const toSvgY = (y: number) => 90 - y * 10;
    return {
      x1: toSvgX(x1),
      y1: toSvgY(y1),
      x2: toSvgX(x2),
      y2: toSvgY(y2),
      yAt0: toSvgY(interceptB),
      yAt2: toSvgY(slopeM * 2 + interceptB),
    };
  }, [slopeM, interceptB]);

  const decayPath = useMemo(() => {
    const stability = 2 * Math.pow(1.85, reviewCountS);
    const pts: string[] = [];
    for (let day = 0; day <= 14; day += 1) {
      const retention = Math.exp(-day / stability) * 100;
      const sx = 24 + (day / 14) * 212;
      const sy = 140 - (retention / 100) * 110;
      pts.push(`${day === 0 ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }
    const day7Pct = Math.round(Math.exp(-7 / stability) * 100);
    return { path: pts.join(" "), stability: Math.round(stability * 10) / 10, day7Pct };
  }, [reviewCountS]);

  return (
    <div className="space-y-5 text-xs">
      {/* PART A: VISUAL KNOWLEDGE CONNECTION MAP */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="surface-card space-y-3 p-5 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <GitBranch className="size-4 text-primary" />
                Visual Knowledge Connection Map (11 Core Nodes)
              </h3>
              <p className="text-muted-foreground">
                Inspect prerequisite links across English, Math, Science &amp; Coding. Click any
                node to trace dependencies or toggle mastery.
              </p>
            </div>
            <span className="font-mono text-primary font-semibold">
              {masteredNodeIds.length}/{KNOWLEDGE_GRAPH_NODES.length} mastered
            </span>
          </div>

          {/* Interactive SVG Node-Edge Graph */}
          <div className="rounded-xl border border-border bg-surface-2 p-2 overflow-x-auto">
            <svg
              viewBox="0 0 800 380"
              className="w-full min-w-[560px] h-auto"
              role="img"
              aria-label="Interactive prerequisite knowledge connection graph"
            >
              {/* Prerequisite edges */}
              {KNOWLEDGE_GRAPH_NODES.flatMap((node) =>
                node.prerequisites.map((preId) => {
                  const pre = byId.get(preId);
                  if (!pre) return null;
                  const highlighted = node.id === selectedNode.id || pre.id === selectedNode.id;
                  return (
                    <line
                      key={`${pre.id}->${node.id}`}
                      x1={(pre.xPct / 100) * 800}
                      y1={(pre.yPct / 100) * 380}
                      x2={(node.xPct / 100) * 800}
                      y2={(node.yPct / 100) * 380}
                      stroke={highlighted ? "hsl(var(--primary))" : "hsl(var(--border))"}
                      strokeWidth={highlighted ? 2.5 : 1.5}
                      strokeDasharray={masteredNodeIds.includes(pre.id) ? undefined : "5 4"}
                    />
                  );
                }),
              )}

              {/* Graph Nodes */}
              {KNOWLEDGE_GRAPH_NODES.map((node) => {
                const cx = (node.xPct / 100) * 800;
                const cy = (node.yPct / 100) * 380;
                const mastered = masteredNodeIds.includes(node.id);
                const selected = node.id === selectedNode.id;
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={cx - 72}
                      y={cy - 22}
                      width={144}
                      height={44}
                      rx={10}
                      fill={
                        selected
                          ? "hsl(var(--primary) / 0.18)"
                          : mastered
                            ? "hsl(var(--success) / 0.12)"
                            : "hsl(var(--surface))"
                      }
                      stroke={
                        selected
                          ? "hsl(var(--primary))"
                          : mastered
                            ? "hsl(var(--success))"
                            : "hsl(var(--border))"
                      }
                      strokeWidth={selected ? 2.2 : 1.4}
                    />
                    <text
                      x={cx}
                      y={cy - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="700"
                      fill="hsl(var(--primary))"
                    >
                      {node.subject.toUpperCase()} {mastered ? "· ✓" : ""}
                    </text>
                    <text
                      x={cx}
                      y={cy + 11}
                      textAnchor="middle"
                      fontSize="10.5"
                      fontWeight="600"
                      fill="hsl(var(--foreground))"
                    >
                      {node.title.length > 22 ? `${node.title.slice(0, 20)}…` : node.title}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Details & What to Learn Next */}
        <div className="surface-card space-y-4 p-5 lg:col-span-4">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase text-primary">
              {selectedNode.subject} · {selectedNode.level}
            </div>
            <h4 className="font-display text-sm font-bold text-foreground">{selectedNode.title}</h4>
            <p className="text-muted-foreground leading-relaxed">
              {selectedNode.whyConnected ?? selectedNode.studyTip}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleMasteredNode(selectedNode.id)}
            className={`flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 font-semibold transition-colors ${
              masteredNodeIds.includes(selectedNode.id)
                ? "border-success/50 bg-success/10 text-success"
                : "border-primary/40 bg-primary/10 text-primary"
            }`}
          >
            <CheckCircle2 className="size-4" />
            <span>
              {masteredNodeIds.includes(selectedNode.id)
                ? "Mastered (Click to Unmark)"
                : "Mark Concept Mastered"}
            </span>
          </button>

          <div className="space-y-2 border-t border-border pt-3">
            <div className="font-semibold text-foreground">
              Prerequisite Readiness ({gapReport.missingChain.length} missing)
            </div>
            {gapReport.ready ? (
              <p className="rounded-lg border border-success/40 bg-success/10 p-2.5 text-success font-medium">
                All foundation steps before this concept are satisfied!
              </p>
            ) : (
              <div className="space-y-1.5">
                {gapReport.missingChain.map((pre, idx) => (
                  <button
                    key={pre.id}
                    type="button"
                    onClick={() => setSelectedNodeId(pre.id)}
                    className="w-full rounded-lg border border-border bg-surface-2 p-2 text-start hover:border-primary/40"
                  >
                    <div className="font-semibold text-foreground">
                      {idx + 1}. Fix First: {pre.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{pre.studyTip}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Compass className="size-3.5 text-primary" />
              <span>What to Learn Next</span>
            </div>
            {nextRecommendedNodes.length === 0 ? (
              <p className="text-muted-foreground">
                Every node on the map is mastered—excellent synthesis across domains!
              </p>
            ) : (
              <div className="space-y-1.5">
                {nextRecommendedNodes.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setSelectedNodeId(n.id)}
                    className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-start hover:border-primary/40"
                  >
                    <span className="font-semibold text-primary">{n.subject}: </span>
                    <span className="font-medium text-foreground">{n.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PART B: #24 EXPLAIN IT VISUALLY INTERACTIVE SANDBOX */}
      <div className="surface-card space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Eye className="size-4 text-primary" />
              Explain It Visually — Interactive Conceptual Models
            </h3>
            <p className="text-muted-foreground">
              Manipulate parameters directly to see cause-and-effect dynamics instead of memorizing
              static formulas.
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setVisualModel("linear_slope")}
              className={`rounded-lg border px-3 py-1.5 font-medium ${
                visualModel === "linear_slope"
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface-2 text-muted-foreground"
              }`}
            >
              Linear Slope (y = mx + b)
            </button>
            <button
              type="button"
              onClick={() => setVisualModel("forgetting_decay")}
              className={`rounded-lg border px-3 py-1.5 font-medium ${
                visualModel === "forgetting_decay"
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface-2 text-muted-foreground"
              }`}
            >
              Spaced Memory Curve
            </button>
          </div>
        </div>

        {visualModel === "linear_slope" ? (
          <div className="grid gap-5 md:grid-cols-2 items-center">
            <div className="rounded-xl border border-border bg-surface-2 p-3 flex justify-center">
              <svg
                viewBox="0 0 240 180"
                className="w-full max-w-[320px] h-auto"
                aria-label="Interactive slope visualizer"
              >
                <line
                  x1="20"
                  y1="90"
                  x2="220"
                  y2="90"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                <line
                  x1="120"
                  y1="10"
                  x2="120"
                  y2="170"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                <line
                  x1={linePoints.x1}
                  y1={linePoints.y1}
                  x2={linePoints.x2}
                  y2={linePoints.y2}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.8"
                />
                <circle cx="120" cy={linePoints.yAt0} r="4" fill="hsl(var(--xp))" />
                <circle cx="180" cy={linePoints.yAt2} r="4" fill="hsl(var(--success))" />
                <text x="126" y={linePoints.yAt0 - 4} fontSize="9" fill="hsl(var(--foreground))">
                  b={interceptB}
                </text>
              </svg>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 font-mono text-sm font-bold text-primary">
                y = {slopeM}x {interceptB >= 0 ? `+ ${interceptB}` : `- ${Math.abs(interceptB)}`}
              </div>
              <label className="block space-y-1">
                <span className="flex items-center justify-between font-medium text-foreground">
                  <span className="inline-flex items-center gap-1">
                    <SlidersHorizontal className="size-3.5 text-primary" /> Slope (rate m):
                  </span>
                  <span className="font-mono">{slopeM}</span>
                </span>
                <input
                  type="range"
                  min={-3}
                  max={3}
                  step={1}
                  value={slopeM}
                  onChange={(e) => setSlopeM(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </label>
              <label className="block space-y-1">
                <span className="flex items-center justify-between font-medium text-foreground">
                  <span>Y-Intercept (starting value b):</span>
                  <span className="font-mono">{interceptB}</span>
                </span>
                <input
                  type="range"
                  min={-4}
                  max={4}
                  step={1}
                  value={interceptB}
                  onChange={(e) => setInterceptB(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </label>
              <p className="text-muted-foreground leading-relaxed">
                Notice: Changing <strong>m</strong> tilts steepness (negative slopes tilt downward),
                while changing <strong>b</strong> shifts the whole line up/down where it crosses x =
                0.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 items-center">
            <div className="rounded-xl border border-border bg-surface-2 p-3 flex justify-center">
              <svg
                viewBox="0 0 260 165"
                className="w-full max-w-[340px] h-auto"
                aria-label="Memory retention decay visual"
              >
                <line
                  x1="24"
                  y1="140"
                  x2="240"
                  y2="140"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                <line
                  x1="24"
                  y1="20"
                  x2="24"
                  y2="140"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                <path
                  d={decayPath.path}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.8"
                />
                <text x="150" y="34" fontSize="9" fill="hsl(var(--primary))">
                  Day 7 recall: {decayPath.day7Pct}%
                </text>
              </svg>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 font-mono text-sm font-bold text-primary">
                Stability S = {decayPath.stability} days · Day 7 Recall ≈ {decayPath.day7Pct}%
              </div>
              <label className="block space-y-1">
                <span className="flex items-center justify-between font-medium text-foreground">
                  <span>Completed Spaced Reviews:</span>
                  <span className="font-mono">{reviewCountS}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={reviewCountS}
                  onChange={(e) => setReviewCountS(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </label>
              <p className="text-muted-foreground leading-relaxed">
                Each active recall session flattens the decay slope dramatically. One single check
                drops quickly; 3+ spaced checks keep recall strong past a week!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
