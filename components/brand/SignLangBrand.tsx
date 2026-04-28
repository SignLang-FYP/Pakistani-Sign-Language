"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import handWave from "./animations/hand_wave.json";

export default function SignLangBrand() {
  const [t, setT] = useState(0);

  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame += 0.05;
      setT(frame);
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const offsetY = Math.sin(t) * 5;
  const opacity = 0.9 + Math.sin(t) * 0.1;

  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        transform: `translateY(${offsetY}px)`,
        opacity,
      }}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="w-20 h-20 mb-3">
          <Lottie animationData={handWave} loop />
        </div>

        <h1 className="text-5xl font-extrabold text-white leading-none">
          SignLang
        </h1>

        <p className="mt-3 italic text-white/80 text-lg">
          "Empowering Communication Beyond Words"
        </p>
      </div>
    </div>
  );
}