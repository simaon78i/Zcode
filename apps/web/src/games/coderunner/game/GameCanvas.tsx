import { Environment, Grid } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { CarController } from "./CarController";
import { Track } from "./Track";

export function GameCanvas() {
  return (
    <Canvas shadows gl={{ antialias: true }} dpr={[1, 2]}>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        intensity={1.5}
        position={[10, 16, 8]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight intensity={0.8} color="#22d3ee" position={[0, 3, -40]} />
      <Environment preset="night" />
      <Grid
        args={[120, 120]}
        cellColor="#0f766e"
        sectionColor="#0ea5e9"
        sectionSize={6}
        fadeDistance={140}
      />
      <Physics gravity={[0, -9.81, 0]}>
        <Track />
        <CarController />
      </Physics>
    </Canvas>
  );
}
