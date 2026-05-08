import { useMemo, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import type { StageConfig } from "../stages/configs/types";

function MainTrack({ stage }: { stage: StageConfig }) {
  const stage2Curves = useMemo(
    () => (stage.kind === "speedGate" && stage.id === "stage2" ? [-35, -62, -88] : []),
    [stage.id, stage.kind],
  );

  return (
    <group>
      <mesh position={[0, -0.05, -(stage.trackLength / 2 - 2)]} receiveShadow>
        <boxGeometry args={[stage.laneHalfWidth * 2 + 2, 0.1, stage.trackLength]} />
        <meshStandardMaterial color="#0b1220" metalness={0.2} roughness={0.75} />
      </mesh>

      {stage.boostPads.map((pad, index) => (
        <mesh key={`${pad.z}-${index}`} position={[pad.x, 0.02, pad.z]}>
          <boxGeometry args={[pad.width, 0.05, pad.depth]} />
          <meshStandardMaterial emissive="#22d3ee" color="#153349" emissiveIntensity={1.2} />
        </mesh>
      ))}

      {stage.kind === "speedGate" && (
        <group>
          <mesh position={[0, 2.5, stage.gateZ]}>
            <torusGeometry args={[2.8, 0.35, 10, 28]} />
            <meshStandardMaterial color="#60a5fa" emissive="#38bdf8" emissiveIntensity={1.3} />
          </mesh>
          <mesh position={[-3.6, 1.2, stage.gateZ]}>
            <boxGeometry args={[0.3, 2.4, 0.3]} />
            <meshStandardMaterial color="#1d4ed8" emissive="#1d4ed8" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[3.6, 1.2, stage.gateZ]}>
            <boxGeometry args={[0.3, 2.4, 0.3]} />
            <meshStandardMaterial color="#1d4ed8" emissive="#1d4ed8" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      {stage.kind === "jumpLogic" && (
        <group>
          <mesh position={[0, stage.barrier.height / 2, stage.barrier.z]}>
            <boxGeometry args={[stage.barrier.width, stage.barrier.height, stage.barrier.depth]} />
            <meshStandardMaterial color="#fb7185" emissive="#f43f5e" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0, stage.barrier.height + 0.35, stage.barrier.z]}>
            <boxGeometry args={[stage.barrier.width + 1.2, 0.18, stage.barrier.depth + 0.4]} />
            <meshStandardMaterial color="#fecdd3" emissive="#fb7185" emissiveIntensity={1.1} />
          </mesh>
          <mesh position={[0, 2.7, stage.finishZ]}>
            <torusGeometry args={[2.7, 0.28, 10, 28]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.2} />
          </mesh>
        </group>
      )}

      {stage2Curves.map((z, idx) => (
        <group key={`curve-${z}`}>
          <mesh position={[-stage.laneHalfWidth - 0.8, 0.45, z]}>
            <boxGeometry args={[0.6, 0.9, 14]} />
            <meshStandardMaterial
              color={idx % 2 ? "#0ea5e9" : "#22d3ee"}
              emissive="#0ea5e9"
              emissiveIntensity={0.65}
            />
          </mesh>
          <mesh position={[stage.laneHalfWidth + 0.8, 0.45, z]}>
            <boxGeometry args={[0.6, 0.9, 14]} />
            <meshStandardMaterial
              color={idx % 2 ? "#0ea5e9" : "#22d3ee"}
              emissive="#0ea5e9"
              emissiveIntensity={0.65}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BonusTrack() {
  const bonusRun = useGameStore((s) => s.bonusRun);
  if (!bonusRun) return null;
  const L = bonusRun.template.layout;
  const d = L.data;
  const half = d.laneHalfWidth;

  return (
    <group>
      <mesh position={[0, -0.05, -(d.trackLength / 2 - 2)]} receiveShadow>
        <boxGeometry args={[half * 2 + 2, 0.1, d.trackLength]} />
        <meshStandardMaterial color="#0b1220" metalness={0.2} roughness={0.75} />
      </mesh>

      {L.kind === "forLoops" &&
        L.data.pads.map((pad, index) => (
          <mesh key={`bp-${pad.z}-${index}`} position={[pad.x, 0.02, pad.z]}>
            <boxGeometry args={[pad.width, 0.05, pad.depth]} />
            <meshStandardMaterial emissive="#22d3ee" color="#153349" emissiveIntensity={1.2} />
          </mesh>
        ))}

      {L.kind === "arrays" &&
        L.data.checkpoints.map((cp, i) => {
          const col =
            cp.colorName === "red" ? "#f87171" : cp.colorName === "blue" ? "#60a5fa" : "#4ade80";
          return (
            <group key={`cp-${i}`}>
              <mesh position={[cp.laneX, 0.35, cp.z]}>
                <cylinderGeometry args={[0.55, 0.55, 0.7, 18]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.9} />
              </mesh>
            </group>
          );
        })}

      {L.kind === "variables" && (
        <group>
          <mesh position={[0, 0.8, L.data.hazardZ]}>
            <boxGeometry args={[L.data.hazardWidth, 1.6, 2]} />
            <meshStandardMaterial color="#b91c1c" emissive="#7f1d1d" emissiveIntensity={0.75} />
          </mesh>
          <mesh position={[0, 2.3, L.data.gateZ]}>
            <torusGeometry args={[2.4, 0.28, 10, 26]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={1.1} />
          </mesh>
          <mesh position={[0, 2.5, L.data.finishZ]}>
            <torusGeometry args={[2.55, 0.24, 10, 26]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.05} />
          </mesh>
        </group>
      )}

      {L.kind === "functions" &&
        L.data.sections.map((sec, i) => (
          <group key={`fn-${i}`}>
            <mesh position={[0, sec.barrierClearY, sec.z]}>
              <boxGeometry args={[sec.barrierWidth, sec.barrierClearY * 2, 1.1]} />
              <meshStandardMaterial color="#fb7185" emissive="#f43f5e" emissiveIntensity={0.95} />
            </mesh>
          </group>
        ))}

      {L.kind === "conditionals" &&
        L.data.obstacles.map((ob, i) => (
          <mesh key={`obs-${i}`} position={[0, ob.height / 2, ob.z]}>
            <boxGeometry args={[ob.width, ob.height, ob.depth]} />
            <meshStandardMaterial
              color={ob.type === "high" ? "#a855f7" : "#f59e0b"}
              emissive={ob.type === "high" ? "#7c3aed" : "#d97706"}
              emissiveIntensity={0.85}
            />
          </mesh>
        ))}

      {L.kind === "forLoops" && (
        <mesh position={[0, 2.6, L.data.finishZ]}>
          <torusGeometry args={[2.65, 0.26, 10, 26]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.1} />
        </mesh>
      )}
      {L.kind === "arrays" && (
        <mesh position={[0, 2.5, L.data.finishZ]}>
          <torusGeometry args={[2.55, 0.24, 10, 26]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.05} />
        </mesh>
      )}
      {L.kind === "functions" && (
        <mesh position={[0, 2.55, L.data.finishZ]}>
          <torusGeometry args={[2.6, 0.25, 10, 26]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.05} />
        </mesh>
      )}
      {L.kind === "conditionals" && (
        <mesh position={[0, 2.55, L.data.finishZ]}>
          <torusGeometry args={[2.6, 0.25, 10, 26]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.05} />
        </mesh>
      )}
    </group>
  );
}

export function Track() {
  const stage = useGameStore((s) => s.stage);
  const bonusRun = useGameStore((s) => s.bonusRun);

  useEffect(() => {
    console.log("[TRACK_RECEIVED]", {
      mode: bonusRun ? "BONUS_SCENE" : "MAIN_SCENE",
      mainStageIdPinned: stage.id,
      bonusInstanceId: bonusRun?.instance.id ?? null,
      bonusTopic: bonusRun?.template.topicId ?? null,
    });
  }, [bonusRun?.instance?.id, stage.id, bonusRun?.template.topicId]);

  if (bonusRun) return <BonusTrack />;
  return <MainTrack stage={stage} />;
}
