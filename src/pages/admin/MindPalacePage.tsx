import { useQuery } from '@tanstack/react-query';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Stars } from '@react-three/drei';
import {
  useMemo,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
  type ComponentRef,
} from 'react';
import { Brain, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { vaultPrimitivesService } from '@/services/knowledge-vault/vault-primitives.service';
import { ROUTES } from '@/routes';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type OrbitControlsHandle = ComponentRef<typeof OrbitControls>;

interface Cluster {
  area: string;
  itemCount: number;
  children: Array<{ id: string; title: string; type: string }>;
}

function fibSpherePositions(count: number, scale: number): [number, number, number][] {
  if (count <= 0) return [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const out: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1 || 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    out.push([Math.cos(theta) * r * scale, y * scale, Math.sin(theta) * r * scale]);
  }
  return out;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function threadPoints(
  from: THREE.Vector3,
  to: THREE.Vector3,
  bulge: number,
  segments: number
): THREE.Vector3[] {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  const dir = to.clone().sub(from);
  if (dir.lengthSq() < 1e-6) return [from.clone(), to.clone()];
  const perp = new THREE.Vector3(-dir.z, dir.y * 0.15, dir.x).normalize();
  mid.add(perp.multiplyScalar(bulge * dir.length() * 0.35));
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  return curve.getPoints(segments);
}

function hexToRgb(hexLike: string): THREE.Color {
  const c = new THREE.Color();
  try {
    c.set(hexLike);
  } catch {
    c.set('#7c6cf0');
  }
  return c;
}

function CameraAndControlsRig({
  expanded,
  controlsRef,
}: {
  expanded: boolean;
  controlsRef: React.RefObject<OrbitControlsHandle | null>;
}) {
  const { camera } = useThree();
  const microWeight = useRef(0);

  useFrame((_, delta) => {
    const target = expanded ? 1 : 0;
    microWeight.current += (target - microWeight.current) * (1 - Math.exp(-5.5 * delta));
    const t = easeOutCubic(microWeight.current);

    const macroPos = new THREE.Vector3(0, 2.1, 8.4);
    const microPos = new THREE.Vector3(0, 0.85, 6.2);
    camera.position.lerpVectors(macroPos, microPos, t);

    const look = new THREE.Vector3(0, t * 0.12, 0);
    camera.lookAt(look);

    const ctrl = controlsRef.current as unknown as {
      target: THREE.Vector3;
      update: () => void;
    } | null;
    if (ctrl?.target) {
      ctrl.target.lerp(look, 0.12);
      ctrl.update();
    }
  });

  return null;
}

function MacroSphere({
  position,
  radius,
  label,
  color,
  onClick,
  floatPhase,
  dimmed,
}: {
  position: [number, number, number];
  radius: number;
  label: string;
  color: string;
  onClick: () => void;
  floatPhase: number;
  dimmed: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const c = useMemo(() => hexToRgb(color), [color]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime * 0.55 + floatPhase;
    group.current.position.set(position[0], position[1] + Math.sin(t) * 0.08, position[2]);
  });

  return (
    <group ref={group}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[radius * 1.06, 48, 48]} />
        <meshStandardMaterial
          color={c}
          emissive={c}
          emissiveIntensity={dimmed ? 0.08 : 0.45}
          transparent
          opacity={dimmed ? 0.22 : 0.72}
          roughness={0.28}
          metalness={0.35}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius, 40, 40]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive={c}
          emissiveIntensity={dimmed ? 0.05 : 0.22}
          transparent
          opacity={dimmed ? 0.15 : 0.88}
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>
      <pointLight
        position={[0, 0, radius * 0.6]}
        intensity={dimmed ? 0.15 : 1.1}
        distance={4}
        color={c}
      />
      <Text
        position={[0, radius + 0.42, 0]}
        fontSize={0.26}
        color="#f1f5f9"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#020617"
      >
        {label.length > 20 ? `${label.slice(0, 18)}…` : label}
      </Text>
    </group>
  );
}

