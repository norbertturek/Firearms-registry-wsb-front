import { cn } from "./ui/utils";

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
} as const;

type AppLogoProps = {
  size?: keyof typeof sizeClasses;
  className?: string;
};

export function AppLogo({ size = "md", className }: AppLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="e-Broń"
      className={cn("object-contain", sizeClasses[size], className)}
    />
  );
}
