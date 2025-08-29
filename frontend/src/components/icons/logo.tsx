import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex items-center space-x-2", className)}
      viewBox="0 0 100 100"
      width="100"
      height="100"
    >
      {/* Simple House */}
      <g id="house" fill="#6366f1">
        {/* House Base */}
        <rect x="25" y="45" width="50" height="40" rx="2" />

        {/* House Roof */}
        <polygon points="20,50 50,25 80,50" />

        {/* Door */}
        <rect x="42" y="65" width="16" height="20" rx="8" fill="white" />

        {/* AI Dot */}
        <circle cx="85" cy="35" r="4" fill="#06b6d4" />
      </g>
    </svg>
  );
}
