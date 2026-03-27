import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Save,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BrandLogo from "@/components/BrandLogo";
import AppSettingsControls from "@/components/AppSettingsControls";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useGetChallengesQuery } from "@/store/challengesApi";
import {
  useDeleteMyPositionMutation,
  useGetMyPositionByIdQuery,
  useUpdateMyPositionMutation,
  type PositionChallenge,
} from "@/store/positionsApi";
import {
  getFirstValidationMessage,
  updatePositionInputSchema,
} from "@/lib/validationSchemas";
import { getErrorMessage } from "@/lib/errorUtils";

type EditableChallenge = {
  id: string;
  title: string;
  timeLimit: number;
};

const DEFAULT_TIME_LIMIT = 60;

const getChallengeId = (challenge: PositionChallenge) =>
  typeof challenge.challengeId === "string"
    ? challenge.challengeId
    : challenge.challengeId._id;

const getChallengeTitle = (challenge: PositionChallenge) =>
  typeof challenge.challengeId === "string"
    ? challenge.challengeId
    : challenge.challengeId.title;

export default function PositionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useAppSettings();

  const [title, setTitle] = useState("");
  const [challenges, setChallenges] = useState<EditableChallenge[]>([]);
  const [challengePage, setChallengePage] = useState(1);
  const [challengeLimit, setChallengeLimit] = useState(20);
  const [challengeSearch, setChallengeSearch] = useState("");
  const [debouncedChallengeSearch, setDebouncedChallengeSearch] = useState("");
  const [challengeDifficulty, setChallengeDifficulty] = useState("");

  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [copyLink, setCopyLink] = useState("");

  const { data, isLoading, isError } = useGetMyPositionByIdQuery(id ?? "", {
    skip: !id,
  });

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

  const { data: challengeListData, isFetching: challengeListFetching } =
    useGetChallengesQuery({
      page: challengePage,
      limit: challengeLimit,
      search: debouncedChallengeSearch || undefined,
      difficulty: challengeDifficulty || undefined,
    });
  const challengeList = challengeListData?.data ?? [];
  const challengeTotalPages = challengeListData?.totalPages ?? 1;
  const challengeTotal = challengeListData?.total ?? 0;

  const [updatePosition, { isLoading: saving }] = useUpdateMyPositionMutation();
  const [deletePosition, { isLoading: deleting }] =
    useDeleteMyPositionMutation();

  useEffect(() => {
    const position = data?.position;
    if (!position) return;

    setTitle(position.title);
    setChallenges(
      position.challenges.map((challenge) => ({
        id: getChallengeId(challenge),
        title: getChallengeTitle(challenge),
        timeLimit: challenge.timeLimit,
      })),
    );
  }, [data]);

  const challengeMap = useMemo(
    () => new Map(challenges.map((challenge) => [challenge.id, challenge])),
    [challenges],
  );

  const buildInviteLink = (inviteToken: string) =>
    `${window.location.origin}/invite/${inviteToken}`;

  const updateChallengeTimeLimit = (challengeId: string, value: string) => {
    const parsed = Number(value);
    setChallenges((prev) =>
      prev.map((challenge) =>
        challenge.id === challengeId
          ? {
              ...challenge,
              timeLimit:
                Number.isFinite(parsed) && parsed > 0
                  ? parsed
                  : DEFAULT_TIME_LIMIT,
            }
          : challenge,
      ),
    );
  };

  const removeChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.filter((challenge) => challenge.id !== challengeId),
    );
  };

  const toggleAvailableChallenge = (
    challengeId: string,
    challengeTitle: string,
    checked: boolean,
  ) => {
    if (!checked) {
      removeChallenge(challengeId);
      return;
    }

    if (challengeMap.has(challengeId)) return;

    setChallenges((prev) => [
      ...prev,
      { id: challengeId, title: challengeTitle, timeLimit: DEFAULT_TIME_LIMIT },
    ]);
  };

  const handleSave = async () => {
    if (!id) return;

    const parsed = updatePositionInputSchema.safeParse({
      title,
      challenges: challenges.map((challenge) => ({
        id: challenge.id,
        timeLimit: challenge.timeLimit,
      })),
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
      const payloadChallenges = challenges.map((challenge) => ({
        id: challenge.id,
        timeLimit: challenge.timeLimit,
      }));

      await updatePosition({
        id,
        body: {
          title: title.trim(),
          challenges: payloadChallenges,
        },
      }).unwrap();
      toast({ title: "Position updated" });
    } catch (error) {
      toast({
        title: "Failed to update position",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleDeletePosition = async () => {
    if (!id) return;

    try {
      await deletePosition(id).unwrap();
      toast({ title: "Position deleted" });
      setDeleteModalOpen(false);
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Failed to delete position",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleCopyUrl = () => {
    const token = data?.position.inviteToken;
    if (!token) return;
    setCopyLink(buildInviteLink(token));
    setCopyModalOpen(true);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b border-border/50 px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="inline-flex items-center">
          <BrandLogo compact textClassName="text-foreground" />
        </Link>
        <div className="flex items-center gap-3">
          <AppSettingsControls />
          <span className="text-xs font-mono text-muted-foreground">
            POSITION DETAILS
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={14} />
            {t("back")}
          </Button>
          <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={handleCopyUrl}
            >
              <Copy size={14} />
              {t("copyUrl")}
            </Button>
            <Button
              variant="destructive"
              className="gap-2 w-full sm:w-auto"
              onClick={() => setDeleteModalOpen(true)}
              disabled={deleting}
            >
              <Trash2 size={14} />
              {/* {deleting ? t("deleting") : t("deletePosition")} */}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Surface className="p-6 text-sm text-muted-foreground">
            Loading position...
          </Surface>
        ) : isError || !data?.position ? (
          <Surface className="p-6 text-sm text-destructive">
            Position not found.
          </Surface>
        ) : (
          <>
            <Surface className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position-title">Title</Label>
                <Input
                  id="position-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Position title"
                />
              </div>

              <div className="space-y-2">
                <Label>Selected Challenges</Label>
                {challenges.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No challenges selected.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {challenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className="flex items-center gap-3 p-3 border border-border rounded-md"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {challenge.title}
                          </p>
                        </div>
                        <Input
                          type="number"
                          min={1}
                          className="w-24"
                          value={challenge.timeLimit}
                          onChange={(e) =>
                            updateChallengeTimeLimit(
                              challenge.id,
                              e.target.value,
                            )
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          min
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeChallenge(challenge.id)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleSave} className="gap-2" disabled={saving}>
                <Save size={14} />
                {saving ? "Saving..." : "Update Position"}
              </Button>
            </Surface>

            <Surface className="p-5 space-y-3">
              <Label>Add / Remove Challenges</Label>
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
                  {challengeListFetching
                    ? "Updating..."
                    : `Total: ${challengeTotal}`}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-md border border-border divide-y divide-border">
                {challengeList.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    No challenges found.
                  </div>
                ) : (
                  challengeList.map((challenge) => {
                    const checked = challengeMap.has(challenge._id);
                    return (
                      <div
                        key={challenge._id}
                        className="p-3 flex items-center gap-3"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleAvailableChallenge(
                              challenge._id,
                              challenge.title,
                              value === true,
                            )
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
            </Surface>
          </>
        )}
      </main>

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
              {t("copyUrl")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("confirmDeleteTitle")}</DialogTitle>
            <DialogDescription>{t("confirmDeleteDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="max-md:mt-2"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePosition}
              disabled={deleting}
            >
              {deleting ? t("deleting") : t("confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
