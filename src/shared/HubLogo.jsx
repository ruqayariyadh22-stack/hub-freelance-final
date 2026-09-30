import React from "react";
export default function HubLogo({
  size = "md",
  showText = false,
  subtitle = "",
}) {
  const large = size === "lg";
  const logoSize = large ? 82 : 56;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 100 100"
        role="img"
        aria-label="Hub Freelance Logo"
      >
        {/* Outer decorative circle */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="#f8f3e9"
          stroke="#145c5c"
          strokeWidth="2.5"
        />
        {/* Small decorative dots */}
        <circle cx="50" cy="7" r="2.5" fill="#c9a24d" />
        <circle cx="50" cy="93" r="2.5" fill="#c9a24d" />
        <circle cx="7" cy="50" r="2.5" fill="#c96f3b" />
        <circle cx="93" cy="50" r="2.5" fill="#c96f3b" />
        {/* Decorative diamond */}
        <path
          d="M50 13 L54 17 L50 21 L46 17 Z"
          fill="#c9a24d"
        />
        {/* H */}
        <text
          x="55"
          y="73"
          textAnchor="middle"
          fontSize="72"
          fontWeight="800"
          fontFamily="Georgia, serif"
          fill="none"
          stroke="#145c5c"
          strokeWidth="4"
          strokeLinejoin="round"
        >
          H
        </text>
        {/* F */}
        <text
          x="44"
          y="73"
          textAnchor="middle"
          fontSize="72"
          fontWeight="800"
          fontFamily="Georgia, serif"
          fill="none"
          stroke="#c96f3b"
          strokeWidth="4"
          strokeLinejoin="round"
        >
          F
        </text>
        {/* Small center ornament */}
        <circle
          cx="50"
          cy="51"
          r="3"
          fill="#c9a24d"
        />
        {/* Bottom decorative line */}
        <path
          d="M35 84 Q50 89 65 84"
          fill="none"
          stroke="#c9a24d"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <strong
            style={{
              color: "#145c5c",
              fontSize: large ? "20px" : "16px",
              fontWeight: "700",
              letterSpacing: "0.3px",
            }}
          >
            Hub Freelance
          </strong>
          {subtitle && (
            <span
              style={{
                color: "#75817d",
                fontSize: "11px",
                marginTop: "3px",
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}