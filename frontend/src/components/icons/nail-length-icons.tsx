import type { SVGProps } from "react";

interface NailLengthIconProps extends SVGProps<SVGSVGElement> {
  length: "natural" | "slightly-extended" | "medium" | "long";
}

export function NailLengthIcon({ length, ...props }: NailLengthIconProps) {
  const getArrowPath = () => {
    switch (length) {
      case "natural":
        return "M12 20L12 16";
      case "slightly-extended":
        return "M12 20L12 14";
      case "medium":
        return "M12 20L12 12";
      case "long":
        return "M12 20L12 8";
    }
  };

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d={getArrowPath()} />
    </svg>
  );
}
