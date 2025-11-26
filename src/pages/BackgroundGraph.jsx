import React from "react";

export default function BackgroundGraph() {
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        opacity: 0.9
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1200" height="800" fill="url(#g1)" />

      
      <g stroke="rgba(255,255,255,0.06)" strokeWidth="1">
        <line x1="200" y1="100" x2="600" y2="160" />
        <line x1="400" y1="300" x2="900" y2="350" />
        <line x1="100" y1="520" x2="500" y2="430" />
      </g>

      
      <g fill="white" opacity="0.06">
        <circle cx="200" cy="100" r="6" />
        <circle cx="600" cy="160" r="8" />
        <circle cx="400" cy="300" r="7" />
        <circle cx="900" cy="350" r="8" />
        <circle cx="100" cy="520" r="6" />
      </g>
    </svg>
  );
}
