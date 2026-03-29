import { Surface } from "@/components/ui/Surface";
import MainNavbar from "@/components/MainNavbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNavbar />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Surface className="p-6 space-y-6">
          <h1 className="text-2xl font-semibold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            DevVerify collects only the data required to deliver coding
            assessments, AI review reports, and recruiter analytics.
          </p>
          <section className="space-y-2">
            <h2 className="font-medium">What we collect</h2>
            <p className="text-sm text-muted-foreground">
              Account details, challenge submissions, and report metadata such
              as timestamps and review outcomes.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-medium">How we use data</h2>
            <p className="text-sm text-muted-foreground">
              Data is used to evaluate submissions, generate AI-assisted
              feedback, and provide recruiter reporting dashboards.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-medium">Contact</h2>
            <p className="text-sm text-muted-foreground">
              For privacy requests, contact your DevVerify workspace
              administrator.
            </p>
          </section>
        </Surface>
      </main>
    </div>
  );
}
