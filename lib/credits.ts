"use client";

import { useState, useCallback, useEffect } from "react";
import { createStorage } from "./storage";

const storage = createStorage("credits");

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
    const saved = storage.get<string>("balance");
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    storage.set("balance", balance.toString());
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
