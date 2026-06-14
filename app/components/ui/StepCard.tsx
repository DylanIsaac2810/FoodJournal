'use client';

import { ReactNode } from "react";

interface StepCardProps {
  number: string;
  icon: ReactNode;
  title: string;
  desc: string;
}

export function StepCard({ number, icon, title, desc }: StepCardProps) {
  return (
    <div
      className="relative p-8 rounded-3xl transition-transform"
      style={{ backgroundColor: "rgba(255,243,176,0.07)", border: "1px solid rgba(255,243,176,0.12)" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-6px)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")}
    >
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 48,
          fontWeight: 500,
          color: "rgba(224,159,62,0.25)",
          position: "absolute",
          top: 16,
          right: 24,
          lineHeight: 1,
        }}
      >
        {number}
      </div>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: "#9E2A2B", color: "#fff" }}
      >
        {icon}
      </div>
      <h3
        className="mb-3"
        style={{ fontFamily: "'Playfair Display', serif", color: "#FFF3B0", fontWeight: 700, fontSize: 20 }}
      >
        {title}
      </h3>
      <p style={{ color: "rgba(255,243,176,0.65)", lineHeight: 1.7, fontSize: 15 }}>
        {desc}
      </p>
    </div>
  );
}