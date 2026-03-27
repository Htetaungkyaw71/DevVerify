import { Moon, Sun } from "lucide-react";
import { useAppSettings } from "@/contexts/AppSettingsContext";

export default function AppSettingsControls() {
  const { theme, toggleTheme, t } = useAppSettings();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? t("light") : t("dark")}
      title={theme === "dark" ? t("light") : t("dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
