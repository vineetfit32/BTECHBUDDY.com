"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Grid, PerformanceMonitor, RoundedBox, Sparkles } from "@react-three/drei";
import { makeCardTexture, type CardKind, type Palette } from "./cardTextures";

interface SceneProps {
  progress: RefObject<number>;
  palette: Palette;
}

const CARDS: Array<{ kind: CardKind; angle: number; y: number }> = [
  { kind: "dsa", angle: 0.3, y: 2.6 },
  { kind: "circuit", angle: 1.9, y: 1.4 },
  { kind: "gears", angle: 3.5, y: 2.9 },
  { kind: "calculus", angle: 5.0, y: 1.7 },
];

function clay(color: string, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35, sheen: 0.4, ...extra });
}

function Buddy3D({ palette, progress }: SceneProps) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const wing = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);

  const m = useMemo(
    () => ({
      body: clay(palette.brand),
      belly: clay(new THREE.Color(palette.brand).lerp(new THREE.Color("#ffffff"), 0.6).getStyle()),
      dark: new THREE.MeshPhysicalMaterial({ color: palette.canvas, roughness: 0.15, metalness: 0.3, clearcoat: 1 }),
      eye: new THREE.MeshStandardMaterial({ color: palette.accent, emissive: palette.accent, emissiveIntensity: 2.4, toneMapped: false }),
      white: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
      warn: clay(palette.warn),
      phones: clay(palette.surface3, { roughness: 0.3, metalness: 0.4 }),
    }),
    [palette]
  );

  useEffect(() => () => Object.values(m).forEach((mat) => mat.dispose()), [m]);

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    const p = progress.current ?? 0;
    if (root.current) {
      root.current.position.y = Math.sin(t * 1.6) * 0.05;
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, pointer.x * 0.35 + p * 0.6, 0.05);
    }
    if (head.current) {
      head.current.rotation.z = Math.sin(t * 0.8) * 0.05;
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, -pointer.y * 0.18, 0.06);
    }
    if (wing.current) {
      const waving = p > 0.25 && p < 0.75 ? 1 : Math.max(0, Math.sin(t * 0.5)) > 0.97 ? 1 : 0;
      const target = waving ? -1.9 + Math.sin(t * 9) * 0.35 : -0.25;
      wing.current.rotation.z = THREE.MathUtils.lerp(wing.current.rotation.z, target, 0.12);
    }
    if (eyes.current) {
      const blink = t % 4.2 > 4.05 ? 0.1 : 1;
      eyes.current.scale.y = THREE.MathUtils.lerp(eyes.current.scale.y, blink, 0.5);
    }
  });

  return (
    <group ref={root}>
      <mesh material={m.warn} position={[-0.32, 0.08, 0.18]} scale={[1.2, 0.5, 1.4]}>
        <sphereGeometry args={[0.2, 24, 16]} />
      </mesh>
      <mesh material={m.warn} position={[0.32, 0.08, 0.18]} scale={[1.2, 0.5, 1.4]}>
        <sphereGeometry args={[0.2, 24, 16]} />
      </mesh>

      <mesh material={m.body} position={[0, 0.85, 0]} scale={[1, 1.05, 0.9]} castShadow>
        <sphereGeometry args={[0.8, 48, 32]} />
      </mesh>
      <mesh material={m.belly} position={[0, 0.75, 0.42]} scale={[1, 1, 0.55]}>
        <sphereGeometry args={[0.55, 40, 24]} />
      </mesh>
      <mesh material={m.eye} position={[0, 0.82, 0.73]}>
        <sphereGeometry args={[0.08, 16, 16]} />
      </mesh>

      <group position={[-0.78, 1.2, 0]} rotation={[0, 0, 0.25]}>
        <mesh material={m.body} position={[0, -0.32, 0]} scale={[0.45, 1, 0.7]}>
          <sphereGeometry args={[0.34, 24, 16]} />
        </mesh>
      </group>
      <group ref={wing} position={[0.78, 1.2, 0]} rotation={[0, 0, -0.25]}>
        <mesh material={m.body} position={[0, -0.32, 0]} scale={[0.45, 1, 0.7]}>
          <sphereGeometry args={[0.34, 24, 16]} />
        </mesh>
      </group>

      <group ref={head} position={[0, 1.95, 0]}>
        <RoundedBox args={[1.7, 1.25, 1.25]} radius={0.5} smoothness={6} material={m.body} castShadow />
        <mesh material={m.body} position={[-0.62, 0.72, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.22, 0.55, 24]} />
        </mesh>
        <mesh material={m.body} position={[0.62, 0.72, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.22, 0.55, 24]} />
        </mesh>
        <mesh material={m.eye} position={[-0.78, 1.0, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
        </mesh>
        <mesh material={m.eye} position={[0.78, 1.0, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
        </mesh>

        <mesh material={m.phones} position={[0, 0.1, 0]}>
          <torusGeometry args={[0.92, 0.065, 16, 48, Math.PI]} />
        </mesh>
        <mesh material={m.phones} position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.22, 32]} />
        </mesh>
        <mesh material={m.phones} position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.22, 32]} />
        </mesh>

        <RoundedBox args={[1.25, 0.62, 0.2]} radius={0.28} smoothness={4} position={[0, 0.03, 0.58]} material={m.dark} />
        <group ref={eyes} position={[0, 0.05, 0.69]}>
          <mesh material={m.eye} position={[-0.3, 0, 0]}>
            <sphereGeometry args={[0.17, 24, 16]} />
          </mesh>
          <mesh material={m.eye} position={[0.3, 0, 0]}>
            <sphereGeometry args={[0.17, 24, 16]} />
          </mesh>
          <mesh material={m.white} position={[-0.25, 0.06, 0.14]}>
            <sphereGeometry args={[0.045, 12, 12]} />
          </mesh>
          <mesh material={m.white} position={[0.35, 0.06, 0.14]}>
            <sphereGeometry args={[0.045, 12, 12]} />
          </mesh>
        </group>
        <mesh material={m.warn} position={[0, -0.42, 0.62]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.11, 0.22, 16]} />
        </mesh>
      </group>
    </group>
  );
}

