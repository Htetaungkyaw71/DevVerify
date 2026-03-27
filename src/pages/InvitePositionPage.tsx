import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Clock3, CheckCircle } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { useGetPositionSubmissionsQuery } from "@/store/submissionsApi";
import BrandLogo from "@/components/BrandLogo";

type InviteChallengeItem = {
  id: string;
  title: string;
  difficulty?: string;
  category?: string;
  timeLimit: number;
};

type InvitePosition = {
  id: string;
  title: string;
  description?: string;
  inviteToken: string;
  challenges: InviteChallengeItem[];
};

const endpointCandidates = (token: string) =>
  //   `/positions/invite/${token}`,
  `positions/invite/${token}`;
//   `/positions/public/${token}`,
const normalizeInvitePosition = (raw: any): InvitePosition | null => {
  const source = raw?.position ?? raw?.data ?? raw;

  if (!source || !Array.isArray(source.challenges)) return null;

  const challenges = source.challenges
    .map((item: any) => {
      const challenge = item?.challengeId ?? item?.challenge;
      const id = challenge?._id ?? challenge?.id ?? item?.challengeId;
      const title = challenge?.title ?? challenge?.name ?? "Untitled challenge";
      const timeLimit = Number(item?.timeLimit ?? 0);

      if (!id || !timeLimit) return null;

      return {
        id: String(id),
        title,
        difficulty: challenge?.difficulty,
        category: challenge?.category,
        timeLimit,
      } satisfies InviteChallengeItem;
    })
    .filter(Boolean) as InviteChallengeItem[];

  if (challenges.length === 0) return null;

  return {
    id: String(source._id ?? source.id ?? ""),
    title: source.title ?? "Position Challenges",
    description: source.description,
    inviteToken: String(source.inviteToken ?? source.token ?? ""),
    challenges,
  };
};

export default function InvitePositionPage() {
  const { token = "" } = useParams<{ token: string }>();
  console.log(token);
  const navigate = useNavigate();
  const { toast } = useToast();
  const authToken = useAppSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [position, setPosition] = useState<InvitePosition | null>(null);

  const { data: submissionsData } = useGetPositionSubmissionsQuery(
    { positionId: position?.id || "" },
    { skip: !position?.id || !authToken },
  );

  const submittedChallengeIds = useMemo(() => {
    return new Set(
      (submissionsData?.submissions || []).map((sub) => {
        if (typeof sub.challengeId === "string") {
          return sub.challengeId;
        }
        if (sub.challengeId && typeof sub.challengeId === "object") {
          return (sub.challengeId as any)._id || (sub.challengeId as any).id;
        }
        return "";
      }),
    );
  }, [submissionsData]);

  const allChallengesCompleted =
    position &&
    position.challenges.length > 0 &&
    position.challenges.every((ch) => submittedChallengeIds.has(ch.id));

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchInvite = async () => {
      setLoading(true);
      setError("");

      try {
        const endpoint = endpointCandidates(token);
        const response = await api.get(endpoint);
        const normalized = normalizeInvitePosition(response.data);
        if (normalized) {
          if (!cancelled) {
            setPosition(normalized);
            setLoading(false);
          }
          return;
        }
      } catch {
        setError("Invite link is invalid or expired.");
        setLoading(false);
      }

      if (!cancelled) {
        setError("Invite link is invalid or expired.");
        setLoading(false);
      }
    };

    fetchInvite();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const introText = useMemo(() => {
    if (position?.description) return position.description;
    return "Complete the coding challenges below. Each challenge has its own time limit and starts with a guided countdown.";
  }, [position?.description]);

  const openChallenge = (challenge: InviteChallengeItem) => {
    const inviteToken = position?.inviteToken || token;
    const target = `/workspace/${challenge.id}?invite=1&inviteToken=${inviteToken}&positionId=${position?.id}&timeLimit=${challenge.timeLimit}`;

    if (!authToken) {
      navigate("/auth", { state: { redirectTo: target } });
      return;
    }

    navigate(target);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <Surface className="max-w-5xl mx-auto p-6 text-sm text-muted-foreground">
          Loading position challenges...
        </Surface>
      </div>
    );
  }

  if (error || !position) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <Surface className="max-w-5xl mx-auto p-6 space-y-4">
          <p className="text-destructive">
            {error || "Failed to load invite."}
          </p>
          <Button asChild variant="outline">
            <Link to="/">Go Home</Link>
          </Button>
        </Surface>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b border-border/50 px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="inline-flex items-center">
          <BrandLogo compact textClassName="text-foreground" />
        </Link>
        <span className="text-xs font-mono text-muted-foreground">INVITE</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        <div className="p-5 space-y-3">
          <h1 className="text-2xl font-semibold text-foreground">
            {position.title}
          </h1>
          <p className="text-sm text-muted-foreground">{introText}</p>
        </div>

        <Surface className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Coding Challenges
            </h2>
            {allChallengesCompleted && (
              <span className="text-sm font-medium text-green-500 flex items-center gap-1">
                <CheckCircle size={16} />
                All completed!
              </span>
            )}
          </div>
          {allChallengesCompleted && (
            <p className="text-sm text-muted-foreground bg-green-500/10 border border-green-500/30 rounded-md p-3">
              🎉 Congratulations! You have successfully completed all
              challenges.
            </p>
          )}
          <div className="space-y-2">
            {position.challenges.map((challenge) => {
              const isSubmitted = submittedChallengeIds.has(challenge.id);
              return (
                <button
                  key={challenge.id}
                  onClick={() => openChallenge(challenge)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-4 rounded-md border transition-colors ${
                    isSubmitted
                      ? "border-border/50 bg-muted/40 cursor-not-allowed opacity-60"
                      : "border-border hover:bg-accent/30 cursor-pointer"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {challenge.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {[challenge.difficulty, challenge.category]
                          .filter(Boolean)
                          .join(" • ") || "Coding challenge"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-sm text-green-500 font-medium">
                          <CheckCircle size={14} />
                          Completed
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock3 size={14} />
                            {challenge.timeLimit} min
                          </span>
                          <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                            Start <ArrowRight size={14} />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Surface>
      </main>
    </div>
  );
}
