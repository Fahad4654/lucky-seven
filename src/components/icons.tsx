import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10.21,7.5a3,3,0,0,1,5.58,0" fill="hsl(var(--primary))" stroke="none" />
      <path d="M8,7.5H16" stroke="hsl(var(--primary))" />
      <path d="M16,7.5l-4,9H7.5" stroke="hsl(var(--primary))" />
      <path d="M14.21,7.5a3,3,0,0,1,5.58,0" fill="hsl(var(--primary))" stroke="none" />
      <path d="M12,7.5H20" stroke="hsl(var(--primary))" />
      <path d="M20,7.5l-4,9H11.5" stroke="hsl(var(--primary))" />
    </svg>
  );
}
