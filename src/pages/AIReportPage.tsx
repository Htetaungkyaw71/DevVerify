import { ShieldCheck, ArrowLeft, Download, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle2, Code2 } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const radarData = [
  { skill: "Logic", score: 92 },
  { skill: "Security", score: 78 },
  { skill: "Readability", score: 85 },
  { skill: "Performance", score: 70 },
  { skill: "Cleanliness", score: 88 },
];

const strengths = [
  "Clean separation of concerns",
  "Efficient use of Map for O(1) lookups",
  "Proper TypeScript typing throughout",
  "Edge cases handled gracefully",
];

const weaknesses = [
  "Missing capacity validation in constructor",
  "No error handling for negative keys",
  "Could benefit from a doubly-linked list for O(1) eviction",
];

const codeAnnotations = [
  { line: 5, type: "good", text: "Using Map preserves insertion order — smart choice for LRU." },
  { line: 11, type: "warn", text: "Consider validating capacity > 0 to prevent runtime errors." },
  { line: 16, type: "good", text: "Delete-and-reinsert pattern correctly updates access order." },
];

function RadarChart({ data }: { data: typeof radarData }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const levels = 4;
  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = (value / 100) * (size / 2 - 20);
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const polygonPoints = data.map((d, i) => {
    const p = getPoint(i, d.score);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[250px] mx-auto">
      {/* Grid */}
      {Array.from({ length: levels }, (_, l) => {
        const r = ((l + 1) / levels) * (size / 2 - 20);
        const points = data.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(" ");
        return <polygon key={l} points={points} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />;
      })}
      {/* Axes */}
      {data.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(var(--border))" strokeWidth="0.5" />;
      })}
      {/* Data polygon */}
      <polygon points={polygonPoints} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="2" />
      {/* Points & Labels */}
      {data.map((d, i) => {
        const p = getPoint(i, d.score);
        const lp = getPoint(i, 115);
        return (
          <g key={d.skill}>
            <circle cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))" />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[9px] font-mono">
              {d.skill}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function AIReportPage() {
  const overallScore = Math.round(radarData.reduce((a, b) => a + b.score, 0) / radarData.length);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="h-14 border-b border-border/50 px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm hidden sm:inline">Back to Dashboard</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
            REPORT_ID: 0x4F2A
          </span>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground ring-1 ring-border hover:bg-accent transition-all active:scale-[0.98]">
            <Download size={14} />
            Export PDF
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Overview */}
        <motion.div initial="hidden" animate="visible" className="flex flex-col md:flex-row gap-6">
          <motion.div variants={fadeUp} custom={0} className="flex-1">
            <Surface className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <ShieldCheck className="text-primary" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground tracking-tight-custom">Alex Rivera</h1>
                  <p className="text-xs font-mono text-muted-foreground">Backend_Senior_v2 · Completed 2h 14m ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="text-5xl font-bold font-mono tabular-nums text-foreground">{overallScore}</div>
                <div className="text-sm text-muted-foreground">
                  <div>Overall Score</div>
                  <div className="text-success text-xs font-mono mt-0.5">ABOVE AVERAGE (+12)</div>
                </div>
              </div>
            </Surface>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="flex-1">
            <Surface className="p-6 flex items-center justify-center h-full">
              <RadarChart data={radarData} />
            </Surface>
          </motion.div>
        </motion.div>

        {/* Skill Breakdown */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible">
          <Surface className="p-6">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-4">Skill Breakdown</h2>
            <div className="space-y-3">
              {radarData.map((d) => (
                <div key={d.skill} className="flex items-center gap-4">
                  <span className="text-xs font-mono text-muted-foreground w-24">{d.skill}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.score}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <span className="text-xs font-mono text-foreground tabular-nums w-8 text-right">{d.score}</span>
                </div>
              ))}
            </div>
          </Surface>
        </motion.div>

        {/* Strengths vs Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible">
            <Surface className="p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <ThumbsUp size={16} className="text-success" />
                <h2 className="text-sm font-mono text-success uppercase tracking-widest">Strengths</h2>
              </div>
              <ul className="space-y-3">
                {strengths.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 size={16} className="text-success mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </Surface>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible">
            <Surface className="p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <ThumbsDown size={16} className="text-destructive" />
                <h2 className="text-sm font-mono text-destructive uppercase tracking-widest">Weaknesses</h2>
              </div>
              <ul className="space-y-3">
                {weaknesses.map((w) => (
                  <li key={w} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <AlertTriangle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </Surface>
          </motion.div>
        </div>

        {/* Code Playback */}
        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible">
          <Surface className="p-0 overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center gap-2">
              <Code2 size={16} className="text-primary" />
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Code Playback — AI Annotations</h2>
            </div>
            <div className="p-6 font-mono text-sm leading-loose overflow-x-auto">
              {/* Line 1-4 */}
              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">1</span><span><span className="text-primary">class</span> <span className="text-yellow-300">LRUCache</span> {"{"}</span></div>
              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">2</span><span className="pl-4"><span className="text-primary">private</span> capacity: <span className="text-success">number</span>;</span></div>
              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">3</span><span className="pl-4"><span className="text-primary">private</span> cache: <span className="text-success">Map</span>{"<number, number>"};</span></div>
              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">4</span><span /></div>

              {/* Line 5 with annotation */}
              <div className="flex items-start bg-primary/5 -mx-6 px-6 py-1 border-l-2 border-primary">
                <span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">5</span>
                <div className="flex-1">
                  <div className="pl-4"><span className="text-primary">constructor</span>(capacity: <span className="text-success">number</span>) {"{"}</div>
                </div>
              </div>
              <div className="bg-primary/5 -mx-6 px-6 pb-2 border-l-2 border-primary">
                <div className="ml-12 text-xs text-primary/80 flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  {codeAnnotations[0].text}
                </div>
              </div>

              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">6</span><span className="pl-8"><span className="text-primary">this</span>.capacity = capacity;</span></div>
              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">7</span><span className="pl-8"><span className="text-primary">this</span>.cache = <span className="text-primary">new</span> <span className="text-success">Map</span>();</span></div>
              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">8</span><span className="pl-4">{"}"}</span></div>

              {/* Line 11 with warning annotation */}
              <div className="flex items-start bg-yellow-500/5 -mx-6 px-6 py-1 border-l-2 border-yellow-500">
                <span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">11</span>
                <div className="flex-1">
                  <div className="pl-4"><span className="text-primary">get</span>(key: <span className="text-success">number</span>): <span className="text-success">number</span> {"{"}</div>
                </div>
              </div>
              <div className="bg-yellow-500/5 -mx-6 px-6 pb-2 border-l-2 border-yellow-500">
                <div className="ml-12 text-xs text-yellow-400/80 flex items-center gap-1.5">
                  <AlertTriangle size={12} />
                  {codeAnnotations[1].text}
                </div>
              </div>

              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">12</span><span className="pl-8"><span className="text-primary">if</span> (!<span className="text-primary">this</span>.cache.has(key)) <span className="text-primary">return</span> <span className="text-destructive">-1</span>;</span></div>

              {/* Line 16 with good annotation */}
              <div className="flex items-start bg-success/5 -mx-6 px-6 py-1 border-l-2 border-success">
                <span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">16</span>
                <div className="flex-1">
                  <div className="pl-8"><span className="text-primary">this</span>.cache.delete(key);</div>
                </div>
              </div>
              <div className="bg-success/5 -mx-6 px-6 pb-2 border-l-2 border-success">
                <div className="ml-12 text-xs text-success/80 flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  {codeAnnotations[2].text}
                </div>
              </div>

              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">17</span><span className="pl-8"><span className="text-primary">this</span>.cache.set(key, val);</span></div>
              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">18</span><span className="pl-8"><span className="text-primary">return</span> val;</span></div>
              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">19</span><span className="pl-4">{"}"}</span></div>
              <div className="flex"><span className="w-8 text-right text-muted-foreground/40 text-xs mr-4 select-none leading-loose">20</span><span>{"}"}</span></div>
            </div>
          </Surface>
        </motion.div>
      </main>
    </div>
  );
}
