export function Arrow({
  diagonal = false,
  className = "",
}: {
  diagonal?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={`arrow ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function Mark() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M29 10H16a6 6 0 0 0 0 12h8a4 4 0 1 1 0 8H11M20 30 30 10l9 20M26 24h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="30" r="2" fill="currentColor" />
    </svg>
  );
}
export function Topography({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`topography ${className}`}
      viewBox="0 0 700 700"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: 14 }, (_, i) => (
        <path
          key={i}
          d={`M${-180 + i * 20} -30 C${450 + i * 15} ${60 + i * 6}, ${-180 + i * 18} ${370 + i * 10}, ${250 + i * 22} ${410 + i * 17} S${520 + i * 17} 760, 850 630`}
          stroke="currentColor"
          strokeWidth=".7"
        />
      ))}
      <path
        className="trail-line"
        d="M60 580C150 510 90 365 240 370S315 190 430 240 480 105 610 65"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="5 7"
      />
      <circle cx="60" cy="580" r="5" fill="currentColor" />
      <circle cx="610" cy="65" r="5" fill="currentColor" />
    </svg>
  );
}
