"use client";
import { createContext, useState, useContext, ReactNode } from "react";

interface CidContextType {
  cid: string | null;
  setCid: (c: string | null) => void;
}

const CidContext = createContext<CidContextType | undefined>(undefined);

export function CidProvider({ children }: { children: ReactNode }) {
  const [cid, setCid] = useState<string | null>(null);
  return (
    <CidContext.Provider value={{ cid, setCid }}>
      {children}
    </CidContext.Provider>
  );
}

export function useCid() {
  const ctx = useContext(CidContext);
  if (!ctx) throw new Error("useCid must be used within CidProvider");
  return ctx;
}
