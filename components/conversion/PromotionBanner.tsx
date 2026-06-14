"use client";

import { useState, useEffect } from "react";

interface Promotion {
  id: string;
  code: string;
  discount: number;
  title: string;
  description: string;
  validFrom: string;
  validUntil: string;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
}

export function usePromotion() {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBestPromotion();
  }, []);

  const fetchBestPromotion = async () => {
    try {
      const res = await fetch("/api/promotions?best=true");
      const data = await res.json();
      setPromotion(data.promotion);
    } catch (error) {
      console.error("Failed to fetch promotion:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    promotion,
    loading,
    fetchBestPromotion,
  };
}

export function PromotionBanner() {
  const { promotion, loading } = usePromotion();
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!promotion) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(promotion.validUntil);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("已过期");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}天${hours}小时`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}小时${minutes}分钟`);
      } else {
        setTimeLeft(`${minutes}分钟`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [promotion]);

  if (loading || !promotion || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base">
                {promotion.title}
              </p>
              <p className="text-xs sm:text-sm opacity-90">
                {promotion.description} · 优惠码：
                <span className="font-mono font-bold">{promotion.code}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs opacity-90">剩余时间</p>
              <p className="font-mono font-bold text-sm">{timeLeft}</p>
            </div>
            <button className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold text-sm hover:bg-red-50 transition-colors whitespace-nowrap">
              立即使用
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PromotionBadge({ code }: { code: string }) {
  const [discount, setDiscount] = useState<number | null>(null);

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const res = await fetch(`/api/promotions?code=${code}&price=100`);
        if (res.ok) {
          const data = await res.json();
          setDiscount(data.discount || null);
        }
      } catch (error) {
        console.error("Failed to fetch discount:", error);
      }
    };

    fetchDiscount();
  }, [code]);

  if (!discount) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <span>-{discount}%</span>
    </div>
  );
}
