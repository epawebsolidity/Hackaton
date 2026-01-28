// src/context/ActiveTabContext.tsx

"use client"; // <-- Menandai file ini sebagai Client Component

import React, { createContext, useState, useContext, ReactNode } from "react";

// Definisikan tipe untuk context
interface ActiveTabContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Membuat context dengan nilai default
const ActiveTabContext = createContext<ActiveTabContextType | undefined>(
  undefined,
);

// Membuat Provider untuk ActiveTabContext
export const ActiveTabProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<string>("Followed");

  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
};

// Hook untuk menggunakan ActiveTabContext
export const useActiveTab = () => {
  const context = useContext(ActiveTabContext);
  if (!context) {
    throw new Error("useActiveTab must be used within an ActiveTabProvider");
  }
  return context;
};
