import { ReactNode } from "react";

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  variant?: "glass" | "card";
}

export const Surface = ({ children, className = "", variant = "glass" }: SurfaceProps) => (
  <div className={`${variant === "glass" ? "surface-glass" : "surface-card"} ${className}`}>
    {children}
  </div>
);
