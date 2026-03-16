import { ShieldCheck, BarChart3, Users, Plus, Search, MoreHorizontal, TrendingUp, TrendingDown, Eye, X } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const stats = [
  { label: "Active Tests", value: "12", trend: "+2", up: true, icon: BarChart3 },
  { label: "Avg. Pass Rate", value: "64%", trend: "-4%", up: false, icon: TrendingDown },
  { label: "New Candidates", value: "128", trend: "+12", up: true, icon: Users },
];

const campaigns = [
  { name: "Alex Rivera", email: "alex@github.com", challenge: "Backend_Senior_v2", score: 92, status: "passed" },
  { name: "Sarah Chen", email: "sarah@gitlab.com", challenge: "Frontend_Mid_v3", score: 78, status: "passed" },
  { name: "Marcus Webb", email: "marcus@dev.io", challenge: "Systems_Senior_v1", score: 45, status: "failed" },
  { name: "Priya Patel", email: "priya@code.dev", challenge: "Backend_Senior_v2", score: 88, status: "passed" },
  { name: "Jordan Lee", email: "jordan@eng.co", challenge: "Frontend_Mid_v3", score: 61, status: "review" },
];

function ScorePill({ score, status }: { score: number; status: string }) {
  const colors = {
    passed: "bg-success/10 text-success ring-success/20",
    failed: "bg-destructive/10 text-destructive ring-destructive/20",
    review: "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20",
  };
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-mono ring-1 ${colors[status as keyof typeof colors]}`}>
      {score}/100
    </span>
  );
}

export default function RecruiterDashboard() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="h-14 border-b border-border/50 px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center glow-primary">
              <ShieldCheck className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-semibold tracking-tight-custom">Proof of Skill</span>
          </Link>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded ml-2">RECRUITER</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search candidates..."
              className="h-9 w-64 rounded-md bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-border focus:ring-primary outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground glow-primary hover:brightness-110 transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            Create Challenge
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <Surface key={s.label} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <s.icon size={16} className="text-muted-foreground" />
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-foreground font-mono tabular-nums">{s.value}</h3>
                <span className={`text-xs font-mono ${s.up ? "text-success" : "text-destructive"} flex items-center gap-1`}>
                  {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {s.trend}
                </span>
              </div>
            </Surface>
          ))}
        </div>

        {/* Table */}
        <Surface className="overflow-hidden">
          <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">Active Campaigns</h2>
            <div className="flex gap-2">
              {["All", "Passed", "Failed", "Review"].map((f) => (
                <button
                  key={f}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    f === "All"
                      ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-mono text-muted-foreground border-b border-border/50 uppercase tracking-widest">
                  <th className="p-4 sm:p-6 font-medium">Candidate</th>
                  <th className="p-4 sm:p-6 font-medium hidden sm:table-cell">Challenge</th>
                  <th className="p-4 sm:p-6 font-medium">Score</th>
                  <th className="p-4 sm:p-6 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {campaigns.map((c) => (
                  <tr key={c.email} className="group hover:bg-accent/30 transition-colors">
                    <td className="p-4 sm:p-6">
                      <div className="font-medium text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{c.email}</div>
                    </td>
                    <td className="p-4 sm:p-6 text-sm text-muted-foreground font-mono hidden sm:table-cell">{c.challenge}</td>
                    <td className="p-4 sm:p-6">
                      <ScorePill score={c.score} status={c.status} />
                    </td>
                    <td className="p-4 sm:p-6 text-right">
                      <Link
                        to="/report"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">View Report</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </main>

      {/* Create Challenge Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Surface className="p-0">
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                  <h3 className="text-lg font-semibold text-foreground">Create Challenge</h3>
                  <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Title</label>
                    <input
                      placeholder="e.g. Backend Senior v3"
                      className="w-full h-10 rounded-md bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-border focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Instructions (Markdown)</label>
                    <textarea
                      rows={4}
                      placeholder="Describe the challenge requirements..."
                      className="w-full rounded-md bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-border focus:ring-primary outline-none transition-all resize-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Boilerplate Code</label>
                    <textarea
                      rows={4}
                      placeholder="class Solution { ... }"
                      className="w-full rounded-md bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-border focus:ring-primary outline-none transition-all resize-none font-mono"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-border/50 flex justify-end gap-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary ring-1 ring-border hover:bg-accent transition-all active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground glow-primary hover:brightness-110 transition-all active:scale-[0.98]">
                    Create
                  </button>
                </div>
              </Surface>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
