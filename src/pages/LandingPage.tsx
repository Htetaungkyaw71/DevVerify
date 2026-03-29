import {
  Cpu,
  UserCheck,
  BarChart3,
  Terminal,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Surface } from "@/components/ui/Surface";
import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import MainNavbar from "@/components/MainNavbar";
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNavbar />

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
