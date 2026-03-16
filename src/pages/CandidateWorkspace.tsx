import { Terminal, Play, ShieldCheck, Timer, ChevronDown, ChevronUp, Code2, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function CandidateWorkspace() {
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("solution.ts");

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border/50 px-4 sm:px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center glow-primary">
              <ShieldCheck className="text-primary-foreground w-5 h-5" />
            </div>
          </Link>
          <div className="hidden sm:block h-6 w-px bg-border" />
          <span className="font-mono text-xs sm:text-sm text-muted-foreground tracking-tighter">
            CHALLENGE_ID: <span className="text-foreground">0x4F2A</span>
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-full ring-1 ring-primary/30 text-sm">
            <Timer size={14} />
            <span className="tabular-nums">44:02</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground glow-primary hover:brightness-110 transition-all active:scale-[0.98]">
            Submit to AI
          </button>
        </div>
      </header>

      {/* Main 3-Pane Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Instructions */}
        <section className="hidden md:flex w-[320px] lg:w-[380px] border-r border-border/50 flex-col flex-shrink-0 bg-background">
          <div className="h-10 border-b border-border/50 flex items-center px-4 gap-2">
            <FileText size={14} className="text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Instructions</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <h1 className="text-xl font-semibold text-foreground mb-4 tracking-tight-custom">Implement LRU Cache</h1>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Design a data structure that follows the constraints of a{" "}
                <span className="text-foreground font-medium">Least Recently Used (LRU)</span> cache.
              </p>
              <p>Implement the <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">LRUCache</code> class:</p>
              <div className="surface-card p-4 font-mono text-xs leading-relaxed">
                <div className="text-success">// Constructor</div>
                <div><span className="text-primary">LRUCache</span>(capacity: number)</div>
                <div className="mt-3 text-success">// Methods</div>
                <div><span className="text-primary">get</span>(key: number): number</div>
                <div><span className="text-primary">put</span>(key: number, value: number): void</div>
              </div>
              <div>
                <h3 className="text-foreground font-medium mb-2">Constraints:</h3>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>1 ≤ capacity ≤ 3000</li>
                  <li>0 ≤ key ≤ 10⁴</li>
                  <li>0 ≤ value ≤ 10⁵</li>
                  <li>At most 2 × 10⁵ calls to get and put</li>
                </ul>
              </div>
              <div>
                <h3 className="text-foreground font-medium mb-2">Example:</h3>
                <div className="surface-card p-4 font-mono text-xs space-y-1">
                  <div className="text-muted-foreground">cache = new LRUCache(2)</div>
                  <div>cache.put(1, 1) <span className="text-muted-foreground">// cache = {"{1=1}"}</span></div>
                  <div>cache.put(2, 2) <span className="text-muted-foreground">// cache = {"{1=1, 2=2}"}</span></div>
                  <div>cache.get(1) <span className="text-success">// returns 1</span></div>
                  <div>cache.put(3, 3) <span className="text-muted-foreground">// evicts key 2</span></div>
                  <div>cache.get(2) <span className="text-destructive">// returns -1</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Center: Editor + Terminal */}
        <section className="flex-1 flex flex-col min-w-0">
          {/* Editor Tabs */}
          <div className="h-10 border-b border-border/50 flex items-center px-4 gap-1 bg-surface-elevated flex-shrink-0">
            {["solution.ts", "tests.ts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                  activeTab === tab
                    ? "text-foreground bg-accent ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 size={12} className="inline mr-1.5" />
                {tab}
              </button>
            ))}
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 font-mono text-sm leading-loose bg-card/30">
            <div className="flex">
              <div className="pr-4 sm:pr-6 text-right text-muted-foreground/40 select-none text-xs leading-loose">
                {Array.from({ length: 18 }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <div><span className="text-primary">class</span> <span className="text-yellow-300">LRUCache</span> {"{"}</div>
                <div className="pl-4"><span className="text-primary">private</span> capacity: <span className="text-success">number</span>;</div>
                <div className="pl-4"><span className="text-primary">private</span> cache: <span className="text-success">Map</span>{"<"}<span className="text-success">number</span>, <span className="text-success">number</span>{">"};</div>
                <div />
                <div className="pl-4"><span className="text-primary">constructor</span>(capacity: <span className="text-success">number</span>) {"{"}</div>
                <div className="pl-8"><span className="text-primary">this</span>.capacity = capacity;</div>
                <div className="pl-8"><span className="text-primary">this</span>.cache = <span className="text-primary">new</span> <span className="text-success">Map</span>();</div>
                <div className="pl-4">{"}"}</div>
                <div />
                <div className="pl-4"><span className="text-primary">get</span>(key: <span className="text-success">number</span>): <span className="text-success">number</span> {"{"}</div>
                <div className="pl-8"><span className="text-primary">if</span> (!<span className="text-primary">this</span>.cache.has(key)) <span className="text-primary">return</span> <span className="text-destructive">-1</span>;</div>
                <div className="pl-8"><span className="text-primary">const</span> val = <span className="text-primary">this</span>.cache.get(key)!;</div>
                <div className="pl-8"><span className="text-primary">this</span>.cache.delete(key);</div>
                <div className="pl-8"><span className="text-primary">this</span>.cache.set(key, val);</div>
                <div className="pl-8"><span className="text-primary">return</span> val;</div>
                <div className="pl-4">{"}"}</div>
                <div />
                <div className="pl-4 text-muted-foreground/40">{"// TODO: implement put()"}</div>
                <div>{"}"}</div>
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className={`border-t border-border/50 bg-background flex flex-col flex-shrink-0 transition-all ${terminalOpen ? "h-1/3" : "h-10"}`}>
            <button
              onClick={() => setTerminalOpen(!terminalOpen)}
              className="h-10 border-b border-border/50 flex items-center justify-between px-4 flex-shrink-0 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <Terminal size={14} />
                <span className="uppercase tracking-widest">Terminal</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-success flex items-center gap-1 text-xs font-bold">
                  <Play size={12} /> RUN TESTS
                </span>
                {terminalOpen ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronUp size={14} className="text-muted-foreground" />}
              </div>
            </button>
            <AnimatePresence>
              {terminalOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-auto p-4 font-mono text-xs"
                >
                  <div className="text-muted-foreground">$ npm test</div>
                  <div className="text-success mt-2">✓ Test Suite: LRUCache</div>
                  <div className="pl-4 text-success/80 space-y-0.5 mt-1">
                    <div>✓ should initialize with given capacity (2ms)</div>
                    <div>✓ should return -1 for missing keys (1ms)</div>
                    <div>✓ should store and retrieve values (1ms)</div>
                    <div>✓ should update access order on get (1ms)</div>
                  </div>
                  <div className="pl-4 text-destructive space-y-0.5 mt-1">
                    <div>✗ should evict LRU key when at capacity</div>
                    <div className="pl-4 text-destructive/60">Expected: -1, Received: 2</div>
                  </div>
                  <div className="mt-3 text-muted-foreground">
                    Tests: <span className="text-success">4 passed</span>, <span className="text-destructive">1 failed</span>, 5 total
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
