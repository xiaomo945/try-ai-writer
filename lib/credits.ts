"use client";

import { useState, useCallback, useEffect } from "react";

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
}

export const creditPackages: CreditPackage[] = [
  { id: "small", credits: 50, price: 5 },
  { id: "medium", credits: 150, price: 12 },
  { id: "large", credits: 500, price: 35 },
];

export function getCost(
  operation: "deepseek" | "claude" | "file-upload"
): number {
  switch (operation) {
    case "deepseek":
      return 1;
    case "claude":
      return 5;
    case "file-upload":
      return 3;
    default:
      return 1;
  }
}

export function useCredits() {
  const [balance, setBalance] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("use-ai-writer-credits");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("use-ai-writer-credits", balance.toString());
    }
  }, [balance]);

  const usePoints = useCallback(
    (amount: number): boolean => {
      if (balance >= amount) {
        setBalance((prev) => prev - amount);
        return true;
      }
      return false;
    },
    [balance]
  );

  const addPoints = useCallback((amount: number): void => {
    setBalance((prev) => prev + amount);
  }, []);

  return {
    balance,
    usePoints,
    addPoints,
    getCost,
  };
}
