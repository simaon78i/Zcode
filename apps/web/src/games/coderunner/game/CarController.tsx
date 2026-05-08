import { PerspectiveCamera } from "@react-three/drei";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { PerspectiveCamera as PerspectiveCameraType } from "three";
import { Color, Euler, MathUtils, MeshStandardMaterial, Quaternion, Vector3 } from "three";
import { useGameStore } from "../store/gameStore";
import {
  bonusArraysMaybeAdvance,
  bonusLaneHalf,
  bonusNarrowSpeedDamping,
  evaluateBonusFrame,
  getBonusBoostPads,
  spaceJumpAllowedForBonus,
} from "./bonusDrive";

const tempVec = new Vector3();
const forwardDir = new Vector3();
const cameraTarget = new Vector3();
const lookTarget = new Vector3();
const up = new Vector3(0, 1, 0);

function jumpHeight(yWorld: number) {
  return Math.max(0, yWorld - 0.5);
}

function useDriveInput() {
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const onDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        keys.current.space = true;
        event.preventDefault();
      } else keys.current[event.key.toLowerCase()] = true;
    };
    const onUp = (event: KeyboardEvent) => {
      if (event.code === "Space") keys.current.space = false;
      else keys.current[event.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);
  return keys;
}

export function CarController() {
  const rbRef = useRef<RapierRigidBody | null>(null);
  const cameraRef = useRef<PerspectiveCameraType | null>(null);
  const speedRef = useRef(0);
  const yawRef = useRef(0);
  const steerRef = useRef(0);
  const throttleRef = useRef(0);
  const passedRef = useRef(false);
  const lastBoostAtRef = useRef(0);
  const jumpVelRef = useRef(0);
  const jumpYRef = useRef(0);
  const lastJumpAtRef = useRef(0);
  const spaceWasDownRef = useRef(false);
  const baseRef = useRef<MeshStandardMaterial | null>(null);
  const glassRef = useRef<MeshStandardMaterial | null>(null);
  const prevCarZRef = useRef(10);
  const arraysIdxRef = useRef(0);
  const variablesGateCheckedRef = useRef(false);

  const input = useDriveInput();
  const runId = useGameStore((s) => s.runId);
  const bonusInstanceId = useGameStore((s) => s.bonusRun?.instance.id ?? null);
  const boostMultiplier = useMemo(() => 1.4, []);

  useEffect(() => {
    console.log("[CAR_CONTROLLER_PIPELINE] boot/reset pulse", {
      runId,
      bonusInstanceId,
      storeBonusRun: useGameStore.getState().bonusRun?.instance.id ?? null,
    });
  }, [runId, bonusInstanceId]);

  useEffect(() => {
    speedRef.current = 0;
    yawRef.current = 0;
    steerRef.current = 0;
    throttleRef.current = 0;
    passedRef.current = false;
    lastBoostAtRef.current = 0;
    jumpVelRef.current = 0;
    jumpYRef.current = 0;
    lastJumpAtRef.current = 0;
    spaceWasDownRef.current = false;
    prevCarZRef.current = 10;
    arraysIdxRef.current = 0;
    variablesGateCheckedRef.current = false;
    rbRef.current?.setTranslation({ x: 0, y: 0.5, z: 10 }, true);
    rbRef.current?.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
  }, [runId]);

  useFrame((_, delta) => {
    const rb = rbRef.current;
    if (!rb) return;

    const {
      stage,
      carConfig,
      boostUntilMs,
      jumpLogicEnabled,
      jumpLogicBlanks,
      stageState,
      markStarted,
      markPassed,
      markFailed,
      setTelemetry,
      triggerBoost,
      bonusRun,
      bonusBlanksApplied,
    } = useGameStore.getState();

    const forwardPressed = input.current["w"] || input.current["arrowup"];
    const backwardPressed = input.current["s"] || input.current["arrowdown"];
    const leftPressed = input.current["a"] || input.current["arrowleft"];
    const rightPressed = input.current["d"] || input.current["arrowright"];
    const spaceDown = !!input.current.space;

    if (forwardPressed || backwardPressed || leftPressed || rightPressed) markStarted();

    const boostActive = performance.now() < boostUntilMs;

    const maxSpeedTarget = carConfig.maxSpeed * (boostActive ? boostMultiplier : 1);
    const targetThrottle = forwardPressed ? 1 : backwardPressed ? -0.65 : 0;
    const targetSteer = (leftPressed ? 1 : 0) + (rightPressed ? -1 : 0);

    throttleRef.current = MathUtils.lerp(throttleRef.current, targetThrottle, Math.min(1, delta * 8.5));
    steerRef.current = MathUtils.lerp(steerRef.current, targetSteer, Math.min(1, delta * 10));

    const accelBoost = boostActive ? 1.28 : 1;
    const speedRatio = Math.min(1, Math.abs(speedRef.current) / Math.max(0.001, maxSpeedTarget));
    const accelCurve = 1 - speedRatio * 0.55;
    speedRef.current +=
      throttleRef.current * carConfig.acceleration * accelBoost * accelCurve * delta * 8.5;

    speedRef.current *= 0.986;
    speedRef.current = Math.max(-maxSpeedTarget * 0.35, Math.min(maxSpeedTarget, speedRef.current));

    const pos = rb.translation();
    speedRef.current *= bonusNarrowSpeedDamping(bonusRun, bonusBlanksApplied, pos.x, pos.z);

    const turnGrip = 0.65 + Math.min(0.65, Math.abs(speedRef.current) * 0.09);
    yawRef.current += steerRef.current * carConfig.turnSpeed * delta * turnGrip;

    forwardDir.set(0, 0, -1).applyAxisAngle(up, yawRef.current).normalize();
    tempVec.copy(forwardDir).multiplyScalar(speedRef.current * delta * 4.3);

    const laneHalf = bonusLaneHalf(bonusRun, stage.laneHalfWidth);
    const nextX = Math.max(-laneHalf, Math.min(laneHalf, pos.x + tempVec.x));
    const nextZ = pos.z + tempVec.z;

    const grounded = jumpYRef.current <= 0.001;
    const spaceJustPressed = spaceDown && !spaceWasDownRef.current;
    spaceWasDownRef.current = spaceDown;

    const mainJump =
      !bonusRun &&
      stage.kind === "jumpLogic" &&
      jumpLogicEnabled &&
      jumpLogicBlanks.inputProp.trim() === "key" &&
      jumpLogicBlanks.action.trim() === "jump";
    const bonusJumpOk = spaceJumpAllowedForBonus(bonusRun, bonusBlanksApplied, false);

    if (
      spaceJustPressed &&
      (mainJump || bonusJumpOk) &&
      grounded &&
      performance.now() - lastJumpAtRef.current > 650
    ) {
      lastJumpAtRef.current = performance.now();
      jumpVelRef.current = 7.2;
      triggerBoost(650);
      if (bonusRun?.template.topicId === "functions" && bonusBlanksApplied) {
        const norm = (s: string) => (s ?? "").trim().toLowerCase().replace(/\(\)/g, "");
        if (norm(bonusBlanksApplied.evadeCall1).includes("boost")) {
          triggerBoost(1000);
        }
      }
      markStarted();
    }

    jumpVelRef.current += -18.5 * delta;
    jumpYRef.current += jumpVelRef.current * delta;
    if (jumpYRef.current < 0) {
      jumpYRef.current = 0;
      jumpVelRef.current = 0;
    }

    const nextY = 0.5 + jumpYRef.current;
    rb.setNextKinematicTranslation({ x: nextX, y: nextY, z: nextZ });

    const dq = new Quaternion().setFromEuler(new Euler(0, yawRef.current, 0));
    rb.setNextKinematicRotation({ x: dq.x, y: dq.y, z: dq.z, w: dq.w });

    const boostPads = getBonusBoostPads(bonusRun, stage.boostPads);
    boostPads.forEach((pad) => {
      const inZ = nextZ <= pad.z + pad.depth * 0.52 && nextZ >= pad.z - pad.depth * 0.52;
      const inX = Math.abs(nextX - pad.x) < pad.width * 0.55;
      if (!inZ || !inX) return;

      if (performance.now() - lastBoostAtRef.current > 900) {
        lastBoostAtRef.current = performance.now();
        triggerBoost(1200);
        markStarted();
      }
    });

    const st = stage;
    const prevZ = prevCarZRef.current;

    if (!bonusRun) {
      if (st.kind === "speedGate") {
        if (!passedRef.current && nextZ <= st.gateZ) {
          passedRef.current = true;
          if (Math.abs(nextX) > st.gateWidth / 2) markFailed("You missed the gate lane.");
          else if (speedRef.current > st.requiredGateSpeed) {
            const t0 = useGameStore.getState().startedAtMs;
            markPassed(t0 ? performance.now() - t0 : 0);
          } else {
            markFailed(`Raise tuning — need speed above gate threshold (${st.requiredGateSpeed}).`);
          }
        }
      } else if (st.kind === "jumpLogic") {
        const logicAllowsJump =
          jumpLogicEnabled &&
          jumpLogicBlanks.inputProp.trim() === "key" &&
          jumpLogicBlanks.action.trim() === "jump";

        const clipped =
          nextZ <= st.barrier.z + st.barrier.depth * 0.55 &&
          nextZ >= st.barrier.z - st.barrier.depth * 0.55 &&
          Math.abs(nextX) <= st.barrier.width * 0.5 &&
          nextY < st.barrier.clearanceY;

        if (clipped && stageState !== "failed") {
          speedRef.current *= 0.15;
          markFailed(
            logicAllowsJump
              ? "Queued jump undercut clearance — rebuild approach speed."
              : 'SPACE wired? Complete IF: input.key → "Space" ⇒ car.jump().',
          );
        }

        if (!passedRef.current && stageState !== "failed" && nextZ <= st.finishZ) {
          passedRef.current = true;
          const t0 = useGameStore.getState().startedAtMs;
          markPassed(t0 ? performance.now() - t0 : 0);
        }
      }
    } else if (bonusBlanksApplied) {
      const layout = bonusRun.template.layout;
      if (layout.kind === "arrays") {
        bonusArraysMaybeAdvance(prevZ, nextZ, nextX, layout.data.checkpoints, arraysIdxRef);
      }

      const bonusResult = evaluateBonusFrame({
        bonusRun,
        blanks: bonusBlanksApplied,
        nextX,
        nextZ,
        nextY,
        speed: speedRef.current,
        stageState,
        passedRef,
        arraysIdxRef,
        variablesGateCheckedRef,
      });
      if (bonusResult?.fail) markFailed(bonusResult.fail);
      else if (bonusResult?.pass) {
        const t0 = useGameStore.getState().startedAtMs;
        markPassed(t0 ? performance.now() - t0 : 0);
      }
    }

    prevCarZRef.current = nextZ;

    setTelemetry({ x: nextX, z: nextZ, speed: Math.max(0, speedRef.current) });

    const camLift = jumpHeight(nextY) * 1.05;
    if (cameraRef.current) {
      cameraTarget
        .set(nextX, 0.9 + camLift, nextZ)
        .addScaledVector(forwardDir, -8.6)
        .addScaledVector(up, 3.4);
      lookTarget.set(nextX, 1 + camLift, nextZ).addScaledVector(forwardDir, 8);
      cameraRef.current.position.lerp(cameraTarget, 0.11);
      if (boostActive) {
        cameraRef.current.position.x += (Math.random() - 0.5) * 0.075;
        cameraRef.current.position.y += (Math.random() - 0.5) * 0.05;
      }
      cameraRef.current.lookAt(lookTarget);
      cameraRef.current.fov = MathUtils.lerp(cameraRef.current.fov, boostActive ? 62 : 55, 0.12);
      cameraRef.current.updateProjectionMatrix();
    }

    if (stageState === "failed" && speedRef.current > 1) speedRef.current *= 0.96;

    if (baseRef.current && glassRef.current) {
      baseRef.current.emissiveIntensity = MathUtils.lerp(
        baseRef.current.emissiveIntensity,
        boostActive ? 1.8 : 0.8,
        0.18,
      );
      glassRef.current.emissiveIntensity = MathUtils.lerp(
        glassRef.current.emissiveIntensity,
        boostActive ? 1.2 : 0.3,
        0.16,
      );
      if (boostActive) {
        baseRef.current.emissive = new Color("#22d3ee");
        glassRef.current.emissive = new Color("#38bdf8");
      }
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={55} position={[0, 4, 12]} />
      <RigidBody ref={rbRef} type="kinematicPosition" colliders="cuboid">
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[1.3, 0.6, 2.4]} />
          <meshStandardMaterial ref={baseRef} color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 0.9, -0.25]}>
          <boxGeometry args={[0.9, 0.35, 1.2]} />
          <meshStandardMaterial ref={glassRef} color="#67e8f9" emissive="#0ea5e9" emissiveIntensity={0.3} />
        </mesh>
      </RigidBody>
    </>
  );
}