function Desk({ palette }: { palette: Palette }) {
  return (
    <group position={[0, -0.05, 0]}>
      <RoundedBox args={[4.4, 0.22, 2.3]} radius={0.08} position={[0, -0.12, 0]} receiveShadow>
        <meshPhysicalMaterial color={palette.surface3} roughness={0.6} clearcoat={0.3} />
      </RoundedBox>
      {[palette.brand, palette.accent, palette.warn].map((color, i) => (
        <RoundedBox key={color} args={[0.9 - i * 0.06, 0.16, 0.62]} radius={0.03} position={[-1.45, 0.07 + i * 0.17, 0.2]} rotation={[0, 0.12 * (i - 1), 0]}>
          <meshPhysicalMaterial color={color} roughness={0.5} clearcoat={0.4} />
        </RoundedBox>
      ))}
      <mesh position={[1.5, 0.2, 0.35]}>
        <cylinderGeometry args={[0.2, 0.17, 0.42, 32]} />
        <meshPhysicalMaterial color={palette.ink} roughness={0.35} clearcoat={0.8} />
      </mesh>
      <mesh position={[1.72, 0.22, 0.35]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.03, 12, 24]} />
        <meshPhysicalMaterial color={palette.ink} roughness={0.35} />
      </mesh>
    </group>
  );
}

function OrbitingCards({ palette }: { palette: Palette }) {
  const group = useRef<THREE.Group>(null);
  const textures = useMemo(() => CARDS.map((c) => makeCardTexture(c.kind, palette)), [palette]);
  const { camera } = useThree();
  const cardRefs = useRef<Array<THREE.Mesh | null>>([]);

  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.14;
    for (const card of cardRefs.current) card?.lookAt(camera.position);
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {CARDS.map((c, i) => (
        <Float key={c.kind} speed={1.6} rotationIntensity={0.15} floatIntensity={0.6}>
          <mesh
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            position={[Math.cos(c.angle) * 3, c.y, Math.sin(c.angle) * 3]}
          >
            <planeGeometry args={[1.5, 1.125]} />
            <meshBasicMaterial map={textures[i]} transparent opacity={0.94} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function CameraRig({ progress }: { progress: RefObject<number> }) {
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const stops = useMemo(
    () => [
      { pos: new THREE.Vector3(0, 1.9, 7.2), look: new THREE.Vector3(0, 1.4, 0) },
      { pos: new THREE.Vector3(4.2, 3.0, 5.2), look: new THREE.Vector3(0, 1.3, 0) },
      { pos: new THREE.Vector3(-3.2, 4.6, 6.4), look: new THREE.Vector3(0, 0.9, 0) },
    ],
    []
  );

  useFrame(({ camera, pointer }) => {
    const p = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1) * (stops.length - 1);
    const i = Math.min(Math.floor(p), stops.length - 2);
    const f = THREE.MathUtils.smoothstep(p - i, 0, 1);
    target.lerpVectors(stops[i].pos, stops[i + 1].pos, f);
    target.x += pointer.x * 0.35;
    target.y += pointer.y * 0.2;
    look.lerpVectors(stops[i].look, stops[i + 1].look, f);
    camera.position.lerp(target, 0.08);
    camera.lookAt(look);
  });
  return null;
}

function BlueprintGrid({ palette }: { palette: Palette }) {
  const ref = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  useFrame((_, delta) => {
    const uniform = ref.current?.material.uniforms.fadeDistance;
    if (uniform && uniform.value < 24) uniform.value = Math.min(24, uniform.value + delta * 14);
  });
  return (
    <Grid
      ref={ref}
      position={[0, -0.24, 0]}
      args={[40, 40]}
      cellSize={0.5}
      cellThickness={0.6}
      cellColor={palette.brand}
      sectionSize={2.5}
      sectionThickness={1.1}
      sectionColor={palette.accent}
      fadeDistance={0.01}
      fadeStrength={1.6}
      infiniteGrid
    />
  );
}

export default function HeroScene({ progress, palette }: SceneProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState(1.6);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0">
      <Canvas
        dpr={dpr}
        frameloop={visible ? "always" : "never"}
        shadows
        camera={{ position: [0, 1.9, 7.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-label="Buddy, the BTECHBUDDY mascot, studying at a desk while subject cards orbit around him"
        role="img"
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.6)} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 8, 5]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-4, 3, 2]} intensity={18} color={palette.brand} />
        <pointLight position={[4, 2, -2]} intensity={14} color={palette.accent} />
        <hemisphereLight args={[palette.ink, palette.canvas, 0.4]} />

        <group position={[0, -0.6, 0]}>
          <Buddy3D palette={palette} progress={progress} />
          <Desk palette={palette} />
          <OrbitingCards palette={palette} />
          <BlueprintGrid palette={palette} />
          <Sparkles count={60} scale={[8, 4, 8]} position={[0, 2, 0]} size={2.2} speed={0.35} color={palette.accent} />
        </group>
        <CameraRig progress={progress} />
      </Canvas>
    </div>
  );
}
