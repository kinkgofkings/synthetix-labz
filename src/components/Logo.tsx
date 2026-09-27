export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="1" y="1" width="62" height="62" rx="10" fill="#0a0a12" stroke="#00f0ff" strokeWidth="1.5" />
      <path d="M32 8 L52 19.5 V44.5 L32 56 L12 44.5 V19.5 Z" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
      <path d="M36 16 L24 34 H33 L28 48 L44 28 H34 Z" fill="#00f0ff" />
    </svg>
  );
}
