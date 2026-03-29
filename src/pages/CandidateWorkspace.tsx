import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Play,
  Timer,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import Lottie from "lottie-react";
import DOMPurify from "dompurify";
import { Surface } from "@/components/ui/Surface";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetChallengeByIdQuery } from "@/store/challengesApi";
import {
  useCreateSubmissionMutation,
  useGetPositionSubmissionsQuery,
} from "@/store/submissionsApi";
import api, { onlineCompilerApi } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BrandLogo from "@/components/BrandLogo";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { getErrorMessage } from "@/lib/errorUtils";
import AppSettingsControls from "@/components/AppSettingsControls";

const languageOptions = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "ruby",
  "go",
  "rust",
  "php",
] as const;

type Language = (typeof languageOptions)[number];

const monacoLanguageMap: Record<Language, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  cpp: "cpp",
  ruby: "ruby",
  go: "go",
  rust: "rust",
  php: "php",
};

const languageLabelMap: Record<Language, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  ruby: "Ruby",
  go: "Go",
  rust: "Rust",
  php: "PHP",
};

const onlineCompilerMap: Record<Language, string> = {
  javascript: "typescript-deno",
  typescript: "typescript-deno",
  python: "python-3.14",
  java: "openjdk-25",
  cpp: "g++-15",
  ruby: "ruby-4.0",
  go: "go-1.26",
  rust: "rust-1.93",
  php: "php-8.5",
};

const getCodeForLanguage = (
  value: unknown,
  language: Language,
): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const langRecord = value as Partial<Record<Language, unknown>>;
    const maybeCode = langRecord[language];
    if (typeof maybeCode === "string") {
      return maybeCode;
    }
  }

  return undefined;
};

const injectTestcaseCode = (sourceCode: string, testcaseCode?: string) => {
  if (!testcaseCode) {
    return sourceCode;
  }

  if (sourceCode.includes(testcaseCode)) {
    return sourceCode;
  }

  const markerRegex = /(\s*)\/\/\s*Add test cases here/;
  if (markerRegex.test(sourceCode)) {
    return sourceCode.replace(markerRegex, (_, indent: string) => {
      return testcaseCode
        .split("\n")
        .map((line) => (line.trim() ? `${indent}${line}` : line))
        .join("\n");
    });
  }

  return `${sourceCode}\n\n${testcaseCode}`;
};

const DEFAULT_INVITE_MINUTES = 60;
const DRAFT_STORAGE_PREFIX = "devverify:draft:";

const getDraftStorageKey = (challengeId: string) =>
  `${DRAFT_STORAGE_PREFIX}${challengeId}`;

const readDraftFromStorage = (challengeId: string) => {
  try {
    const raw = localStorage.getItem(getDraftStorageKey(challengeId));
    if (!raw) return {} as Partial<Record<Language, string>>;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {} as Partial<Record<Language, string>>;
    }

    return parsed as Partial<Record<Language, string>>;
  } catch {
    return {} as Partial<Record<Language, string>>;
  }
};

const formatClock = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

type ParsedTestResult = {
  testNumber: number;
  passed: boolean;
  actual: string;
  expected: string;
};

type LottieJson = Record<string, unknown>;

const parseTestResults = (compilerOutput: string): ParsedTestResult[] => {
  const lines = compilerOutput.split("\n");

  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(
        /^Test\s+(\d+):\s*(PASS|FAIL)\s*\|\s*actual:\s*(.*?)\s*\|\s*expected:\s*(.*)$/i,
      );

      if (!match) return null;

      const [, testNumberRaw, statusRaw, actualRaw, expectedRaw] = match;
      const testNumber = Number(testNumberRaw);

      return {
        testNumber,
        passed: statusRaw.toUpperCase() === "PASS",
        actual: actualRaw?.trim() ?? "",
        expected: expectedRaw?.trim() ?? "",
      };
    })
    .filter((item): item is ParsedTestResult => item !== null);
};

