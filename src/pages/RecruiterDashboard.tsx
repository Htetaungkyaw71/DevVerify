import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Users,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PositionList from "@/components/PositionList";
import BrandLogo from "@/components/BrandLogo";
import { useGetChallengesQuery } from "@/store/challengesApi";
import {
  useCreatePositionMutation,
  useGetMyPositionsQuery,
} from "@/store/positionsApi";
import {
  useGetPositionSubmissionsQuery,
  type Submission,
} from "@/store/submissionsApi";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createPositionInputSchema,
  getFirstValidationMessage,
} from "@/lib/validationSchemas";
import { getErrorMessage } from "@/lib/errorUtils";

type SelectedChallenges = Record<string, number>;

const DEFAULT_TIME_LIMIT = 60;

function ScorePill({ score, status }: { score: number; status: string }) {
  const colors = {
    passed: "bg-success/10 text-success ring-success/20",
    failed: "bg-destructive/10 text-destructive ring-destructive/20",
    review: "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded text-xs font-mono ring-1 ${colors[status as keyof typeof colors]}`}
    >
      {score}/100
    </span>
  );
}

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedPositionId, setSelectedPositionId] = useState<string>("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedChallenges, setSelectedChallenges] =
    useState<SelectedChallenges>({});
  const [challengePage, setChallengePage] = useState(1);
  const [challengeLimit, setChallengeLimit] = useState(10);
  const [challengeSearch, setChallengeSearch] = useState("");
  const [debouncedChallengeSearch, setDebouncedChallengeSearch] = useState("");
  const [challengeDifficulty, setChallengeDifficulty] = useState("");
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyLink, setCopyLink] = useState("");
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsLimit, setSubmissionsLimit] = useState(20);

  const { data: positionsData } = useGetMyPositionsQuery();
  const [createPosition, { isLoading: creating }] = useCreatePositionMutation();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedChallengeSearch(challengeSearch.trim());
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [challengeSearch]);

  useEffect(() => {
    setChallengePage(1);
  }, [debouncedChallengeSearch, challengeLimit, challengeDifficulty]);

  const {
    data: challengesData,
    isLoading: challengesLoading,
    isFetching: challengesFetching,
  } = useGetChallengesQuery({
    page: challengePage,
    limit: challengeLimit,
    search: debouncedChallengeSearch || undefined,
    difficulty: challengeDifficulty || undefined,
  });

  const availableChallenges = challengesData?.data ?? [];
  const challengeTotalPages = challengesData?.totalPages ?? 1;
  const challengeTotal = challengesData?.total ?? 0;

  const positions = useMemo(
    () => positionsData?.positions || [],
    [positionsData],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchAllSubmissions = async () => {
      if (positions.length === 0) {
        setAllSubmissions([]);
        return;
      }

      const responses = await Promise.all(
        positions.map(async (position) => {
          try {
            const response = await api.get(
              `/submissions/position/${position._id}`,
            );
            return (response.data?.submissions || []) as Submission[];
          } catch {
            return [] as Submission[];
          }
        }),
      );

      if (!cancelled) {
        setAllSubmissions(responses.flat());
      }
    };

    void fetchAllSubmissions();

    return () => {
      cancelled = true;
    };
  }, [positions]);

  const firstPositionId = useMemo(
    () => selectedPositionId || (positions[0]?._id ?? ""),
    [selectedPositionId, positions],
  );

  useEffect(() => {
    setSubmissionsPage(1);
  }, [firstPositionId, submissionsLimit]);

  const { data: submissionsData } = useGetPositionSubmissionsQuery(
    {
      positionId: firstPositionId,
      page: submissionsPage,
      limit: submissionsLimit,
    },
    { skip: !firstPositionId },
  );

  const submissionsTotalPages = Math.max(
    1,
    submissionsData?.pagination?.totalPages ?? 1,
  );
  const submissionsTotal = submissionsData?.pagination?.total ?? 0;

  const selectedCount = useMemo(
    () => Object.keys(selectedChallenges).length,
    [selectedChallenges],
  );

  const campaigns = useMemo(
    () =>
      (submissionsData?.submissions || []).map((sub) => {
        const marks = sub.marks ?? 0;
        const status =
          sub.status === "failed"
            ? "failed"
            : marks >= 70
              ? "passed"
              : marks >= 50
                ? "review"
                : "failed";

        const challengeId =
          typeof sub.challengeId === "string"
            ? sub.challengeId
            : sub.challengeId?._id || "";

        return {
          id: sub._id,
          name:
            typeof sub.userId === "string"
              ? sub.userId
              : sub.userId?.username || "Anonymous",
          email:
            typeof sub.userId === "object" ? sub.userId?.email || "N/A" : "N/A",
          challenge:
            typeof sub.challengeId === "string"
              ? sub.challengeId
              : sub.challengeId?.title || "Unknown challenge",
          challengeId,
          score: marks,
          status,
          submittedCode: sub.submittedCode,
          report: sub.report || "No feedback",
          suggestions: sub.suggestions || [],
          strengths: sub.strengths || [],
          weaknesses: sub.weaknesses || [],
          scoreBreakdown: sub.scoreBreakdown,
          createdAt: sub.createdAt,
        };
      }),
    [submissionsData],
  );

  const submissionsCountByPosition = useMemo(() => {
    const counts: Record<string, number> = {};
    allSubmissions.forEach((submission) => {
      const positionId =
        typeof submission.positionId === "string"
          ? submission.positionId
          : submission.positionId?._id;

      if (!positionId) return;
      counts[positionId] = (counts[positionId] ?? 0) + 1;
    });
    return counts;
  }, [allSubmissions]);

  const realChallengesCount = useMemo(
    () =>
      positions.reduce(
        (total, position) => total + position.challenges.length,
        0,
      ),
    [positions],
  );

  const newCandidatesCount = useMemo(() => {
    const uniqueCandidates = new Set(
      allSubmissions
        .map((submission) =>
          typeof submission.userId === "string"
            ? submission.userId
            : submission.userId?._id,
        )
        .filter(Boolean),
    );

    return uniqueCandidates.size;
  }, [allSubmissions]);

  const passRate = useMemo(() => {
    const completed = allSubmissions.filter(
      (submission) => submission.status !== "pending",
    );

    if (completed.length === 0) return 0;

    const passed = completed.filter(
      (submission) =>
        submission.status !== "failed" && (submission.marks ?? 0) >= 70,
    ).length;

    return Math.round((passed / completed.length) * 100);
  }, [allSubmissions]);

  const resetCreateForm = () => {
    setTitle("");
    setSelectedChallenges({});
    setChallengePage(1);
    setChallengeSearch("");
    setChallengeDifficulty("");
  };

  const toggleChallenge = (challengeId: string, checked: boolean) => {
    setSelectedChallenges((prev) => {
      if (!checked) {
        const next = { ...prev };
        delete next[challengeId];
        return next;
      }
      return {
        ...prev,
        [challengeId]: prev[challengeId] ?? DEFAULT_TIME_LIMIT,
      };
    });
  };

  const setChallengeTimeLimit = (challengeId: string, value: string) => {
    const parsed = Number(value);
    setSelectedChallenges((prev) => ({
      ...prev,
      [challengeId]:
        Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIME_LIMIT,
    }));
  };

  const buildInviteLink = (inviteToken: string) =>
    `${window.location.origin}/invite/${inviteToken}`;

  const handleCreate = async () => {
    const challenges = Object.entries(selectedChallenges).map(
      ([id, timeLimit]) => ({
        id,
        timeLimit,
      }),
    );

    const parsed = createPositionInputSchema.safeParse({
      title,
      challenges,
    });

    if (!parsed.success) {
      toast({
        title: "Invalid input",
        description: getFirstValidationMessage(parsed.error),
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await createPosition({
        title: title.trim(),
        challenges,
      }).unwrap();

      setIsCreateOpen(false);
      resetCreateForm();

      const url =
        response.inviteLink || buildInviteLink(response.position.inviteToken);
      setCopyLink(url);
      setCopyModalOpen(true);

      toast({ title: "Position created" });
    } catch (error) {
      toast({
        title: "Failed to create position",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(copyLink);
      toast({ title: "URL copied" });
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const openSubmissionReport = (submission: (typeof campaigns)[number]) => {
    navigate("/report", {
      state: {
        submission,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b border-border/50 px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center">
            <BrandLogo compact textClassName="text-foreground" />
          </Link>
          <span className="text-xs max-md:hidden font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
            RECRUITER
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block"></div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            <span className="max-md:text-[12px]"> Create Position</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Surface className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Challenges Count
              </p>
              <BarChart3 size={16} className="text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-foreground font-mono tabular-nums">
                {realChallengesCount}
              </h3>
              <span className="text-xs font-mono text-muted-foreground">
                Assigned in positions
              </span>
            </div>
          </Surface>

          <Surface className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Pass Rate
              </p>
              {passRate >= 50 ? (
                <TrendingUp size={16} className="text-success" />
              ) : (
                <TrendingDown size={16} className="text-destructive" />
              )}
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-foreground font-mono tabular-nums">
                {passRate}%
              </h3>
              <span className="text-xs font-mono text-muted-foreground">
                From completed submissions
              </span>
            </div>
          </Surface>

          <Surface className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                New Candidates
              </p>
              <Users size={16} className="text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-foreground font-mono tabular-nums">
                {newCandidatesCount}
              </h3>
              <span className="text-xs font-mono text-muted-foreground">
                Unique submissions
              </span>
            </div>
          </Surface>
        </div>

        <Tabs defaultValue="positions" className="space-y-3">
          <TabsList>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="mt-0">
            <Surface className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Positions
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Click a position to open details.
                  </p>
                </div>
              </div>

              <PositionList
                positions={positions}
                submissionsCountByPosition={submissionsCountByPosition}
              />
            </Surface>
          </TabsContent>

          <TabsContent value="submissions" className="mt-0">
            <Surface className="overflow-hidden">
              <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    Submissions
                  </h2>
                  {positions.length > 1 && (
                    <select
                      value={selectedPositionId || (positions[0]?._id ?? "")}
                      onChange={(e) => setSelectedPositionId(e.target.value)}
                      className="h-9 rounded-md bg-secondary px-3 text-sm ring-1 ring-border text-foreground"
                    >
                      {positions.map((pos) => (
                        <option key={pos._id} value={pos._id}>
                          {pos.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-mono text-muted-foreground border-b border-border/50 uppercase tracking-widest">
                      <th className="p-4 sm:p-6 font-medium">Candidate</th>
                      <th className="p-4 sm:p-6 font-medium hidden sm:table-cell">
                        Challenge
                      </th>
                      <th className="p-4 sm:p-6 font-medium">Score</th>
                      <th className="p-4 max-md:hidden sm:p-6 font-medium text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {campaigns.length > 0 ? (
                      campaigns.map((c) => (
                        <tr
                          key={c.id}
                          className="group cursor-pointer hover:bg-accent/30 transition-colors"
                          onClick={() => openSubmissionReport(c)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openSubmissionReport(c);
                            }
                          }}
                          tabIndex={0}
                        >
                          <td className="p-4 sm:p-6">
                            <div className="font-medium text-foreground">
                              {c.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {c.email}
                            </div>
                          </td>
                          <td className="p-4 sm:p-6 text-sm font-mono hidden sm:table-cell">
                            {c.challengeId ? (
                              <Link
                                to={`/workspace/${c.challengeId}`}
                                className="text-primary hover:underline"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {c.challenge}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">
                                {c.challenge}
                              </span>
                            )}
                          </td>
                          <td className="p-4 sm:p-6">
                            <ScorePill score={c.score} status={c.status} />
                          </td>
                          <td className="p-4 sm:p-6 text-right max-md:hidden">
                            <button
                              onClick={() => openSubmissionReport(c)}
                              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Eye size={14} />
                              <span className="hidden sm:inline">
                                View Report
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-6 text-center text-muted-foreground"
                        >
                          No submissions yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {campaigns.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-border/50 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground font-mono">
                    Total: {submissionsTotal}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={submissionsPage <= 1}
                      onClick={() =>
                        setSubmissionsPage((prev) => Math.max(1, prev - 1))
                      }
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    <span className="text-xs font-mono text-muted-foreground px-2">
                      Page {submissionsPage} / {submissionsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={submissionsPage >= submissionsTotalPages}
                      onClick={() => setSubmissionsPage((prev) => prev + 1)}
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </Surface>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            resetCreateForm();
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90dvh] p-4 sm:p-6 flex flex-col">
          <DialogHeader>
            <DialogTitle>Create Position</DialogTitle>
            <DialogDescription>
              Select challenges and set a time limit for each one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="position-title">Title</Label>
              <Input
                id="position-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Backend Engineer"
              />
            </div>

            <div className="space-y-2">
              <Label>Challenges</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative sm:col-span-2">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={challengeSearch}
                    onChange={(e) => setChallengeSearch(e.target.value)}
                    placeholder="Search challenges by title"
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-muted-foreground">Per page</span>
                  <select
                    value={challengeLimit}
                    onChange={(e) => setChallengeLimit(Number(e.target.value))}
                    className="h-8 rounded-md bg-secondary px-2 ring-1 ring-border"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <select
                  value={challengeDifficulty}
                  onChange={(e) => setChallengeDifficulty(e.target.value)}
                  className="h-8 rounded-md bg-secondary px-2 text-xs text-foreground ring-1 ring-border"
                >
                  <option value="">All difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <p className="text-xs text-muted-foreground sm:text-right">
                  {challengesFetching
                    ? "Updating..."
                    : `Total: ${challengeTotal}`}
                </p>
              </div>
              <div className="max-h-72 overflow-y-auto rounded-md border border-border divide-y divide-border">
                {challengesLoading ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    Loading challenges...
                  </div>
                ) : availableChallenges.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    No challenges found.
                  </div>
                ) : (
                  availableChallenges.map((challenge) => {
                    const checked = challenge._id in selectedChallenges;
                    return (
                      <div
                        key={challenge._id}
                        className="p-3 flex flex-wrap sm:flex-nowrap items-center gap-3"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleChallenge(challenge._id, value === true)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {challenge.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {challenge.difficulty} • {challenge.category}
                          </p>
                        </div>
                        {checked && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                              type="number"
                              min={1}
                              className="w-full sm:w-24"
                              value={selectedChallenges[challenge._id]}
                              onChange={(e) =>
                                setChallengeTimeLimit(
                                  challenge._id,
                                  e.target.value,
                                )
                              }
                            />
                            <span className="text-xs text-muted-foreground">
                              min
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={challengePage <= 1}
                  onClick={() =>
                    setChallengePage((prev) => Math.max(1, prev - 1))
                  }
                >
                  <ChevronLeft size={14} />
                </Button>
                <span className="text-xs font-mono text-muted-foreground px-2">
                  Page {challengePage} / {Math.max(1, challengeTotalPages)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={challengePage >= challengeTotalPages}
                  onClick={() => setChallengePage((prev) => prev + 1)}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {selectedCount}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="max-md:mt-2"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create Position"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={copyModalOpen} onOpenChange={setCopyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite URL</DialogTitle>
            <DialogDescription>
              Share this link with candidates.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-border bg-secondary p-3 text-sm break-all">
            {copyLink}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyModalOpen(false)}>
              Close
            </Button>
            <Button className="gap-2" onClick={copyUrl}>
              <Copy size={14} />
              Copy URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
