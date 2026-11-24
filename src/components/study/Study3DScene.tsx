import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Atom, ChevronDown, ChevronUp, Pause, Play, RotateCcw } from "lucide-react";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePrefs } from "@/lib/preferences";

export type StemSceneId = "bohr_atom" | "dna_helix" | "molecule_geometry" | "solar_system";

interface SceneMeta {
  id: StemSceneId;
  title: string;
  subject: string;
  summary: string;
  cameraPos: [number, number, number];
}

export const STEM_SCENES: readonly SceneMeta[] = [
  {
    id: "bohr_atom",
    title: "Carbon-12 Bohr Atom",
    subject: "Chemistry · Physics",
    summary:
      "6 protons (red) & 6 neutrons (slate) form the dense nucleus surrounded by K-shell (2 e⁻) and L-shell (4 valence e⁻) electron orbitals.",
    cameraPos: [0, 3.8, 7.6],
  },
  {
    id: "dna_helix",
    title: "DNA Double Helix",
    subject: "Biology",
    summary:
      "Antiparallel sugar-phosphate backbones linked by complementary hydrogen-bonded base pairs (A–T in amber/teal, C–G in indigo/emerald).",
    cameraPos: [4.2, 1.5, 6.2],
  },
  {
    id: "molecule_geometry",
    title: "H₂O Bent & CH₄ Tetrahedral Geometry",
    subject: "Molecular Chemistry",
    summary:
      "Water (104.5° bond angle with two lone-pair lobes) compared side-by-side against Methane's symmetric 109.5° tetrahedral sp³ geometry.",
    cameraPos: [0.5, 3.2, 7.2],
  },
  {
    id: "solar_system",
    title: "Inner Solar System & Ringed Giant",
    subject: "Astronomy · Physics",
    summary:
      "Concentric Keplerian orbital paths around an emissive star showing terrestrial planets, Earth-Moon system, and ringed Saturn.",
    cameraPos: [0, 6.4, 9.8],
  },
] as const;

interface AnimatedOrbitItem {
  mesh: THREE.Object3D;
  radius: number;
  speed: number;
  phase: number;
  inclination: number;
}

