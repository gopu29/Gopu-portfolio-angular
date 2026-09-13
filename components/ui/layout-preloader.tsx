"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface LayoutPreloaderProps {
  heroImage?: string
  heroTitle?: string
  heroSubtitle?: string
  duration?: number
  onComplete?: () => void
  className?: string
}

export default function LayoutPreloader({
  heroImage = "after2.jpg",
  heroTitle = "Govinda P B",
  heroSubtitle = "Full Stack Developer | Angular & Ionic Specialist",
  duration = 2400,
  onComplete,
  className,
}: LayoutPreloaderProps) {
  const [phase, setPhase] = useState<"loading" | "preview" | "revealing" | "done">("loading")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startTime = performance.now()
    const fillMs = duration * 0.55

    const interval = requestAnimationFrame(function animate(now) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / fillMs, 1)
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const p = Math.round(ease * 100)
      setProgress(p)

      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        setPhase("preview")
        setTimeout(() => {
          setPhase("revealing")
          setTimeout(() => {
            setPhase("done")
            onComplete?.()
          }, 800)
        }, 900)
      }
    })

    return () => cancelAnimationFrame(interval)
  }, [duration, onComplete])

  if (phase === "done") return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[150] flex items-center justify-center overflow-hidden bg-[#0a0a0a] text-white select-none",
        className
      )}
    >
      {/* Staggered shutter curtain columns */}
      <div className="absolute inset-0 grid grid-cols-5 pointer-events-none z-20">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-full w-full bg-[#0a0a0a] transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]",
              phase === "revealing" ? "-translate-y-full" : "translate-y-0"
            )}
            style={{ transitionDelay: `${i * 70}ms` }}
          />
        ))}
      </div>

      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: "noise-animation 0.4s steps(3) infinite",
        }}
      />

      {/* Loading Phase */}
      {phase === "loading" && (
        <div className="relative z-10 flex flex-col items-center gap-6 text-center animate-fade-in">
          {/* Morph loader */}
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 flex items-center justify-center">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 bg-white shadow-[0_0_15px_rgba(207,128,71,0.5)]"
                  style={{
                    animation: `morph-${i} 2s infinite ease-in-out`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight">{heroTitle}</span>
            <span className="text-xs text-white/50">{heroSubtitle}</span>
          </div>
          <div className="w-64 flex flex-col gap-2">
            <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#cf8047] to-white transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] uppercase tracking-wider text-white/40 font-mono">
              <span>Initializing</span>
              <span>{String(progress).padStart(3, "0")}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section Preview Phase */}
      {(phase === "preview" || phase === "revealing") && (
        <div
          className={cn(
            "relative z-10 w-[min(90vw,680px)] aspect-[16/10] rounded-2xl overflow-hidden border border-white/20 shadow-2xl transition-all duration-700",
            phase === "revealing"
              ? "scale-110 opacity-0 blur-sm"
              : "scale-100 opacity-100 animate-scale-up"
          )}
        >
          <img
            src={heroImage}
            alt="Hero Preview"
            className="absolute inset-0 w-full h-full object-cover transform scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent" />
          <div className="absolute top-4 inset-x-4 flex justify-between items-center text-[10px] tracking-widest uppercase font-mono text-white/70">
            <div className="flex items-center gap-2 bg-[#0a0a0a]/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hero Section Preview</span>
            </div>
            <span className="bg-[#0a0a0a]/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              Portfolio 2025
            </span>
          </div>
          <div className="absolute bottom-6 inset-x-6 flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">{heroTitle}</h2>
            <p className="text-sm text-white/70">{heroSubtitle}</p>
          </div>
        </div>
      )}
    </div>
  )
}
