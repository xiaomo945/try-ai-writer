"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Rocket, X } from "lucide-react";

export function LaunchCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem("launch-countdown-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Set launch date to 7 days from now (or use stored date)
    const storedDate = localStorage.getItem("launch-countdown-date");
    let launchDate: Date;
    
    if (storedDate) {
      launchDate = new Date(storedDate);
    } else {
      launchDate = new Date();
      launchDate.setDate(launchDate.getDate() + 7);
      localStorage.setItem("launch-countdown-date", launchDate.toISOString());
    }

    const calculateTimeLeft = () => {
      const difference = launchDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("launch-countdown-dismissed", "true");
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-4">
        <Link 
          href="https://www.producthunt.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-white hover:text-emerald-100 transition-colors"
        >
          <Rocket className="w-5 h-5 animate-bounce" />
          <span className="font-semibold hidden sm:inline">
            🚀 Launching on Product Hunt in
          </span>
          <span className="font-semibold sm:hidden">
            🚀 Product Hunt in
          </span>
        </Link>
        
        <div className="flex items-center gap-2 font-mono text-white font-bold">
          <div className="bg-white/20 rounded-lg px-3 py-1 min-w-[3rem] text-center">
            <span className="text-lg sm:text-xl">{timeLeft.days}</span>
            <span className="text-xs block opacity-80">days</span>
          </div>
          <span className="text-xl">:</span>
          <div className="bg-white/20 rounded-lg px-3 py-1 min-w-[3rem] text-center">
            <span className="text-lg sm:text-xl">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-xs block opacity-80">hrs</span>
          </div>
          <span className="text-xl">:</span>
          <div className="bg-white/20 rounded-lg px-3 py-1 min-w-[3rem] text-center">
            <span className="text-lg sm:text-xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-xs block opacity-80">min</span>
          </div>
          <span className="text-xl hidden sm:inline">:</span>
          <div className="bg-white/20 rounded-lg px-3 py-1 min-w-[3rem] text-center hidden sm:block">
            <span className="text-lg sm:text-xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-xs block opacity-80">sec</span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Dismiss countdown"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