function buildStemSceneGroup(sceneId: StemSceneId): {
  group: THREE.Group;
  animatedOrbits: AnimatedOrbitItem[];
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
} {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const animatedOrbits: AnimatedOrbitItem[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  if (sceneId === "bohr_atom") {
    const protonMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.35, metalness: 0.2 }),
    );
    const neutronMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.45, metalness: 0.3 }),
    );
    const nucleonGeo = trackGeo(new THREE.SphereGeometry(0.24, 24, 24));

    const nucleus = new THREE.Group();
    nucleus.name = "Nucleus (6 Protons + 6 Neutrons)";
    const offsets: Array<[number, number, number, boolean]> = [
      [0.18, 0.14, 0.1, true],
      [-0.18, -0.14, 0.12, false],
      [-0.16, 0.16, -0.14, true],
      [0.16, -0.16, -0.14, false],
      [0, 0.24, -0.05, false],
      [0, -0.24, 0.08, true],
      [0.26, 0, -0.04, true],
      [-0.26, 0, 0.05, false],
      [0.08, 0.06, 0.26, false],
      [-0.08, -0.06, -0.26, true],
      [0.1, -0.2, 0.2, false],
      [-0.1, 0.2, 0.2, true],
    ];
    offsets.forEach(([x, y, z, isProton], idx) => {
      const m = new THREE.Mesh(nucleonGeo, isProton ? protonMat : neutronMat);
      m.position.set(x, y, z);
      m.userData["label"] = isProton ? `Proton #${idx + 1} (+1 charge)` : `Neutron #${idx + 1}`;
      nucleus.add(m);
    });
    group.add(nucleus);

    const ringMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
        opacity: 0.6,
      }),
    );
    const electronMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x14b8a6,
        emissive: 0x0d9488,
        emissiveIntensity: 0.85,
        roughness: 0.2,
      }),
    );
    const eGeo = trackGeo(new THREE.SphereGeometry(0.14, 20, 20));

    const shells = [
      { radius: 1.65, count: 2, tiltX: 0.35, tiltZ: 0.2, speed: 1.35, label: "K-Shell Electron" },
      {
        radius: 3.1,
        count: 4,
        tiltX: -0.42,
        tiltZ: -0.25,
        speed: 0.78,
        label: "Valence L-Shell Electron",
      },
    ];

    shells.forEach((shell) => {
      const torusGeo = trackGeo(new THREE.TorusGeometry(shell.radius, 0.025, 12, 72));
      const ring = new THREE.Mesh(torusGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + shell.tiltX;
      ring.rotation.z = shell.tiltZ;
      ring.userData["label"] = `${shell.label} Orbital (r=${shell.radius} Å rel.)`;
      group.add(ring);

      for (let i = 0; i < shell.count; i++) {
        const eMesh = new THREE.Mesh(eGeo, electronMat);
        eMesh.userData["label"] = `${shell.label} #${i + 1}`;
        group.add(eMesh);
        animatedOrbits.push({
          mesh: eMesh,
          radius: shell.radius,
          speed: shell.speed,
          phase: (Math.PI * 2 * i) / shell.count,
          inclination: shell.tiltX,
        });
      }
    });
  } else if (sceneId === "dna_helix") {
    const strandAMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x14b8a6, roughness: 0.35, metalness: 0.25 }),
    );
    const strandBMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.35, metalness: 0.25 }),
    );
    const pairMat1 = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.15 }),
    );
    const pairMat2 = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, metalness: 0.15 }),
    );
    const nodeGeo = trackGeo(new THREE.SphereGeometry(0.18, 20, 20));
    const rungGeo = trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 12));

    const steps = 12;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const y = (t - 0.5) * 5.2;
      const angle = t * Math.PI * 2.4;
      const r = 1.15;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      const nodeA = new THREE.Mesh(nodeGeo, strandAMat);
      nodeA.position.set(x, y, z);
      nodeA.userData["label"] = `5'→3' Sugar-Phosphate Backbone (${i + 1})`;
      group.add(nodeA);

      const nodeB = new THREE.Mesh(nodeGeo, strandBMat);
      nodeB.position.set(-x, y, -z);
      nodeB.userData["label"] = `3'→5' Sugar-Phosphate Backbone (${i + 1})`;
      group.add(nodeB);

      const rung = new THREE.Mesh(rungGeo, i % 2 === 0 ? pairMat1 : pairMat2);
      rung.position.set(0, y, 0);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -angle;
      rung.userData["label"] =
        i % 2 === 0 ? `Base Pair A=T (2 Hydrogen Bonds)` : `Base Pair C≡G (3 Hydrogen Bonds)`;
      group.add(rung);
    }
  } else if (sceneId === "molecule_geometry") {
    const oxygenMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.2 }),
    );
    const carbonMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.35 }),
    );
    const hydrogenMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.1 }),
    );
    const bondMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.4 }),
    );
    const lonePairMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45,
        roughness: 0.2,
      }),
    );

    const centralGeo = trackGeo(new THREE.SphereGeometry(0.5, 28, 28));
    const hGeo = trackGeo(new THREE.SphereGeometry(0.28, 24, 24));
    const bondGeo = trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 1.15, 16));
    const lobeGeo = trackGeo(new THREE.SphereGeometry(0.26, 18, 18));

    // Left: H2O Bent Molecule (104.5°)
    const waterGroup = new THREE.Group();
    waterGroup.position.set(-2.0, 0, 0);
    const ox = new THREE.Mesh(centralGeo, oxygenMat);
    ox.userData["label"] = "Oxygen Atom (H₂O Core · sp³)";
    waterGroup.add(ox);

    const halfAngle = (104.5 * Math.PI) / 360;
    [-1, 1].forEach((dir, idx) => {
      const dx = Math.sin(halfAngle) * dir;
      const dy = -Math.cos(halfAngle);
      const h = new THREE.Mesh(hGeo, hydrogenMat);
      h.position.set(dx * 1.3, dy * 1.3, 0);
      h.userData["label"] = `Hydrogen Atom #${idx + 1} (104.5° bent angle)`;
      waterGroup.add(h);

      const bond = new THREE.Mesh(bondGeo, bondMat);
      bond.position.set(dx * 0.65, dy * 0.65, 0);
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, 0));
      bond.userData["label"] = "Polar Covalent O–H Bond";
      waterGroup.add(bond);
    });

    [-0.45, 0.45].forEach((zOff, idx) => {
      const lobe = new THREE.Mesh(lobeGeo, lonePairMat);
      lobe.position.set(0, 0.68, zOff);
      lobe.userData["label"] = `Oxygen Lone Electron Pair #${idx + 1}`;
      waterGroup.add(lobe);
    });
    group.add(waterGroup);

    // Right: CH4 Tetrahedral Molecule (109.5°)
    const methaneGroup = new THREE.Group();
    methaneGroup.position.set(2.0, 0, 0);
    const carbon = new THREE.Mesh(centralGeo, carbonMat);
    carbon.userData["label"] = "Carbon Atom (CH₄ Tetrahedral Core · 109.5°)";
    methaneGroup.add(carbon);

    const tetraDirs: Array<[number, number, number]> = [
      [0, 1, 0],
      [0.9428, -0.3333, 0],
      [-0.4714, -0.3333, 0.8165],
      [-0.4714, -0.3333, -0.8165],
    ];
    tetraDirs.forEach((rawDir, idx) => {
      const vec = new THREE.Vector3(...rawDir).normalize();
      const h = new THREE.Mesh(hGeo, hydrogenMat);
      h.position.copy(vec).multiplyScalar(1.35);
      h.userData["label"] = `Tetrahedral Hydrogen #${idx + 1} (109.5°)`;
      methaneGroup.add(h);

      const bond = new THREE.Mesh(bondGeo, bondMat);
      bond.position.copy(vec).multiplyScalar(0.68);
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec);
      bond.userData["label"] = "Covalent C–H Bond (CH₄)";
      methaneGroup.add(bond);
    });
    group.add(methaneGroup);
  } else {
    // Solar System
    const sunGeo = trackGeo(new THREE.SphereGeometry(0.85, 32, 32));
    const sunMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 1.2,
        roughness: 0.3,
      }),
    );
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.userData["label"] = "Star (Sun — G2V Main Sequence)";
    group.add(sun);

    const orbitMat = trackMat(
      new THREE.MeshBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.45 }),
    );

    const planets = [
      { name: "Mercury", r: 1.4, size: 0.14, color: 0x94a3b8, speed: 1.8, phase: 0.2 },
      { name: "Venus", r: 2.0, size: 0.22, color: 0xfbbf24, speed: 1.3, phase: 1.4 },
      { name: "Earth", r: 2.8, size: 0.25, color: 0x3b82f6, speed: 0.95, phase: 2.9 },
      { name: "Mars", r: 3.6, size: 0.19, color: 0xef4444, speed: 0.72, phase: 4.3 },
      { name: "Saturn", r: 4.9, size: 0.4, color: 0xfcd34d, speed: 0.45, phase: 5.5, ringed: true },
    ];

    planets.forEach((p) => {
      const orbitGeo = trackGeo(new THREE.TorusGeometry(p.r, 0.015, 8, 84));
      const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
      orbitMesh.rotation.x = Math.PI / 2;
      orbitMesh.userData["label"] = `${p.name} Orbital Path`;
      group.add(orbitMesh);

      const planetHolder = new THREE.Group();
      const pGeo = trackGeo(new THREE.SphereGeometry(p.size, 24, 24));
      const pMat = trackMat(new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.5 }));
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.userData["label"] = `${p.name} (Orbit radius: ${p.r} AU rel.)`;
      planetHolder.add(pMesh);

      if (p.ringed) {
        const satRingGeo = trackGeo(new THREE.RingGeometry(0.55, 0.85, 36));
        const satRingMat = trackMat(
          new THREE.MeshStandardMaterial({
            color: 0xfde68a,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.75,
          }),
        );
        const satRing = new THREE.Mesh(satRingGeo, satRingMat);
        satRing.rotation.x = Math.PI / 2.4;
        satRing.userData["label"] = "Saturn Planetary Ring System";
        planetHolder.add(satRing);
      }

      group.add(planetHolder);
      animatedOrbits.push({
        mesh: planetHolder,
        radius: p.r,
        speed: p.speed,
        phase: p.phase,
        inclination: 0,
      });
    });
  }

  return { group, animatedOrbits, geometries, materials };
}

