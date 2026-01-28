"use client";

import { useLight } from "@/context/LightContext";

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark } = useLight();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 
      ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
    >
      {children}
    </div>
  );
}