function ItemSphere({
  position,
  label,
  onClick,
  accent,
  growBlendRef,
  index,
  total,
}: {
  position: [number, number, number];
  label: string;
  onClick: () => void;
  accent: THREE.Color;
  growBlendRef: React.MutableRefObject<number>;
  index: number;
  total: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const grow = growBlendRef.current;
    const stagger = total > 0 ? (index / total) * 0.38 : 0;
    const denom = Math.max(1e-6, 1 - stagger * 0.6);
    const localGrow = Math.min(1, Math.max(0, (grow - stagger) / denom));
    const eased = easeOutCubic(localGrow);
    if (groupRef.current) {
      groupRef.current.position.set(position[0] * eased, position[1] * eased, position[2] * eased);
      groupRef.current.scale.setScalar(0.35 + eased * 0.65);
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.35 + eased * 0.45;
      matRef.current.opacity = 0.55 + eased * 0.4;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.6 * eased;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial
          ref={matRef}
          color="#38bdf8"
          emissive={accent}
          emissiveIntensity={0.35}
          transparent
          opacity={0.55}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0, 0.2]}
        intensity={0}
        distance={2.2}
        color={accent}
      />
      <Text
        position={[0, 0.48, 0]}
        fontSize={0.11}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
        outlineWidth={0.015}
        outlineColor="#020617"
      >
        {label.length > 26 ? `${label.slice(0, 24)}…` : label}
      </Text>
    </group>
  );
}

function GrowingThread({
  target,
  color,
  growBlendRef,
  index,
  total,
}: {
  target: [number, number, number];
  color: string;
  growBlendRef: React.MutableRefObject<number>;
  index: number;
  total: number;
}) {
  const lineRef = useRef<THREE.Line | null>(null);
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const colorObj = useMemo(() => hexToRgb(color), [color]);

  const lineObj = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      color: colorObj,
      transparent: true,
      opacity: 0.2,
    });
    const line = new THREE.Line(geometry, material);
    lineRef.current = line;
    return line;
  }, [colorObj]);

  useFrame(() => {
    const grow = growBlendRef.current;
    const stagger = total > 0 ? (index / total) * 0.38 : 0;
    const denom = Math.max(1e-6, 1 - stagger * 0.6);
    const localGrow = Math.min(1, Math.max(0, (grow - stagger) / denom));
    const eased = easeOutCubic(localGrow);
    const end = new THREE.Vector3(target[0] * eased, target[1] * eased, target[2] * eased);
    const pts = threadPoints(origin, end, 0.85, 16);
    const line = lineRef.current;
    if (line) {
      line.geometry.setFromPoints(pts);
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = 0.12 + eased * 0.55;
    }
  });

  return <primitive object={lineObj} />;
}

function SceneContent({
  layout,
  expandedArea,
  expandedClusterData,
  childLayout,
  growBlendRef,
  onExpand,
  onCollapse,
  goLibrary,
}: {
  layout: Array<{
    c: Cluster;
    position: [number, number, number];
    radius: number;
    color: string;
  }>;
  expandedArea: string | null;
  expandedClusterData: {
    c: Cluster;
    position: [number, number, number];
    radius: number;
    color: string;
  } | null;
  childLayout: Array<{
    ch: { id: string; title: string; type: string };
    pos: [number, number, number];
  }>;
  growBlendRef: React.MutableRefObject<number>;
  onExpand: (area: string) => void;
  onCollapse: () => void;
  goLibrary: (id: string) => void;
}) {
  useFrame((_, delta) => {
    if (expandedArea) {
      growBlendRef.current += (1 - growBlendRef.current) * (1 - Math.exp(-4.2 * delta));
    } else {
      growBlendRef.current += (0 - growBlendRef.current) * (1 - Math.exp(-10 * delta));
    }
  });

  const accent = expandedClusterData
    ? hexToRgb(expandedClusterData.color)
    : new THREE.Color('#38bdf8');

  return (
    <>
      <color attach="background" args={['#050810']} />
      <fog attach="fog" args={['#050810', 6, 22]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 10, 4]} intensity={0.85} color="#e2e8f0" />
      <directionalLight position={[-4, 2, -6]} intensity={0.25} color="#6366f1" />
      <Stars radius={80} depth={40} count={1800} factor={3} saturation={0} fade speed={0.3} />

      {!expandedArea &&
        layout.map(({ c, position, radius, color }, i) => (
          <MacroSphere
            key={c.area}
            position={position}
            radius={radius}
            label={`${c.area} (${c.itemCount})`}
            color={color}
            onClick={() => onExpand(c.area)}
            floatPhase={i * 1.7}
            dimmed={false}
          />
        ))}

      {expandedClusterData && expandedArea && (
        <group>
          <MacroSphere
            position={[0, 0, 0]}
            radius={expandedClusterData.radius}
            label={`${expandedClusterData.c.area} (${expandedClusterData.c.itemCount})`}
            color={expandedClusterData.color}
            onClick={onCollapse}
            floatPhase={0}
            dimmed={false}
          />
          {childLayout.map(({ pos }, i) => (
            <GrowingThread
              key={`thread-${i}-${pos[0]}-${pos[1]}`}
              target={pos}
              color={expandedClusterData.color}
              growBlendRef={growBlendRef}
              index={i}
              total={childLayout.length}
            />
          ))}
          {childLayout.map(({ ch, pos }, i) => (
            <ItemSphere
              key={ch.id}
              position={pos}
              label={ch.title}
              onClick={() => goLibrary(ch.id)}
              accent={accent}
              growBlendRef={growBlendRef}
              index={i}
              total={childLayout.length}
            />
          ))}
        </group>
      )}
    </>
  );
}

