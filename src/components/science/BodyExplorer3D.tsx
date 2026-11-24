import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BODY_SYSTEMS, type BodySystemNode } from "@/data/science-world";
import { usePrefs } from "@/lib/preferences";

interface BodyExplorer3DProps {
  activeSystemId: BodySystemNode["id"];
  onSelectSystem: (id: BodySystemNode["id"]) => void;
}

export function BodyExplorer3D({ activeSystemId, onSelectSystem }: BodyExplorer3DProps) {
  const { ecosystem, lang } = usePrefs();
  const isAr = lang === "ar";
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglUnsupported, setWebglUnsupported] = useState(false);
  const [forceLoadInLowBw, setForceLoadInLowBw] = useState(false);

  const systemReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const reducedMotion = Boolean(ecosystem.scene3dReducedMotion || systemReduced);
  const shouldRender3D = (!ecosystem.lowBandwidth || forceLoadInLowBw) && !webglUnsupported;

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !shouldRender3D) return;

    const isJsdom = typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent);
    if (isJsdom || typeof WebGLRenderingContext === "undefined") {
      setWebglUnsupported(true);
      return;
    }

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const isConstrainedDevice =
      (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) ||
      Boolean(nav.connection?.saveData);

    let renderer: THREE.WebGLRenderer | null = null;
    let pmrem: THREE.PMREMGenerator | null = null;
    let controls: OrbitControls | null = null;
    let rafId = 0;
    let ro: ResizeObserver | null = null;
    let handlePointerDown: ((e: PointerEvent) => void) | null = null;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isConstrainedDevice,
        alpha: true,
        powerPreference: isConstrainedDevice ? "low-power" : "default",
      });

      const width = Math.max(container.clientWidth, 300);
      const height = Math.max(container.clientHeight, 320);

      const gl = renderer.getContext();
      const dbg = gl?.getExtension("WEBGL_debug_renderer_info");
      const glRenderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
      const isSoftware = /swiftshader|llvmpipe|software/i.test(glRenderer);
      renderer.setPixelRatio(
        isSoftware || isConstrainedDevice ? 1 : Math.min(window.devicePixelRatio || 1, 2),
      );
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0.65, 5.1);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.minDistance = 2.8;
      controls.maxDistance = 8.5;

      scene.add(new THREE.AmbientLight(0xffffff, 0.45));
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(4, 6, 5);
      scene.add(key);

      // Stylized transparent anatomical torso silhouette (clean educational geometry)
      const torsoGroup = new THREE.Group();
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.14,
        roughness: 0.2,
        transmission: 0.25,
        wireframe: false,
      });
      const spineMat = new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.45,
        metalness: 0.15,
      });

      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), glassMat);
      headMesh.position.set(0, 1.72, 0);
      torsoGroup.add(headMesh);

      const chestMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.25, 12, 24), glassMat);
      chestMesh.position.set(0, 0.45, 0);
      torsoGroup.add(chestMesh);

      const spineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.35, 14), spineMat);
      spineMesh.position.set(0, 0.35, -0.18);
      torsoGroup.add(spineMesh);

      const clickableMeshes: THREE.Mesh[] = [];
      const nodeRings: THREE.Mesh[] = [];

      BODY_SYSTEMS.forEach((sys) => {
        const isSelected = sys.id === activeSystemId;
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(sys.color),
          emissive: new THREE.Color(sys.color),
          emissiveIntensity: isSelected ? 0.55 : 0.18,
          roughness: 0.25,
          metalness: 0.2,
        });
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(isSelected ? 0.22 : 0.16, 20, 20),
          mat,
        );
        sphere.position.set(sys.xPos, sys.yPos, 0.26);
        sphere.userData = { systemId: sys.id };
        torsoGroup.add(sphere);
        clickableMeshes.push(sphere);

        if (isSelected) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.3, 0.025, 10, 32),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(sys.color) }),
          );
          ring.position.copy(sphere.position);
          torsoGroup.add(ring);
          nodeRings.push(ring);
        }
      });

      scene.add(torsoGroup);

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      handlePointerDown = (e: PointerEvent) => {
        if (!renderer) return;
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(clickableMeshes, false);
        const firstHit = hits[0];
        if (firstHit) {
          const sysId = firstHit.object.userData["systemId"] as BodySystemNode["id"] | undefined;
          if (sysId) onSelectSystem(sysId);
        }
      };
      renderer.domElement.addEventListener("pointerdown", handlePointerDown);

      const clock = new THREE.Clock();
      const animate = () => {
        rafId = window.requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();
        if (!reducedMotion) {
          torsoGroup.rotation.y = Math.sin(elapsed * 0.35) * 0.22;
          nodeRings.forEach((r) => {
            r.rotation.x = elapsed * 1.1;
            r.rotation.y = elapsed * 0.8;
          });
        }
        controls?.update();
        renderer?.render(scene, camera);
      };
      animate();

      ro = new ResizeObserver(() => {
        if (!container || !renderer) return;
        const w = Math.max(container.clientWidth, 300);
        const h = Math.max(container.clientHeight, 320);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      ro.observe(container);
    } catch {
      setWebglUnsupported(true);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      ro?.disconnect();
      if (handlePointerDown) {
        renderer?.domElement.removeEventListener("pointerdown", handlePointerDown);
      }
      controls?.dispose();
      pmrem?.dispose();
      renderer?.dispose();
    };
  }, [activeSystemId, onSelectSystem, reducedMotion, shouldRender3D]);

  if (!shouldRender3D) {
    return (
      <div className="rounded-xl border border-border bg-surface-2/80 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Cpu className="size-4 text-primary" />
            <span>
              {isAr
                ? "مخطط تشريحي ثنائي الأبعاد (وضع توفير البيانات / بديل WebGL)"
                : "2D Anatomical Schematic Fallback (Low-Bandwidth / WebGL Safe)"}
            </span>
          </div>
          {ecosystem.lowBandwidth && !webglUnsupported && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setForceLoadInLowBw(true)}
              className="h-7 text-xs"
            >
              {isAr ? "تحميل المجسم ثلاثي الأبعاد" : "Load 3D Explorer"}
            </Button>
          )}
        </div>

        <svg
          viewBox="0 0 260 280"
          className="w-full max-w-[260px] mx-auto block"
          role="img"
          aria-label="Human Body Systems Interactive Schematic"
        >
          <circle
            cx="130"
            cy="40"
            r="24"
            fill="currentColor"
            className="text-primary/15 stroke-primary/40"
            strokeWidth="1.5"
          />
          <rect
            x="86"
            y="72"
            width="88"
            height="128"
            rx="28"
            fill="currentColor"
            className="text-primary/10 stroke-primary/40"
            strokeWidth="1.5"
          />
          <line
            x1="130"
            y1="64"
            x2="130"
            y2="210"
            stroke="#94a3b8"
            strokeWidth="4"
            strokeDasharray="4 3"
          />
          {BODY_SYSTEMS.map((sys) => {
            const svgX = 130 + sys.xPos * 80;
            const svgY = 148 - sys.yPos * 56;
            const selected = sys.id === activeSystemId;
            return (
              <g key={sys.id} onClick={() => onSelectSystem(sys.id)} className="cursor-pointer">
                <circle
                  cx={svgX}
                  cy={svgY}
                  r={selected ? 13 : 9}
                  fill={sys.color}
                  opacity={selected ? 0.95 : 0.72}
                  stroke="#ffffff"
                  strokeWidth={selected ? 2.5 : 1}
                />
                <text
                  x={svgX}
                  y={svgY + 21}
                  textAnchor="middle"
                  className="fill-foreground text-[8px] font-semibold"
                >
                  {sys.nameEn.replace(" System", "")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={mountRef}
        className="h-[340px] w-full rounded-xl border border-border bg-gradient-to-b from-surface-2/80 to-surface-1 overflow-hidden cursor-grab active:cursor-grabbing"
      />
      <p className="text-[11px] text-muted-foreground text-center">
        {isAr
          ? "اسحب للتدوير · انقر على أي نقطة ملونة في المجسم لاستعراض الجهاز الحيوي"
          : "Drag to orbit · Click any glowing anatomical node to inspect that system"}
      </p>
    </div>
  );
}
