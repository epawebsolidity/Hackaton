"use client";

import { createContext, useContext, useEffect, useState } from "react";

type LightContextType = {
  isDark: boolean;
  toggle: () => void;
};

const LightContext = createContext<LightContextType | null>(null);

export function LightProvider({ children }: { children: React.ReactNode }) {
  // Menyimpan preferensi tema gelap berdasarkan localStorage
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false; // Cegah jika di server-side
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" ? true : false; // Jika ada tema yang disimpan, gunakan itu
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    // Simpan pilihan tema ke localStorage
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Fungsi untuk toggle tema gelap
  const toggle = () => setIsDark((prev) => !prev);

  return (
    <LightContext.Provider value={{ isDark, toggle }}>
      {children}
    </LightContext.Provider>
  );
}

export const useLight = () => {
  const ctx = useContext(LightContext);
  if (!ctx) {
    throw new Error("useLight must be used inside LightProvider");
  }
  return ctx;
};