export default function MindPalacePage() {
  const navigate = useNavigate();
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const controlsRef = useRef<OrbitControlsHandle | null>(null);
  const growBlendRef = useRef(0);

  const q = useQuery({
    queryKey: ['mind-palace-clusters'],
    queryFn: async () => {
      const res = await vaultPrimitivesService.getGraphClusters();
      if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed');
      return (res.data.clusters || []) as unknown as Cluster[];
    },
  });

  const layout = useMemo(() => {
    const clusters = q.data ?? [];
    const n = Math.max(1, clusters.length);
    const golden = Math.PI * (3 - Math.sqrt(5));
    return clusters.map((c, i) => {
      const y = 1 - (i / (n - 1 || 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const x = Math.cos(theta) * r * 3.35;
      const z = Math.sin(theta) * r * 3.35;
      const radius = 0.48 + Math.min(1.15, (c.itemCount || 1) / 12);
      const hue = (i * 47) % 360;
      const color = `hsl(${hue} 72% 52%)`;
      return { c, position: [x, y * 2.35, z] as [number, number, number], radius, color };
    });
  }, [q.data]);

  const expandedCluster = useMemo(
    () => (expandedArea ? (q.data ?? []).find((x) => x.area === expandedArea) : null),
    [expandedArea, q.data]
  );

  const childLayout = useMemo(() => {
    if (!expandedCluster) return [];
    const kids = expandedCluster.children.slice(0, 50);
    return kids.map((ch, i) => ({
      ch,
      pos: fibSpherePositions(kids.length, 2.05)[i] ?? [0, 0, 0],
    }));
  }, [expandedCluster]);

  const expandedClusterData = useMemo(() => {
    if (!expandedArea) return null;
    return layout.find((l) => l.c.area === expandedArea) ?? null;
  }, [expandedArea, layout]);

  useLayoutEffect(() => {
    if (expandedArea) growBlendRef.current = 0;
  }, [expandedArea]);

  const goLibrary = useCallback(
    (itemId: string) => {
      navigate(`${ROUTES.admin.knowledgeVaultLibrary}?highlight=${encodeURIComponent(itemId)}`);
    },
    [navigate]
  );

  const activeCluster = expandedCluster;

  return (
    <div className="p-3 md:p-5 max-w-[1920px] mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-stretch gap-4 xl:gap-5 min-h-0">
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex items-start gap-3 flex-wrap">
            <Brain className="w-8 h-8 text-violet-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Mind Palace
                </h1>
                <AnimatePresence mode="wait">
                  {expandedArea && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="flex items-center gap-1 text-sm text-violet-300/90"
                    >
                      <ChevronRight className="w-4 h-4 opacity-70" />
                      <span className="font-medium">{expandedArea}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
                Your vault as a living web — open a sphere to grow its threads; tap a leaf to jump
                to the library with that note highlighted.
              </p>
            </div>
            {expandedArea && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setExpandedArea(null)}
                className="shrink-0 px-4 py-2 text-sm rounded-xl bg-violet-600/90 text-white hover:bg-violet-500 border border-violet-400/30 shadow-lg shadow-violet-950/40"
              >
                Back to overview
              </motion.button>
            )}
          </div>

          <motion.div
            layout
            className={cn(
              'relative rounded-2xl overflow-hidden border border-slate-700/80 bg-gradient-to-b from-slate-950 via-[#060912] to-[#03050c]',
              'shadow-[0_0_0_1px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.04)]',
              'min-h-[min(72vh,880px)] xl:min-h-[min(calc(100vh-10rem),920px)] w-full'
            )}
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(99,102,241,0.12),transparent_55%)]" />
            <Canvas
              className="h-full w-full min-h-[min(72vh,880px)] xl:min-h-[min(calc(100vh-10rem),920px)]"
              camera={{ position: [0, 2.1, 8.4], fov: 48 }}
              gl={{ antialias: true, alpha: false }}
              dpr={[1, 2]}
            >
              <CameraAndControlsRig expanded={Boolean(expandedArea)} controlsRef={controlsRef} />
              <SceneContent
                layout={layout}
                expandedArea={expandedArea}
                expandedClusterData={expandedClusterData}
                childLayout={childLayout}
                growBlendRef={growBlendRef}
                onExpand={setExpandedArea}
                onCollapse={() => setExpandedArea(null)}
                goLibrary={goLibrary}
              />
              <OrbitControls
                ref={controlsRef}
                enableDamping
                dampingFactor={0.06}
                minDistance={3}
                maxDistance={16}
                maxPolarAngle={Math.PI / 1.85}
              />
            </Canvas>
            {activeCluster && activeCluster.children.length > 50 && (
              <p className="absolute bottom-3 left-3 text-xs text-slate-300/90 bg-black/50 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10">
                +{activeCluster.children.length - 50} more in this area — full list in the panel →
              </p>
            )}
          </motion.div>

          {q.isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading your knowledge web…</p>
          )}
          {q.isError && (
            <p className="text-sm text-red-600">
              {q.error instanceof Error ? q.error.message : 'Error'}
            </p>
          )}
        </div>

        <aside className="xl:w-[340px] shrink-0 flex flex-col gap-3 xl:max-h-[min(calc(100vh-6rem),980px)]">
          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/40 dark:bg-slate-950/60 p-4 backdrop-blur-md">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Vault areas
            </h2>
            <p className="text-sm text-slate-500 mb-3">Click to expand one thread of your web.</p>
            <ul className="space-y-2 max-h-[42vh] xl:max-h-none xl:overflow-visible overflow-y-auto pr-1">
              {(q.data ?? []).map((c) => {
                const isOpen = expandedArea === c.area;
                return (
                  <li key={c.area}>
                    <button
                      type="button"
                      onClick={() => setExpandedArea(isOpen ? null : c.area)}
                      className={cn(
                        'w-full text-left rounded-xl px-3 py-2.5 transition-all border',
                        isOpen
                          ? 'bg-violet-600/25 border-violet-400/40 text-white shadow-lg shadow-violet-950/20'
                          : 'bg-slate-800/40 border-slate-600/40 text-slate-200 hover:bg-slate-800/70 hover:border-slate-500/50'
                      )}
                    >
                      <span className="font-medium">{c.area}</span>
                      <span className="text-slate-400 text-sm ml-2">({c.itemCount})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-white dark:bg-slate-900/50 p-4 flex-1 min-h-0 flex flex-col backdrop-blur-md overflow-hidden">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {activeCluster ? `${activeCluster.area} — items` : 'Browse items'}
            </h2>
            {!activeCluster ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select an area to see its notes and open them in the library.
              </p>
            ) : (
              <ul className="space-y-2 overflow-y-auto flex-1 pr-1 text-sm">
                {activeCluster.children.map((ch) => (
                  <li key={ch.id}>
                    <button
                      type="button"
                      onClick={() => goLibrary(ch.id)}
                      className="w-full text-left rounded-lg px-3 py-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-violet-100 dark:hover:bg-violet-950/40 border border-transparent hover:border-violet-500/30 transition-colors"
                    >
                      <span className="text-gray-900 dark:text-gray-100">{ch.title}</span>
                      <span className="text-gray-500 dark:text-gray-500 text-xs ml-2">
                        · {ch.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
