"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, useAnimations, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";

type Lane = -1 | 0 | 1;

const laneX: Record<Lane, number> = {
  "-1": -2.5,
  0: 0,
  1: 2.5,
};

function Runner({
  lane,
  playerY,
}: {
  lane: Lane;
  playerY: React.MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/runner.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const firstAction = Object.values(actions)[0];
    firstAction?.reset().fadeIn(0.2).play();

    return () => {
      firstAction?.fadeOut(0.2);
    };
  }, [actions]);

  useFrame(() => {
    if (!group.current) return;

    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      laneX[lane],
      0.15
    );

    group.current.position.y = playerY.current;
  });

  return (
    <group
      ref={group}
      position={[0, -0.9, 2]}
      scale={0.02}
      rotation={[0, Math.PI, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

function Road() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -18]}>
        <planeGeometry args={[9, 80]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {[-1.25, 1.25].map((x) => (
        <mesh
          key={x}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.01, -18]}
        >
          <planeGeometry args={[0.08, 80]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

function Obstacle({ lane, z }: { lane: Lane; z: number }) {
  return (
    <mesh position={[laneX[lane], 0.5, z]}>
      <boxGeometry args={[1.2, 1, 1]} />
      <meshStandardMaterial color="#c1121f" />
    </mesh>
  );
}

function SignCard({
  lane,
  z,
  name,
}: {
  lane: Lane;
  z: number;
  name: string;
}) {
  return (
    <group position={[laneX[lane], 2.2, z]}>
      <mesh>
        <boxGeometry args={[1.4, 1.8, 0.12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <Text
        position={[0, -0.55, 0.08]}
        fontSize={0.22}
        color="#ea580c"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>

      <mesh position={[0, 0.35, 0.09]}>
        <planeGeometry args={[0.85, 0.85]} />
        <meshStandardMaterial color="#ffd166" />
      </mesh>
    </group>
  );
}

function GameScene() {
  const [lane, setLane] = useState<Lane>(0);
  const [jumping, setJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const laneRef = useRef<Lane>(0);
  const jumpRef = useRef(false);
  const gameOverRef = useRef(false);
  const speedRef = useRef(0.22);

  const jumpVelocityRef = useRef(0);
  const playerYRef = useRef(-0.9);
  const isGroundedRef = useRef(true);

  const cardSoundRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const [musicStarted, setMusicStarted] = useState(false);

  const [obstacles, setObstacles] = useState<
    { id: number; lane: Lane; z: number }[]
  >([]);

  const [cards, setCards] = useState<
    { id: number; lane: Lane; z: number; name: string }[]
  >([]);

  const signs = useMemo(() => ["Alif", "Bay", "Pay", "Tay"], []);
  const idRef = useRef(1);

  useEffect(() => {
    const savedHighScore = localStorage.getItem("signRunnerHighScore");
    if (savedHighScore) {
      setHighScore(Number(savedHighScore));
    }

    cardSoundRef.current = new Audio("/sounds/card.mp3");
    cardSoundRef.current.volume = 0.75;

    bgMusicRef.current = new Audio("/sounds/background.mp3");
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.35;

    return () => {
      bgMusicRef.current?.pause();
      bgMusicRef.current = null;
      cardSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    laneRef.current = lane;
  }, [lane]);

  useEffect(() => {
    jumpRef.current = jumping;
  }, [jumping]);

  useEffect(() => {
    gameOverRef.current = gameOver;

    if (gameOver) {
      bgMusicRef.current?.pause();
    }
  }, [gameOver]);

  const startMusic = () => {
    if (musicStarted) return;

    bgMusicRef.current
      ?.play()
      .then(() => setMusicStarted(true))
      .catch(() => {
        console.log("Background music blocked until user interaction.");
      });
  };

  const playCardSound = () => {
    if (!cardSoundRef.current) return;

    cardSoundRef.current.currentTime = 0;
    cardSoundRef.current.play().catch(() => {});
  };

  const jump = () => {
    if (!isGroundedRef.current || gameOverRef.current) return;

    startMusic();

    isGroundedRef.current = false;
    setJumping(true);
    jumpVelocityRef.current = 0.22;
  };

  const moveLeft = () => {
    startMusic();
    setLane((prev) => (prev > -1 ? ((prev - 1) as Lane) : prev));
  };

  const moveRight = () => {
    startMusic();
    setLane((prev) => (prev < 1 ? ((prev + 1) as Lane) : prev));
  };

  const resetGame = () => {
    setLane(0);
    setJumping(false);
    setGameOver(false);
    setScore(0);
    speedRef.current = 0.22;
    jumpVelocityRef.current = 0;
    playerYRef.current = -0.9;
    isGroundedRef.current = true;
    setObstacles([]);
    setCards([]);

    if (bgMusicRef.current) {
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play().catch(() => {});
      setMusicStarted(true);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
      if (e.key === "ArrowUp" || e.key === " ") jump();

      if (e.key === "Enter" && gameOverRef.current) {
        resetGame();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [musicStarted]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameOverRef.current) return;

      const lanes: Lane[] = [-1, 0, 1];

      const obstacleLane = lanes[Math.floor(Math.random() * lanes.length)];
      const safeCardLanes = lanes.filter((l) => l !== obstacleLane);

      const cardLane =
        safeCardLanes[Math.floor(Math.random() * safeCardLanes.length)];

      const sign = signs[Math.floor(Math.random() * signs.length)];

      setObstacles((prev) => [
        ...prev,
        { id: idRef.current++, lane: obstacleLane, z: -45 },
      ]);

      setCards((prev) => [
        ...prev,
        { id: idRef.current++, lane: cardLane, z: -55, name: sign },
      ]);
    }, 1400);

    return () => clearInterval(interval);
  }, [signs]);

  useFrame(() => {
    if (gameOverRef.current) return;

    if (!isGroundedRef.current) {
      playerYRef.current += jumpVelocityRef.current;
      jumpVelocityRef.current -= 0.012;

      if (playerYRef.current <= -0.9) {
        playerYRef.current = -0.9;
        jumpVelocityRef.current = 0;
        isGroundedRef.current = true;
        setJumping(false);
      }
    }

    speedRef.current = Math.min(speedRef.current + 0.00008, 0.55);

    setObstacles((prev) => {
      const updated = prev
        .map((o) => ({ ...o, z: o.z + speedRef.current }))
        .filter((o) => o.z < 8);

      for (const obstacle of updated) {
        const hit = obstacle.z > 1.3 && obstacle.z < 2.8;
        const sameLane = obstacle.lane === laneRef.current;

        if (hit && sameLane && !jumpRef.current) {
          setGameOver(true);
        }
      }

      return updated;
    });

    setCards((prev) => {
      let gained = 0;

      const updated = prev
        .map((c) => ({ ...c, z: c.z + speedRef.current }))
        .filter((card) => {
          const collect = card.z > 1.3 && card.z < 2.8;
          const sameLane = card.lane === laneRef.current;

          if (collect && sameLane && jumpRef.current) {
            gained += 10;
            return false;
          }

          return card.z < 8;
        });

      if (gained > 0) {
        playCardSound();

        setScore((s) => {
          const newScore = s + gained;

          setHighScore((currentHighScore) => {
            if (newScore > currentHighScore) {
              localStorage.setItem("signRunnerHighScore", String(newScore));
              return newScore;
            }

            return currentHighScore;
          });

          return newScore;
        });
      }

      return updated;
    });
  });

  return (
    <>
      <Road />

      <Suspense fallback={null}>
        <Runner lane={lane} playerY={playerYRef} />
      </Suspense>

      {obstacles.map((o) => (
        <Obstacle key={o.id} lane={o.lane} z={o.z} />
      ))}

      {cards.map((c) => (
        <SignCard key={c.id} lane={c.lane} z={c.z} name={c.name} />
      ))}

      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 8, 5]} intensity={1.5} />

      <Text position={[-4, 3, 2]} fontSize={0.6} color="#ffffff">
        Score: {score}
      </Text>

      <Text position={[4, 3, 2]} fontSize={0.42} color="#ffffff">
        Record: {highScore}
      </Text>

      {gameOver && (
        <Text position={[0, 3.5, 1]} fontSize={0.65} color="#ffffff">
          Game Over - Press Enter
        </Text>
      )}

      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </>
  );
}

export default function GamePage() {
  const router = useRouter();

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-var(--theme-main)-400 to-var(--theme-main)-100">
      <button
  onClick={() => router.push("/home")}
  className="absolute top-6 left-6 z-[100] rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)] shadow-lg"
>
  ← Back
</button>
      <Canvas camera={{ position: [0, 4, 8], fov: 55 }}>
        <GameScene />
      </Canvas>

      <div className="absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-4">
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }))}
          className="rounded-xl bg-white px-5 py-3 font-bold text-orange-700 shadow"
        >
          ← Left
        </button>

        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }))}
          className="rounded-xl bg-orange-600 px-5 py-3 font-bold text-white shadow"
        >
          ↑ Jump
        </button>

        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }))}
          className="rounded-xl bg-white px-5 py-3 font-bold text-orange-700 shadow"
        >
          Right →
        </button>
      </div>
    </main>
  );
} 

useGLTF.preload("/models/runner.glb");