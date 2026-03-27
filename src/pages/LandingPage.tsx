import {
  Cpu,
  UserCheck,
  BarChart3,
  ArrowRight,
  Terminal,
  ChevronRight,
  ChevronDown,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Surface } from "@/components/ui/Surface";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { persistor } from "@/store";
import { authApi } from "@/store/authApi";
import { challengesApi } from "@/store/challengesApi";
import { positionsApi } from "@/store/positionsApi";
import { submissionsApi } from "@/store/submissionsApi";
import BrandLogo from "@/components/BrandLogo";
import AppSettingsControls from "@/components/AppSettingsControls";
import { useAppSettings } from "@/contexts/AppSettingsContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

const features = [
  {
    icon: Cpu,
    title: "AI-Powered Code Review",
    description:
      "Our AI engine analyzes code quality, security patterns, and performance in real-time.",
    tag: "CORE",
  },
  {
    icon: UserCheck,
    title: "Identity Verification",
    description:
      "Ensure candidate authenticity with browser-level proctoring and session fingerprinting.",
    tag: "SECURITY",
  },
  {
    icon: BarChart3,
    title: "Interactive Reports",
    description:
      "Skill radar charts, code playback, and AI-annotated insights for every submission.",
    tag: "ANALYTICS",
  },
];

const stats = [
  { value: "50K+", label: "Assessments Run" },
  { value: "92%", label: "Recruiter Satisfaction" },
  { value: "<2min", label: "AI Review Time" },
  { value: "340+", label: "Companies Trust Us" },
];

export default function LandingPage() {
  const { t } = useAppSettings();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    const parsedUser = userData ? JSON.parse(userData) : null;

    if (!token) {
      setLoading(false);
      return;
    }

    const getUser = async () => {
      try {
        const response = await api.get("/me");
        setUser(response.data.user);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (!parsedUser) {
      void getUser();
    } else {
      setUser(parsedUser);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!showUserMenu) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(authApi.util.resetApiState());
    dispatch(challengesApi.util.resetApiState());
    dispatch(positionsApi.util.resetApiState());
    dispatch(submissionsApi.util.resetApiState());

    await persistor.purge();
    localStorage.removeItem("userData");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("devverify:draft:")) {
        localStorage.removeItem(key);
      }
    });

    setUser(null);
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center">
            <BrandLogo compact textClassName="text-foreground" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {user && (
              <Link
                to="/dashboard"
                className="hover:text-foreground transition-colors"
              >
                {t("dashboard")}
              </Link>
            )}

            <Link
              to="/challenges"
              className="hover:text-foreground transition-colors"
            >
              {t("challenges")}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <AppSettingsControls />
            {loading ? null : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 ring-1 ring-border bg-secondary/50 hover:bg-accent transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">
                      {String(user?.username || "U")
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="text-left leading-tight">
                    <p className="text-sm text-foreground font-medium line-clamp-1 max-w-[120px]">
                      {user?.username}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 rounded-md border border-border bg-background/95 backdrop-blur p-1.5 shadow-lg z-50">
                    <div className="px-2 py-1.5 border-b border-border/60 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email || t("signin")}
                      </p>
                    </div>
                    <div className="md:hidden px-1 pb-1 border-b border-border/60 mb-1 space-y-0.5">
                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-2 py-2 text-sm rounded hover:bg-accent text-foreground block"
                      >
                        {t("dashboard")}
                      </Link>
                      <Link
                        to="/challenges"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-2 py-2 text-sm rounded hover:bg-accent text-foreground block"
                      >
                        {t("challenges")}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent text-foreground inline-flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground"
              >
                {t("signin")}
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 ring-1 ring-primary/20 text-primary text-xs font-mono mb-8"
            >
              <ShieldCheck size={14} />
              {t("verifiedPlatform")}
              <ChevronRight size={12} />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl md:text-7xl font-bold tracking-tight-custom text-foreground leading-[1.05] mb-6"
            >
              {t("heroTitle1")}{" "}
              <span className="text-gradient-primary">{t("heroTitle2")}</span>
              <br />
              {t("heroTitle3")}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
            >
              {t("heroDesc")}
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/challenges"
                className="flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium bg-secondary text-secondary-foreground ring-1 ring-border hover:bg-accent transition-all active:scale-[0.98]"
              >
                <Terminal size={16} />
                {t("tryDemo")}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={4}
            initial="hidden"
            animate="visible"
            className="mt-16 max-w-4xl mx-auto"
          >
            <Surface className="p-0">
              <div className="h-10 border-b border-border/50 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-3">
                  solution.ts
                </span>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed">
                <div className="text-muted-foreground">
                  <span className="text-primary">class</span>{" "}
                  <span className="text-yellow-300">LRUCache</span>
                  <span className="text-foreground">{" {"}</span>
                </div>
                <div className="pl-4 text-muted-foreground">
                  <span className="text-primary">private</span> capacity:{" "}
                  <span className="text-success">number</span>;
                </div>
                <div className="pl-4 text-muted-foreground">
                  <span className="text-primary">private</span> cache:{" "}
                  <span className="text-success">Map</span>
                  {"<"}
                  <span className="text-success">number</span>,{" "}
                  <span className="text-success">number</span>
                  {">"};
                </div>
                <div className="pl-4 mt-2 text-muted-foreground">
                  <span className="text-primary">constructor</span>(capacity:{" "}
                  <span className="text-success">number</span>){" {"}
                </div>
                <div className="pl-8 text-muted-foreground">
                  <span className="text-primary">this</span>.capacity =
                  capacity;
                </div>
                <div className="pl-8 text-muted-foreground">
                  <span className="text-primary">this</span>.cache ={" "}
                  <span className="text-primary">new</span>{" "}
                  <span className="text-success">Map</span>();
                </div>
                <div className="pl-4 text-foreground">{"}"}</div>
                <div className="text-foreground">{"}"}</div>
              </div>
            </Surface>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs font-mono text-primary uppercase tracking-widest mb-3"
            >
              PLATFORM CAPABILITIES
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl md:text-4xl font-bold tracking-tight-custom text-foreground"
            >
              Built for engineering teams
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <Surface className="p-6 h-full hover:ring-primary/20 transition-all duration-200 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                      <feature.icon className="text-primary" size={20} />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Surface>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="stats" className="py-20 border-t border-border/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-foreground font-mono tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/30 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BrandLogo compact showText={false} className="gap-0" />
            <span className="font-mono text-xs">DevVerify © 2026</span>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground font-mono">
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              to="/privacy-terms"
              className="hover:text-foreground transition-colors"
            >
              {t("privacyTerms")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
