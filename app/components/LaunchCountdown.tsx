'use client'

import React, { useState, useEffect } from 'react'

export function LaunchCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isVisible, setIsVisible] = useState(true)

  // Calculate launch date: 7 days from now
  const getLaunchDate = () => {
    const now = new Date()
    const launch = new Date(now)
    launch.setDate(now.getDate() + 7)
    return launch
  }

  const calculateTimeLeft = () => {
    const difference = getLaunchDate().getTime() - new Date().getTime()
    
    if (difference <= 0) {
      setIsVisible(false)
      return
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    setTimeLeft({ days, hours, minutes, seconds })
  }

  useEffect(() => {
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="w-full bg-emerald-600 text-white py-4 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">🚀</span>
          <span className="text-sm md:text-lg font-semibold">Product Hunt Launch in</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex flex-col items-center bg-white/20 rounded-lg px-3 py-2 md:px-4 md:py-2">
            <span className="text-xl md:text-3xl font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-xs md:text-sm">Days</span>
          </div>
          <span className="text-xl md:text-2xl font-bold">:</span>
          <div className="flex flex-col items-center bg-white/20 rounded-lg px-3 py-2 md:px-4 md:py-2">
            <span className="text-xl md:text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-xs md:text-sm">Hours</span>
          </div>
          <span className="text-xl md:text-2xl font-bold">:</span>
          <div className="flex flex-col items-center bg-white/20 rounded-lg px-3 py-2 md:px-4 md:py-2">
            <span className="text-xl md:text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-xs md:text-sm">Minutes</span>
          </div>
          <span className="text-xl md:text-2xl font-bold">:</span>
          <div className="flex flex-col items-center bg-white/20 rounded-lg px-3 py-2 md:px-4 md:py-2">
            <span className="text-xl md:text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-xs md:text-sm">Seconds</span>
          </div>
        </div>

        <button
          onClick={() => console.log('Notify me clicked')}
          className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 md:px-6 md:py-2 rounded-lg font-semibold text-sm md:text-base transition-colors shadow-md"
        >
          Notify Me
        </button>
      </div>
    </div>
  )
}
