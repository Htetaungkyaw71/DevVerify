import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Copy, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useGetChallengesQuery } from "@/store/challengesApi";
import {
  useCreatePositionMutation,
  useGetMyPositionsQuery,
} from "@/store/positionsApi";
import {
  createPositionInputSchema,
  getFirstValidationMessage,
} from "@/lib/validationSchemas";
import { getErrorMessage } from "@/lib/errorUtils";

type SelectedChallenges = Record<string, number>;

const DEFAULT_TIME_LIMIT = 60;

export default function PositionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedChallenges, setSelectedChallenges] =
    useState<SelectedChallenges>({});
  const [challengePage, setChallengePage] = useState(1);
  const [challengeLimit, setChallengeLimit] = useState(20);
  const [challengeSearch, setChallengeSearch] = useState("");
  const [debouncedChallengeSearch, setDebouncedChallengeSearch] = useState("");
  const [challengeDifficulty, setChallengeDifficulty] = useState("");

  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyLink, setCopyLink] = useState("");

  const {
    data: positionsData,
    isLoading: positionsLoading,
    isError: positionsError,
  } = useGetMyPositionsQuery();
  const positions = positionsData?.positions ?? [];

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

  const [createPosition, { isLoading: creating }] = useCreatePositionMutation();

  const selectedCount = useMemo(
    () => Object.keys(selectedChallenges).length,
    [selectedChallenges],
  );

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

  const renderCreateDialog = () => (
    <Dialog
      open={isCreateOpen}
      onOpenChange={(open) => {
        setIsCreateOpen(open);
        if (!open) {
          resetCreateForm();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Position</DialogTitle>
          <DialogDescription>
            Select challenges and set a time limit for each one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                      className="p-3 flex items-center gap-3"
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
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            className="w-24"
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
          <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Creating..." : "Create Position"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        {positionsLoading ? (
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Positions
              </h2>
              <p className="text-sm text-muted-foreground">
                Click a position to open details.
              </p>
            </div>
            {[1, 2, 3].map((i) => (
              <Surface key={i} className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-14" />
                </div>
              </Surface>
            ))}
          </div>
        ) : positionsError ? (
          <Surface className="p-6 text-sm text-destructive">
            Failed to load positions.
          </Surface>
        ) : positions.length === 0 ? (
          <div className="flex justify-center py-16">
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus size={16} />
              Create Position
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus size={16} />
                Create Position
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Positions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Click a position to open details.
                </p>
              </div>
              {positions.map((position) => (
                <button
                  key={position._id}
                  onClick={() => navigate(`/positions/${position._id}`)}
                  className="w-full text-left"
                >
                  <Surface className="p-4 sm:p-5 cursor-pointer hover:bg-accent/30 transition-colors">
                    <h2 className="font-semibold text-foreground">
                      {position.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {position.challenges.length} challenge(s)
                    </p>
                  </Surface>
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      {renderCreateDialog()}

      <Dialog open={copyModalOpen} onOpenChange={setCopyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite URL</DialogTitle>
            <DialogDescription>
              Share this link with candidates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input readOnly value={copyLink} />
            <Button onClick={copyUrl} className="w-full gap-2">
              <Copy size={16} />
              Copy URL
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