export default function CandidateWorkspace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { theme } = useAppSettings();
  const isMobile = useIsMobile();
  const authUser = useAppSelector((state) => state.auth.user);
  const { id } = useParams<{ id: string }>();

  const isInviteMode = searchParams.get("invite") === "1";
  const inviteTokenFromQuery = searchParams.get("inviteToken") ?? "";
  const positionIdFromQuery = searchParams.get("positionId") ?? "";
  const parsedTimeLimit = Number(searchParams.get("timeLimit") ?? "");
  const inviteTimeLimitMinutes =
    Number.isFinite(parsedTimeLimit) && parsedTimeLimit > 0
      ? parsedTimeLimit
      : DEFAULT_INVITE_MINUTES;
  const inviteQueryString = searchParams.toString();

  const { data, isLoading, isError } = useGetChallengeByIdQuery(id ?? "", {
    skip: !id,
  });

  const [language, setLanguage] = useState<Language>("javascript");
  const [codeByLanguage, setCodeByLanguage] = useState<
    Partial<Record<Language, string>>
  >({});
  const [output, setOutput] = useState("Click Run to execute your code.");
  const [parsedTests, setParsedTests] = useState<ParsedTestResult[]>([]);
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [lastRuntime, setLastRuntime] = useState<string | null>(null);
  const [celebrationAnimation, setCelebrationAnimation] =
    useState<LottieJson | null>(null);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showStartOverlay, setShowStartOverlay] = useState(isInviteMode);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [challengeStarted, setChallengeStarted] = useState(!isInviteMode);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(
    inviteTimeLimitMinutes * 60,
  );
  const [outputHeight, setOutputHeight] = useState(220);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const hasAutoSubmittedRef = useRef(false);

  const [createSubmission] = useCreateSubmissionMutation();
  const {
    data: positionSubmissionsData,
    isLoading: positionSubmissionsLoading,
    isFetching: positionSubmissionsFetching,
  } = useGetPositionSubmissionsQuery(
    { positionId: positionIdFromQuery },
    { skip: !isInviteMode || !authUser || !positionIdFromQuery },
  );

  const alreadySubmittedChallengeIds = useMemo(
    () =>
      new Set(
        (positionSubmissionsData?.submissions || []).map((submission) => {
          if (typeof submission.challengeId === "string") {
            return submission.challengeId;
          }
          return submission.challengeId?._id || "";
        }),
      ),
    [positionSubmissionsData],
  );

  const alreadySolvedInviteChallenge =
    !!id &&
    isInviteMode &&
    !!authUser &&
    alreadySubmittedChallengeIds.has(id) &&
    !positionSubmissionsLoading &&
    !positionSubmissionsFetching;
  const minOutputHeight = isMobile ? 140 : 80;
  const maxOutputHeight = isMobile ? 320 : 600;

  const beginDrag = useCallback(
    (clientY: number) => {
      isDragging.current = true;
      dragStartY.current = clientY;
      dragStartHeight.current = outputHeight;
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    [outputHeight],
  );

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      beginDrag(e.clientY);
    },
    [beginDrag],
  );

  const onDragStartTouch = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      beginDrag(touch.clientY);
    },
    [beginDrag],
  );

  useEffect(() => {
    let isMounted = true;

    const loadCelebration = async () => {
      try {
        const response = await fetch("/celebration.json");
        if (!response.ok) return;
        const json = (await response.json()) as LottieJson;
        if (isMounted) {
          setCelebrationAnimation(json);
        }
      } catch {
        // Ignore animation load errors
      }
    };

    void loadCelebration();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!celebrationAnimation || celebrationTrigger === 0) return;

    setShowCelebrationOverlay(true);
    const timeoutId = window.setTimeout(() => {
      setShowCelebrationOverlay(false);
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [celebrationAnimation, celebrationTrigger]);

  useEffect(() => {
    if (!isMobile) return;
    setOutputHeight((prev) => (prev > 320 || prev < 140 ? 200 : prev));
  }, [isMobile]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = dragStartY.current - e.clientY;
      setOutputHeight(
        Math.max(
          minOutputHeight,
          Math.min(maxOutputHeight, dragStartHeight.current + delta),
        ),
      );
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const delta = dragStartY.current - touch.clientY;
      setOutputHeight(
        Math.max(
          minOutputHeight,
          Math.min(maxOutputHeight, dragStartHeight.current + delta),
        ),
      );
    };

    const onDragEnd = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onDragEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onDragEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onDragEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onDragEnd);
    };
  }, [isMobile, maxOutputHeight, minOutputHeight]);

  useEffect(() => {
    if (!isInviteMode) {
      setShowStartOverlay(false);
      setChallengeStarted(true);
      setCountdown(null);
      return;
    }

    setHasSubmitted(false);
    setShowStartOverlay(true);
    setChallengeStarted(false);
    setCountdown(null);
    setTimeLeftSeconds(inviteTimeLimitMinutes * 60);
    hasAutoSubmittedRef.current = false;
  }, [id, isInviteMode, inviteTimeLimitMinutes]);

  useEffect(() => {
    if (!id || !isInviteMode || authUser) return;
    const redirectTo = `/workspace/${id}?${inviteQueryString}`;
    navigate("/auth", { replace: true, state: { redirectTo } });
  }, [authUser, id, inviteQueryString, isInviteMode, navigate]);

  useEffect(() => {
    if (!alreadySolvedInviteChallenge) return;

    const invitePath = inviteTokenFromQuery
      ? `/invite/${inviteTokenFromQuery}`
      : "/";
    navigate(invitePath, { replace: true });
  }, [alreadySolvedInviteChallenge, inviteTokenFromQuery, navigate]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      setShowStartOverlay(false);
      setChallengeStarted(true);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCountdown((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [countdown]);

  useEffect(() => {
    if (!isInviteMode || !challengeStarted || hasSubmitted) return;
    if (timeLeftSeconds <= 0) return;

    const intervalId = window.setInterval(() => {
      setTimeLeftSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [challengeStarted, hasSubmitted, isInviteMode, timeLeftSeconds]);

  const challenge = data?.data;

  useEffect(() => {
    if (!id || !challenge?.boilerplateCode) return;

    const testcaseSource = (challenge as { testcaseCode?: unknown })
      .testcaseCode;
    const savedDraft = readDraftFromStorage(id);

    const initial: Partial<Record<Language, string>> = {};
    languageOptions.forEach((lang) => {
      if (typeof savedDraft[lang] === "string") {
        initial[lang] = savedDraft[lang];
        return;
      }

      const fromApi = getCodeForLanguage(challenge.boilerplateCode, lang);
      const testcaseCode = getCodeForLanguage(testcaseSource, lang);

      if (typeof fromApi === "string") {
        const strippedBoilerplate =
          testcaseCode && fromApi.includes(testcaseCode)
            ? fromApi.replace(testcaseCode, "").trimEnd()
            : fromApi;

        initial[lang] = strippedBoilerplate;
      }
    });
    setCodeByLanguage(initial);
  }, [challenge, id]);

  useEffect(() => {
    if (!id || !challenge) return;

    try {
      localStorage.setItem(
        getDraftStorageKey(id),
        JSON.stringify(codeByLanguage),
      );
    } catch {
      // Ignore storage write failures
    }
  }, [challenge, codeByLanguage, id]);

  const currentCode = useMemo(() => {
    return codeByLanguage[language] ?? "";
  }, [codeByLanguage, language]);

  const sanitizedChallengeHtml = useMemo(() => {
    const rawHtml =
      challenge?.description ||
      challenge?.problemStatement ||
      challenge?.prompt ||
      "No description available for this challenge.";

    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
    });
  }, [challenge]);

  const formattedTime = useMemo(
    () => formatClock(timeLeftSeconds),
    [timeLeftSeconds],
  );

  const isNearTimeout =
    isInviteMode && challengeStarted && !hasSubmitted && timeLeftSeconds <= 60;

  const handleBack = () => {
    if (isInviteMode && inviteTokenFromQuery) {
      navigate(`/invite/${inviteTokenFromQuery}`);
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  const startInviteChallenge = () => {
    if (!isInviteMode || countdown !== null) return;
    setCountdown(3);
  };

  const setCurrentCode = (value: string) => {
    setCodeByLanguage((prev) => ({
      ...prev,
      [language]: value,
    }));
  };

  const runCode = async () => {
    const compiler = onlineCompilerMap[language];
    const testcaseSource = (challenge as { testcaseCode?: unknown } | undefined)
      ?.testcaseCode;
    const testcaseCode = getCodeForLanguage(testcaseSource, language);
    const codeToRun = injectTestcaseCode(currentCode, testcaseCode);

    if (!compiler) {
      setOutput("Compiler is not configured for this language.");
      return;
    }

    try {
      setRunning(true);
      setOutput("Running...");
      setParsedTests([]);
      setSelectedTestIndex(0);
      setLastRuntime(null);

      const res = await onlineCompilerApi.post("", {
        compiler,
        code: codeToRun,
      });

      console.log(codeToRun);

      const result = res.data?.data ?? res.data;
      const output = result?.output ?? "";
      const error = result?.error ?? "";
      const exitCode = result?.exit_code ?? "";
      const signal = result?.signal ?? null;
      const executionTime = result?.time ?? "";
      const totalTime = result?.total ?? "";
      const memory = result?.memory ?? "";
      const status = result?.status ?? "";

      console.log("result", result);

      const tests = parseTestResults(output);
      setParsedTests(tests);
      setSelectedTestIndex(0);
      setLastRuntime(executionTime ? String(executionTime) : null);

      const passedAllTests =
        tests.length > 0 && tests.every((test) => test.passed);
      if (passedAllTests) {
        setCelebrationTrigger((prev) => prev + 1);
      }

      setOutput(
        (output || error
          ? [
              output && `Testcase Output:\n${output}`,
              error && `❌ Other Output / Errors:\n${error}`,
            ]
              .filter(Boolean)
              .join("\n\n")
          : "") ||
          [
            status && `Status: ${status}`,
            executionTime && `Execution: ${executionTime}s`,
            totalTime && `Total: ${totalTime}s`,
            memory && `Memory: ${memory}KB`,
            exitCode && `Exit code: ${exitCode}`,
            signal && `Signal: ${signal}`,
            "No output produced. Add console.log/print statements to see output.",
          ]
            .filter(Boolean)
            .join("\n"),
      );
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error instanceof Error
          ? error.message
          : "Failed to run code. Please try again.");
      setOutput(message);
      setParsedTests([]);
      setSelectedTestIndex(0);
      setLastRuntime(null);
    } finally {
      setRunning(false);
    }
  };

  const selectedTest = parsedTests[selectedTestIndex] ?? null;
  const allTestsPassed =
    parsedTests.length > 0 && parsedTests.every((test) => test.passed);

  const submitSolution = useCallback(
    async (trigger: "manual" | "timeout") => {
      if (!id || !isInviteMode || submitting || hasSubmitted) return;
      if (trigger === "timeout" && hasAutoSubmittedRef.current) return;

      try {
        setSubmitting(true);

        if (trigger === "timeout") {
          hasAutoSubmittedRef.current = true;
        }

        const response = await createSubmission({
          positionId: positionIdFromQuery,
          challengeId: id,
          language,
          submittedCode: currentCode,
        }).unwrap();

        setHasSubmitted(true);

        const submission = response.submission;

        let feedbackOutput = `\n\n=== SUBMISSION COMPLETED ===\n`;
        feedbackOutput += "Your submission has been completed.";

        setOutput((prev) => `${prev}${feedbackOutput}`);

        if (trigger === "timeout") {
          toast({
            title: "Time is up",
            description: "Your solution was auto-submitted successfully.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Solution submitted successfully!",
          description: "Submission completed.",
        });
      } catch (error) {
        toast({
          title: "Submission failed",
          description: getErrorMessage(error, "Please try again."),
          variant: "destructive",
        });
        if (trigger === "timeout") {
          hasAutoSubmittedRef.current = false;
        }
      } finally {
        setSubmitting(false);
      }
    },
    [
      currentCode,
      hasSubmitted,
      id,
      isInviteMode,
      language,
      positionIdFromQuery,
      submitting,
      toast,
      createSubmission,
    ],
  );

  useEffect(() => {
    if (!isInviteMode || !challengeStarted || hasSubmitted) return;
    if (timeLeftSeconds > 0) return;
    if (hasAutoSubmittedRef.current) return;

    void submitSolution("timeout");
  }, [
    challengeStarted,
    hasSubmitted,
    isInviteMode,
    submitSolution,
    timeLeftSeconds,
  ]);

  if (!id) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <Surface className="p-6">
          <p className="text-muted-foreground">No challenge selected.</p>
          <Button asChild className="mt-4">
            <Link to="/challenges">Go to challenges</Link>
          </Button>
        </Surface>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[90dvh]">
          {/* Left Panel Skeleton */}
          <Surface className="p-6 space-y-4 overflow-hidden">
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Surface>

          {/* Editor Panel Skeleton */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Surface className="p-4 flex-1">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-full w-full min-h-96" />
              </div>
            </Surface>
            <Surface className="p-4 h-32">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Surface>
          </div>
        </div>
      </div>
    );
  }

  if (
    isInviteMode &&
    authUser &&
    (positionSubmissionsLoading || positionSubmissionsFetching)
  ) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <Surface className="p-6 text-sm text-muted-foreground">
          Checking challenge status...
        </Surface>
      </div>
    );
  }

  if (isError || !challenge) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <Surface className="p-6 text-destructive">
          Failed to load challenge.
        </Surface>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-14 border-b border-border/50 px-4 sm:px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center">
            <BrandLogo compact showText={false} className="gap-0" />
          </Link>
          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            {isInviteMode ? "Back" : "Back"}
          </button>
        </div>
        {isInviteMode && (
          <Button
            onClick={runCode}
            className="gap-2"
            disabled={
              running || (isInviteMode && (!challengeStarted || hasSubmitted))
            }
          >
            <Play size={14} />
            {running ? "Running" : "Run"}
          </Button>
        )}

        <div className="flex items-center gap-2">
          <AppSettingsControls />
          {isInviteMode && (
            <div
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-mono ring-1 ${
                isNearTimeout
                  ? "text-destructive ring-destructive/40 bg-destructive/10 animate-pulse"
                  : "text-muted-foreground ring-border bg-secondary"
              }`}
            >
              <Timer size={14} />
              {formattedTime}
            </div>
          )}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="h-9 rounded-md bg-secondary px-3 text-sm ring-1 ring-border"
          >
            {languageOptions.map((lang) => (
              <option key={lang} value={lang}>
                {languageLabelMap[lang]}
              </option>
            ))}
          </select>
          {!isInviteMode && (
            <Button
              onClick={runCode}
              className="gap-2"
              disabled={
                running || (isInviteMode && (!challengeStarted || hasSubmitted))
              }
            >
              <Play size={14} />
              {running ? "Running" : "Run"}
            </Button>
          )}

          {isInviteMode && (
            <Button
              onClick={() => void submitSolution("manual")}
              className="gap-2"
              // variant={isNearTimeout ? "destructive" : "default"}
              disabled={!challengeStarted || hasSubmitted || submitting}
            >
              {hasSubmitted
                ? "Submitted"
                : submitting
                  ? "Submitting..."
                  : "Submit"}
            </Button>
          )}
        </div>
      </header>

      <main className="relative flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-y-auto lg:overflow-hidden">
        <section className="border-b lg:border-b-0 lg:border-r border-border/50 overflow-y-visible lg:overflow-y-auto p-4 sm:p-6 lg:col-span-1">
          <h1 className="text-2xl font-semibold text-foreground">
            {challenge.title}
          </h1>
          {isInviteMode && (
            <div className="mt-3 space-y-2 ">
              <div
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-mono ring-1 ${
                  isNearTimeout
                    ? "text-destructive ring-destructive/40 bg-destructive/10 animate-pulse"
                    : "text-muted-foreground ring-border bg-secondary"
                }`}
              >
                <Timer size={14} />
                {formattedTime}
              </div>
              {isNearTimeout && (
                <p className="text-sm text-destructive animate-pulse inline-flex items-center gap-1 ml-2">
                  <TriangleAlert size={14} />
                  Hurry up! Less than 1 minute left.
                </p>
              )}
              {hasSubmitted && (
                <p className="text-sm text-green-500 animate-pulse inline-flex items-center gap-1 ml-2">
                  Challenge ended. Submission completed.
                </p>
              )}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-secondary ring-1 ring-border">
              {challenge.difficulty}
            </span>
            <span className="px-2 py-1 rounded bg-secondary ring-1 ring-border">
              {challenge.category}
            </span>
            {challenge.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded bg-secondary ring-1 ring-border text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h2 className="text-foreground font-medium">Description</h2>
              <div
                className="mt-2 whitespace-normal break-words leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_h2]:mt-5 [&_h2]:mb-3 [&_h3]:mt-5 [&_h3]:mb-3 [&_h4]:mt-4 [&_h4]:mb-2 [&_ul]:my-3 [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:pl-5 [&_li]:mb-1.5 [&_pre]:my-4 [&_pre]:p-3 [&_pre]:rounded [&_pre]:bg-secondary [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:bg-secondary [&_code]:px-1 [&_code]:py-0 [&_code]:rounded [&_code]:break-words [&_b]:text-foreground"
                dangerouslySetInnerHTML={{
                  __html: sanitizedChallengeHtml,
                }}
              />
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="hints" className="border-border/50">
                <AccordionTrigger className="py-2 text-foreground hover:no-underline">
                  Show hints
                </AccordionTrigger>
                <AccordionContent>
                  {challenge.hints?.length ? (
                    <div className="space-y-2">
                      {challenge.hints.map((hint, index) => (
                        <p key={index}>{hint}</p>
                      ))}
                    </div>
                  ) : (
                    <p>No hints available.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <section className="flex flex-col lg:col-span-2 min-h-[70vh] lg:min-h-0">
          <div className="flex-1 min-h-[45vh] lg:min-h-0">
            <Editor
              height="100%"
              language={monacoLanguageMap[language]}
              value={currentCode}
              onChange={(value) => setCurrentCode(value ?? "")}
              loading={
                <div className="h-full w-full p-4 bg-card/40 space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className={`h-5 ${
                        i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-full" : "w-2/3"
                      }`}
                    />
                  ))}
                </div>
              }
              theme={theme === "light" ? "vs" : "vs-dark"}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                padding: { top: 12 },
                readOnly: isInviteMode && (!challengeStarted || hasSubmitted),
              }}
            />
          </div>

          <div
            className="flex-shrink-0 border-t border-border/50 bg-card/40 flex flex-col"
            style={{ height: outputHeight }}
          >
            <div
              onMouseDown={onDragStart}
              onTouchStart={onDragStartTouch}
              className="h-3 lg:h-1.5 w-full cursor-row-resize flex items-center justify-center group touch-none active:bg-accent/40"
              title="Drag to resize"
            >
              <div className="w-10 h-0.5 rounded-full bg-border group-hover:bg-primary transition-colors" />
            </div>
            <div className="flex-1 overflow-auto px-4 pb-4 pt-1">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
                Output
              </h3>
              {parsedTests.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xl font-medium ${
                        allTestsPassed ? " text-green-500 " : "text-destructive"
                      }`}
                    >
                      {/* {allTestsPassed ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )} */}
                      {allTestsPassed ? "Accepted" : "Failed"}
                    </span>

                    {lastRuntime && (
                      <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        Runtime: {lastRuntime}s
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pb-1 ">
                    {parsedTests.map((test, index) => {
                      const isActive = index === selectedTestIndex;

                      return (
                        <button
                          key={`${test.testNumber}-${index}`}
                          type="button"
                          onClick={() => setSelectedTestIndex(index)}
                          className={`inline-flex font-semibold shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-md ring-1 transition-colors ${
                            isActive
                              ? "bg-primary/15 text-foreground ring-primary/40"
                              : "bg-secondary text-muted-foreground ring-border hover:text-foreground"
                          }`}
                        >
                          {test.passed ? (
                            <Check size={15} className="text-green-500" />
                          ) : (
                            <X size={15} className="text-destructive" />
                          )}
                          {`Test ${test.testNumber}`}
                        </button>
                      );
                    })}
                  </div>

                  {selectedTest && (
                    <div className="rounded-md border border-border/60 bg-background/60 p-3 text-sm font-mono space-y-2">
                      <p className="text-muted-foreground">
                        <span className="text-foreground">Status:</span>{" "}
                        {selectedTest.passed ? "PASS" : "FAIL"}
                      </p>
                      <p className="text-muted-foreground break-words">
                        <span className="text-foreground">Actual:</span>{" "}
                        {selectedTest.actual}
                      </p>
                      <p className="text-muted-foreground break-words">
                        <span className="text-foreground">Expected:</span>{" "}
                        {selectedTest.expected}
                      </p>
                    </div>
                  )}

                  {!!output && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground">
                        Raw output
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap text-foreground font-mono">
                        {output}
                      </pre>
                    </details>
                  )}
                </div>
              ) : (
                <pre className="text-md whitespace-pre-wrap text-foreground font-mono">
                  {output}
                </pre>
              )}
            </div>
          </div>
        </section>

        {isInviteMode && showStartOverlay && (
          <div className="absolute inset-0 z-40 bg-background/90 backdrop-blur-sm flex items-center justify-center p-6">
            <Surface className="w-full max-w-xl p-8 text-center space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Ready to start?
              </h2>
              <p className="text-sm text-muted-foreground">
                Your timer will begin after countdown. Make sure you are ready.
              </p>

              {countdown === null ? (
                <Button onClick={startInviteChallenge} className="px-8">
                  Start
                </Button>
              ) : (
                <div className="text-7xl font-bold text-primary animate-pulse">
                  {countdown}
                </div>
              )}
            </Surface>
          </div>
        )}

        {showCelebrationOverlay && celebrationAnimation && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
            <div className="w-[min(92vw,760px)] h-[min(70vh,560px)]">
              <Lottie
                key={celebrationTrigger}
                animationData={celebrationAnimation}
                loop={false}
                autoplay
                className="h-full w-full"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
