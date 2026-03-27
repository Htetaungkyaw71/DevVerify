import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle2,
  Code2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BrandLogo from "@/components/BrandLogo";
import { useEffect } from "react";

type SubmissionScores = {
  logic: number;
  security: number;
  readability: number;
  performance: number;
  cleanliness: number;
};

type ReportSubmission = {
  id: string;
  name: string;
  email: string;
  challenge: string;
  challengeId?: string;
  score: number;
  status: string;
  report: string;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  submittedCode?: string;
  createdAt?: string;
  scoreBreakdown?: SubmissionScores;
};

// ...existing code...
function RadarChart({
  data,
}: {
  data: Array<{ skill: string; score: number }>;
}) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const levels = 4;
  const angleStep = (2 * Math.PI) / data.length;

  // add outer padding so long labels are not cut off
  const viewBoxPadding = 28;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = (value / 100) * (size / 2 - 24);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const polygonPoints = data
    .map((d, i) => {
      const p = getPoint(i, d.score);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`${-viewBoxPadding} ${-viewBoxPadding} ${size + viewBoxPadding * 2} ${size + viewBoxPadding * 2}`}
      className="w-full max-w-[280px] mx-auto"
    >
      {Array.from({ length: levels }, (_, l) => {
        const r = ((l + 1) / levels) * (size / 2 - 24);
        const points = data
          .map((_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
          })
          .join(" ");
        return (
          <polygon
            key={l}
            points={points}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="0.7"
          />
        );
      })}

      {data.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="hsl(var(--border))"
            strokeWidth="0.7"
          />
        );
      })}

      <polygon
        points={polygonPoints}
        fill="hsl(var(--primary) / 0.18)"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
      />

      {data.map((d, i) => {
        const p = getPoint(i, d.score);
        // slightly closer to chart center to reduce edge pressure
        const lp = getPoint(i, 108);
        return (
          <g key={d.skill}>
            <circle cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))" />
            <text
              x={lp.x}
              y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px] font-mono"
            >
              {d.skill}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
// ...existing code...
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};

export default function AIReportPage() {
  const location = useLocation();
  const { toast } = useToast();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.key]);

  const submission = (
    location.state as { submission?: ReportSubmission } | null
  )?.submission;

  if (!submission) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <Surface className="max-w-2xl mx-auto p-6 space-y-4">
          <h1 className="text-xl font-semibold">No report selected</h1>
          <p className="text-sm text-muted-foreground">
            Open a submission report from the recruiter dashboard.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </Surface>
      </div>
    );
  }

  const scoreMap: SubmissionScores = submission.scoreBreakdown ?? {
    logic: submission.score,
    security: submission.score,
    readability: submission.score,
    performance: submission.score,
    cleanliness: submission.score,
  };

  const radarData = [
    { skill: "Logic", score: Number(scoreMap.logic ?? 0) },
    { skill: "Security", score: Number(scoreMap.security ?? 0) },
    { skill: "Readability", score: Number(scoreMap.readability ?? 0) },
    { skill: "Performance", score: Number(scoreMap.performance ?? 0) },
    { skill: "Cleanliness", score: Number(scoreMap.cleanliness ?? 0) },
  ];

  const overallScore = Math.round(
    radarData.reduce((sum, item) => sum + item.score, 0) / radarData.length,
  );

  const copySubmittedCode = async () => {
    const code = submission.submittedCode || "";
    if (!code) {
      toast({ title: "No code to copy", variant: "destructive" });
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      toast({ title: "Code copied" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b border-border/50 px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm hidden sm:inline">Back to Dashboard</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
            REPORT: {submission.id.slice(-6).toUpperCase()}
          </span>
          {/* <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground ring-1 ring-border hover:bg-accent transition-all active:scale-[0.98]">
            <Download size={14} />
            Export PDF
          </button> */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <motion.div initial="hidden" animate="visible" className="">
          <motion.div variants={fadeUp} custom={0} className="">
            <Surface className="p-6">
              <div className="md:flex md:justify-between max-md:flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  {/* <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20"> */}
                  <BrandLogo compact showText={false} className="gap-0" />
                  {/* </div> */}
                  <div>
                    <h1 className="text-xl font-semibold text-foreground tracking-tight-custom">
                      {submission.name}
                    </h1>
                    <p className="text-xs font-mono text-muted-foreground">
                      {submission.email} ·{" "}
                      {submission.createdAt
                        ? new Date(submission.createdAt).toLocaleString()
                        : "Recent"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    Challenge
                  </p>
                  {submission.challengeId ? (
                    <Link
                      to={`/workspace/${submission.challengeId}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {submission.challenge}
                      <ExternalLink size={14} />
                    </Link>
                  ) : (
                    <p className="text-sm text-foreground">
                      {submission.challenge}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <div className="text-5xl font-bold font-mono tabular-nums text-foreground">
                  {overallScore}
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Overall Score</div>
                  <div className="text-xs font-mono mt-0.5">
                    Status: {submission.status}
                  </div>
                </div>
              </div>
            </Surface>
          </motion.div>

          {/* <motion.div variants={fadeUp} custom={1} className="flex-1">
            <Surface className="p-6 flex items-center justify-center h-full">
              <RadarChart data={radarData} />
            </Surface>
          </motion.div> */}
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="visible"
        >
          <Surface className="p-6">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-4">
              Skill Breakdown
            </h2>
            <div className="space-y-3">
              {radarData.map((d) => (
                <div key={d.skill} className="flex items-center gap-4">
                  <span className="text-xs font-mono text-muted-foreground w-24">
                    {d.skill}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.score}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <span className="text-xs font-mono text-foreground tabular-nums w-8 text-right">
                    {d.score}
                  </span>
                </div>
              ))}
            </div>
          </Surface>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="visible"
          >
            <Surface className="p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <ThumbsUp size={16} className="text-success" />
                <h2 className="text-sm font-mono text-success uppercase tracking-widest">
                  Strengths
                </h2>
              </div>
              <ul className="space-y-3">
                {(submission.strengths || []).length > 0 ? (
                  submission.strengths.map((s) => (
                    <li
                      key={s}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-success mt-0.5 flex-shrink-0"
                      />
                      {s}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">
                    No strengths provided.
                  </li>
                )}
              </ul>
            </Surface>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={4}
            initial="hidden"
            animate="visible"
          >
            <Surface className="p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <ThumbsDown size={16} className="text-destructive" />
                <h2 className="text-sm font-mono text-destructive uppercase tracking-widest">
                  Weaknesses
                </h2>
              </div>
              <ul className="space-y-3">
                {(submission.weaknesses || []).length > 0 ? (
                  submission.weaknesses.map((w) => (
                    <li
                      key={w}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <AlertTriangle
                        size={16}
                        className="text-destructive mt-0.5 flex-shrink-0"
                      />
                      {w}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">
                    No weaknesses provided.
                  </li>
                )}
              </ul>
            </Surface>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          custom={5}
          initial="hidden"
          animate="visible"
        >
          <Surface className="p-6 space-y-3">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
              AI Report
            </h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {submission.report || "No report available."}
            </p>
          </Surface>
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={6}
          initial="hidden"
          animate="visible"
        >
          <Surface className="p-0 overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-primary" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                  Submitted Code
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={copySubmittedCode}
              >
                <Copy size={14} />
                Copy
              </Button>
            </div>
            <pre className="p-6 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap text-foreground">
              {submission.submittedCode || "No submitted code available."}
            </pre>
          </Surface>
        </motion.div>
      </main>
    </div>
  );
}