export function Study3DScene() {
  const { t, ecosystem, setEcosystem } = usePrefs();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<StemSceneId>("bohr_atom");
  const [paused, setPaused] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [inspectedPart, setInspectedPart] = useState<string | null>(null);
  const [webglUnsupported, setWebglUnsupported] = useState(false);
  const [forceLoad3d, setForceLoad3d] = useState(false);

  const systemReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const reducedMotion = Boolean(
    ecosystem.scene3dReducedMotion || ecosystem.lowBandwidth || systemReduced,
  );
  const effectivePaused = paused || reducedMotion;
  const deferForBandwidth = Boolean(ecosystem.lowBandwidth && !forceLoad3d);

  const resetCamRef = useRef<(() => void) | null>(null);
  const pausedRef = useRef(effectivePaused);
  pausedRef.current = effectivePaused;

  const activeMeta = STEM_SCENES.find((s) => s.id === activeSceneId) ?? STEM_SCENES[0]!;

  useEffect(() => {
    if (deferForBandwidth) return;
    const host = containerRef.current;
    if (!host) return;
    setInspectedPart(null);

    const isJsdom = typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent);
    if (isJsdom || typeof WebGLRenderingContext === "undefined") {
      setWebglUnsupported(true);
      return undefined;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    let envRT: THREE.WebGLRenderTarget | null = null;
    let controls: OrbitControls | null = null;
    let rafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const { group, animatedOrbits, geometries, materials } = buildStemSceneGroup(activeSceneId);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      const gl = renderer.getContext();
      const debugExt = gl.getExtension("WEBGL_debug_renderer_info");
      const gpuName = debugExt ? String(gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL)) : "";
      const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(gpuName);
      if (isSoftwareGl) {
        renderer.setPixelRatio(1);
      } else {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      }
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;

      const width = Math.max(host.clientWidth, 320);
      const height = Math.max(host.clientHeight, 360);
      renderer.setSize(width, height);
      host.innerHTML = "";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0b1220);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const envScene = new RoomEnvironment();
      envRT = pmrem.fromScene(envScene);
      scene.environment = envRT.texture;
      pmrem.dispose();
      envScene.dispose();

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
      keyLight.position.set(5, 7, 6);
      scene.add(keyLight);
      scene.add(new THREE.AmbientLight(0x94a3b8, 0.45));
      scene.add(group);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(...activeMeta.cameraPos);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 2.5;
      controls.maxDistance = 18;
      controls.target.set(0, 0, 0);

      resetCamRef.current = () => {
        camera.position.set(...activeMeta.cameraPos);
        controls?.target.set(0, 0, 0);
        controls?.update();
      };

      const renderFrame = () => {
        renderer?.render(scene, camera);
      };

      let lastTime = performance.now();
      let simElapsed = 0;

      const positionOrbits = (timeSec: number) => {
        animatedOrbits.forEach((item) => {
          const theta = timeSec * item.speed + item.phase;
          const x = Math.cos(theta) * item.radius;
          const z = Math.sin(theta) * item.radius;
          const y = Math.sin(theta) * Math.sin(item.inclination) * item.radius;
          item.mesh.position.set(x, y, z);
        });
      };
      positionOrbits(0);

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const onPointerDown = (ev: PointerEvent) => {
        if (!renderer) return;
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(group.children, true);
        const firstLabeled = hits.find((h) => typeof h.object.userData?.["label"] === "string");
        if (firstLabeled) {
          setInspectedPart(String(firstLabeled.object.userData["label"]));
        }
      };
      renderer.domElement.addEventListener("pointerdown", onPointerDown);

      let needsDraw = true;
      const onControlsChange = () => {
        needsDraw = true;
      };
      controls.addEventListener("change", onControlsChange);

      resizeObserver = new ResizeObserver(() => {
        if (!host || !renderer) return;
        const w = Math.max(host.clientWidth, 320);
        const h = Math.max(host.clientHeight, 360);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        needsDraw = true;
      });
      resizeObserver.observe(host);

      const loop = (now: number) => {
        rafId = window.requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        if (!pausedRef.current) {
          simElapsed += dt;
          positionOrbits(simElapsed);
          if (activeSceneId === "dna_helix") {
            group.rotation.y = THREE.MathUtils.damp(group.rotation.y, simElapsed * 0.45, 5, dt);
          }
          needsDraw = true;
        }

        if (controls?.update()) {
          needsDraw = true;
        }

        if (needsDraw) {
          renderFrame();
          needsDraw = false;
        }
      };
      rafId = window.requestAnimationFrame(loop);

      return () => {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        resizeObserver?.disconnect();
        renderer?.domElement.removeEventListener("pointerdown", onPointerDown);
        controls?.removeEventListener("change", onControlsChange);
        controls?.dispose();
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
        envRT?.dispose();
        renderer?.dispose();
      };
    } catch {
      setWebglUnsupported(true);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      return undefined;
    }
  }, [activeSceneId, activeMeta, deferForBandwidth]);

  return (
    <div className="surface-card space-y-4 border-primary/25 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Atom className="size-4" />
            <h2 className="font-display text-base font-bold text-foreground">
              {t("p5.study3d.title")}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("p5.study3d.sub")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FeatureGuideTrigger featureId="study-3d-lab" />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch
              checked={ecosystem.scene3dReducedMotion}
              onCheckedChange={(v) => setEcosystem({ scene3dReducedMotion: v })}
            />
            <span>{t("p5.study3d.reducedMotion")}</span>
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setPaused((p) => !p)}
            className="h-8 text-xs"
          >
            {effectivePaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            <span>{effectivePaused ? "Resume" : "Pause"}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => resetCamRef.current?.()}
            className="h-8 text-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset View</span>
          </Button>
        </div>
      </div>

      {/* Model Switcher */}
      <div className="flex flex-wrap gap-1.5">
        {STEM_SCENES.map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => setActiveSceneId(sc.id)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeSceneId === sc.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            {sc.title}
          </button>
        ))}
      </div>

      {deferForBandwidth ? (
        <div className="space-y-3 rounded-xl border border-primary/30 bg-surface-2 p-6 text-center text-xs">
          <div className="font-display text-sm font-bold text-foreground">{activeMeta.title}</div>
          <div className="text-[11px] font-semibold text-primary">{activeMeta.subject}</div>
          <p className="mx-auto max-w-xl leading-relaxed text-muted-foreground">
            {activeMeta.summary}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Low-Bandwidth Mode paused automatic WebGL rendering to save battery and data.
          </p>
          <Button
            type="button"
            size="sm"
            variant="glow"
            onClick={() => setForceLoad3d(true)}
            className="text-xs"
          >
            Load Interactive 3D Canvas
          </Button>
        </div>
      ) : webglUnsupported ? (
        <div
          role="alert"
          className="rounded-xl border border-xp/40 bg-xp/10 p-6 text-center text-xs text-foreground"
        >
          Interactive 3D rendering requires WebGL, which is unavailable or disabled on this device.
          <div className="mt-2 text-muted-foreground">{activeMeta.summary}</div>
        </div>
      ) : (
        <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-border bg-[#0b1220]">
          <div ref={containerRef} className="h-full w-full" aria-label={activeMeta.title} />

          {/* Collapsible Educational Inspector Dock */}
          <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-border/80 bg-background/90 p-3 text-xs backdrop-blur-md">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-bold text-primary">{activeMeta.subject}</span>
                <span className="mx-1.5 text-muted-foreground">·</span>
                <span className="font-semibold text-foreground">{activeMeta.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setDockCollapsed((c) => !c)}
                className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[0.7rem] text-muted-foreground hover:text-foreground"
                aria-label="Toggle info dock"
              >
                {dockCollapsed ? (
                  <>
                    <span>Details</span>
                    <ChevronUp className="size-3.5" />
                  </>
                ) : (
                  <>
                    <span>Hide</span>
                    <ChevronDown className="size-3.5" />
                  </>
                )}
              </button>
            </div>
            {!dockCollapsed && (
              <div className="mt-1.5 space-y-1">
                <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
                  {activeMeta.summary}
                </p>
                {inspectedPart && (
                  <p className="font-medium text-primary">Selected component: {inspectedPart}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
