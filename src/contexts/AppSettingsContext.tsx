import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark";
type Dictionary = Record<string, string>;

const dictionary: Dictionary = {
  theme: "Theme",
  dark: "Dark",
  light: "Light",
  english: "English",
  logout: "Logout",
  signin: "Sign in",
  dashboard: "Dashboard",
  challenges: "Challenges",
  tryDemo: "Try Demo Challenge",
  verifiedPlatform: "VERIFIED TECH HIRING PLATFORM",
  heroTitle1: "Verify engineers by",
  heroTitle2: "proof,",
  heroTitle3: "not assumptions.",
  heroDesc:
    "DevVerify runs invite-based coding assessments with AI-assisted evaluation, timed challenges, and recruiter-ready reporting.",
  privacy: "Privacy",
  privacyTerms: "Privacy Terms",
  copyUrl: "Copy URL",
  deletePosition: "Delete Position",
  deleting: "Deleting...",
  confirmDeleteTitle: "Delete this position?",
  confirmDeleteDesc:
    "This action cannot be undone. The invite link and related submissions access will be affected.",
  cancel: "Cancel",
  confirmDelete: "Yes, Delete",
  back: "Back",
};

type AppSettingsContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  t: (key: string, fallback?: string) => string;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("theme") as ThemeMode | null;
    return stored === "light" || stored === "dark" ? stored : "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  );

  const t = useCallback(
    (key: string, fallback?: string) => dictionary[key] ?? fallback ?? key,
    [],
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, t }),
    [theme, setTheme, toggleTheme, t],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return context;
}
