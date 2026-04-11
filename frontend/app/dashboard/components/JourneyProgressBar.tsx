"use client";

const LEVELS = [
  { num: 1, name: "Foundations" },
  { num: 2, name: "Building" },
  { num: 3, name: "Expanding" },
  { num: 4, name: "Full Journey" },
];

interface JourneyProgressBarProps {
  currentLevel: number;
  levelName: string;
}

export default function JourneyProgressBar({
  currentLevel,
  levelName,
}: JourneyProgressBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 16px",
        background: "rgba(30,58,47,0.03)",
        borderRadius: "10px",
        border: "1px solid rgba(30,58,47,0.07)",
        marginBottom: "24px",
      }}
    >
      {/* Level label */}
      <span
        style={{
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(30,58,47,0.4)",
          fontFamily: "DM Sans, sans-serif",
          flexShrink: 0,
        }}
      >
        Your journey
      </span>

      {/* Dots */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {LEVELS.map((l, i) => (
          <div
            key={l.num}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            {/* Dot */}
            <div
              title={l.name}
              style={{
                width: l.num === currentLevel ? "10px" : "7px",
                height: l.num === currentLevel ? "10px" : "7px",
                borderRadius: "50%",
                background:
                  l.num <= currentLevel
                    ? "var(--amber, #C4793A)"
                    : "rgba(30,58,47,0.12)",
                transition: "all 0.3s ease",
                flexShrink: 0,
                boxShadow:
                  l.num === currentLevel
                    ? "0 0 0 3px rgba(196,121,58,0.15)"
                    : "none",
              }}
            />
            {/* Connector line between dots */}
            {i < LEVELS.length - 1 && (
              <div
                style={{
                  width: "20px",
                  height: "1px",
                  background:
                    l.num < currentLevel
                      ? "var(--amber, #C4793A)"
                      : "rgba(30,58,47,0.1)",
                  transition: "background 0.4s ease",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current level name */}
      <span
        style={{
          fontSize: "11px",
          fontFamily: "DM Sans, sans-serif",
          color: "var(--amber, #C4793A)",
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        {levelName}
      </span>
    </div>
  );
}
