"use client"

import * as React from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { icon: 24, text: "text-sm" },
  md: { icon: 32, text: "text-base" },
  lg: { icon: 40, text: "text-lg" },
  xl: { icon: 48, text: "text-xl" },
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { icon, text } = sizeMap[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon size={icon} />
      {showText && (
        <span className={`font-black tracking-tight ${text}`}>
          <span className="text-white">THUMB</span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">MAX</span>
        </span>
      )}
    </div>
  )
}

export function LogoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Main gradient */}
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        {/* Glow gradient */}
        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>

        {/* Inner shadow */}
        <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset in="blur" dx="1" dy="2" result="offsetBlur" />
          <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
        </filter>

        {/* Outer glow */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background frame - rounded rectangle representing thumbnail */}
      <rect
        x="4"
        y="8"
        width="40"
        height="32"
        rx="6"
        fill="url(#logoGradient)"
        filter="url(#glow)"
      />

      {/* Inner dark area */}
      <rect
        x="7"
        y="11"
        width="34"
        height="26"
        rx="4"
        fill="#0a0a0f"
        opacity="0.9"
      />

      {/* Play button triangle */}
      <path
        d="M20 18L32 24L20 30V18Z"
        fill="url(#glowGradient)"
        filter="url(#innerShadow)"
      />

      {/* Sparkle/AI indicator - top right */}
      <circle cx="38" cy="14" r="3" fill="white" opacity="0.9" />
      <circle cx="38" cy="14" r="1.5" fill="url(#logoGradient)" />

      {/* Small accent dots */}
      <circle cx="12" cy="34" r="1.5" fill="url(#glowGradient)" opacity="0.7" />
      <circle cx="36" cy="34" r="1" fill="white" opacity="0.5" />
    </svg>
  )
}

// Animated version for loading states
export function LogoAnimated({ size = 48 }: { size?: number }) {
  return (
    <div className="relative">
      <LogoIcon size={size} className="animate-pulse" />
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl animate-pulse"
        style={{ width: size, height: size }}
      />
    </div>
  )
}

// Minimal icon version for favicons/small uses
export function LogoMinimal({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="miniGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      {/* Rounded square frame */}
      <rect
        x="2"
        y="4"
        width="28"
        height="24"
        rx="4"
        fill="url(#miniGradient)"
      />

      {/* Play triangle */}
      <path
        d="M13 11L21 16L13 21V11Z"
        fill="white"
      />
    </svg>
  )
}

export default Logo
