"use client";

import { useEffect, useState } from "react";


const images = [
  "/images/students/student1.jpeg",
  "/images/students/student2.jpeg",
  "/images/students/student3.jpeg",
  "/images/students/student4.jpeg",
];

export default function AuthSlideshow() {
  const [current, setCurrent] = useState(0);
  const [validImages, setValidImages] = useState<string[]>(images);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden border-r border-[var(--border)] bg-[var(--surface)]">
      {validImages.map((image, index) => (
        <img
          key={image}
          src={image}
          alt={`Student slide ${index + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            current === index ? "opacity-100" : "opacity-0"
          }`}
          onError={() => {
            setValidImages((prev) => prev.filter((img) => img !== image));
          }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-8">
        <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-white/70">
          Pakistan Sign Language
        </p>
        <p className="mt-2 max-w-sm text-lg leading-snug text-white">
          Learn, practise and be understood.
        </p>
      </div>
    </div>
  );
}