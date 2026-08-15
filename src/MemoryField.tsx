import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function seededRandom(seed: number) {
  let state = seed % 2147483647;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function Dust({ scene, reduced }: { scene: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null);
  const { pointer } = useThree();
  const positions = useMemo(() => {
    const random = seededRandom(19082026);
    const values = new Float32Array(720 * 3);
    for (let index = 0; index < 720; index += 1) {
      const offset = index * 3;
      const radius = 2 + random() * 4.8;
      const angle = random() * Math.PI * 2;
      values[offset] = Math.cos(angle) * radius;
      values[offset + 1] = (random() - .5) * 8.5;
      values[offset + 2] = Math.sin(angle) * radius - 2.4;
    }
    return values;
  }, []);

  useFrame((state, delta) => {
    if (!points.current || reduced) return;
    points.current.rotation.y += delta * (scene === 2 ? .035 : .012);
    points.current.rotation.x = THREE.MathUtils.damp(points.current.rotation.x, pointer.y * .025, 2.5, delta);
    points.current.position.x = THREE.MathUtils.damp(points.current.position.x, pointer.x * .1, 2.5, delta);
    points.current.position.y = Math.sin(state.clock.elapsedTime * .12) * .07;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={scene >= 7 ? "#f4d5d9" : "#c8acc4"}
        size={scene === 2 ? .035 : .018}
        sizeAttenuation
        transparent
        opacity={scene === 5 ? .18 : .5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function MemoryField({ scene, reduced }: { scene: number; reduced: boolean }) {
  return (
    <div className="memory-field" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 48 }}
        dpr={[1, 1.35]}
        frameloop={reduced ? "demand" : "always"}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <Dust scene={scene} reduced={reduced} />
      </Canvas>
    </div>
  );
}
