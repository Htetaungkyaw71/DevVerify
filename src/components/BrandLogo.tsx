type BrandLogoProps = {
  className?: string;
  textClassName?: string;
  markClassName?: string;
  showText?: boolean;
  compact?: boolean;
};

export default function BrandLogo({
  className = "",
  textClassName = "",
  markClassName = "",
  showText = true,
  compact = false,
}: BrandLogoProps) {
  return (
    <div
      className={`inline-flex items-center ${compact ? "gap-2" : "gap-3"} ${className}`}
    >
      <img src="/devLogo.png" width={40} height={40} />
      {/* <div
        className={`relative overflow-hidden ${compact ? "w-8 h-8" : "w-10 h-10"} rounded-md bg-primary text-primary-foreground flex items-center justify-center glow-primary ${markClassName}`}
      >
        <span
          className={`font-bold ${compact ? "text-xs" : "text-sm"} tracking-tight`}
        >
          DV
        </span>
      </div> */}
      {showText && (
        <span
          className={`font-semibold tracking-tight ${compact ? "text-base" : "text-xl"} ${textClassName}`}
        >
          DevVerify
        </span>
      )}
    </div>
  );
}
