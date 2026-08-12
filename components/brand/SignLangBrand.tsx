"use client";

import Lottie from "lottie-react";
import handWave from "./animations/hand_wave.json";

export default function SignLangBrand() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 h-14 w-14">
        <Lottie animationData={handWave} loop />
      </div>

      <h1 className="text-4xl tracking-tight">SignLang</h1>

      <p className="muted mt-2 text-[15px]">
        Empowering communication beyond words
      </p>
    </div>
  );
}
