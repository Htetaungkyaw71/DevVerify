import { Link } from "react-router-dom";
import { Surface } from "@/components/ui/Surface";
import MainNavbar from "@/components/MainNavbar";

const recruiterSteps = [
  "Sign in and open the Dashboard.",
  "Create a position and select relevant coding challenges.",
  "Copy the generated invite link and share it with candidates.",
  "Track submissions and open AI reports for deeper evaluation.",
  "Use score insights to shortlist the best candidates.",
];

const candidateSteps = [
  "Open the invite link shared by recruiter.",
  "Choose an unsolved challenge and start the timed workspace.",
  "Write code, run tests, and refine your solution.",
  "Submit before time ends (or auto-submit on timeout).",
  "Return to invite page and continue remaining challenges.",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNavbar />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Surface className="p-6 space-y-4">
          <p className="text-xs font-mono text-muted-foreground">ABOUT US</p>
          <h1 className="text-3xl font-semibold">About DevVerify</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            DevVerify is a coding assessment platform built to help recruiters
            evaluate candidates with confidence. It combines timed coding
            workspaces, invite-based challenge flows, and AI-assisted report
            analysis to make technical hiring faster, fair, and evidence-driven.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The platform supports two focused journeys: recruiters create and
            manage assessments, while candidates solve challenges in a guided
            and controlled environment.
          </p>
        </Surface>

        <Surface className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">How the platform works</h2>
          <img
            src="/guides/platform-overview.svg"
            alt="DevVerify platform overview diagram"
            className="w-full rounded-md border border-border/60"
            loading="lazy"
          />
          <p className="text-sm text-muted-foreground">
            Recruiters manage assessments and candidates complete coding tasks.
            DevVerify sits in the middle to collect submissions and generate
            consistent evaluation outputs.
          </p>
        </Surface>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Surface className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Recruiter User Guide</h2>
            <img
              src="/guides/recruiter-flow.svg"
              alt="Recruiter step by step workflow"
              className="w-full rounded-md border border-border/60"
              loading="lazy"
            />
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              {recruiterSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Surface>

          <Surface className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Candidate User Guide</h2>
            <img
              src="/guides/candidate-flow.svg"
              alt="Candidate step by step workflow"
              className="w-full rounded-md border border-border/60"
              loading="lazy"
            />
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              {candidateSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Surface>
        </div>

        <Surface className="p-6 space-y-3">
          <h2 className="text-xl font-semibold">Quick Start</h2>
          <p className="text-sm text-muted-foreground">
            New user? Start from the landing page and choose your role.
            Recruiters should go to Dashboard; candidates should open an invite
            link received from a recruiter.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-md ring-1 ring-border text-sm font-medium"
            >
              Back to Home
            </Link>
          </div>
        </Surface>
      </main>
    </div>
  );
}
