import { Link } from "react-router-dom";
import { Surface } from "@/components/ui/Surface";
import BrandLogo from "@/components/BrandLogo";

export default function PrivacyTermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b border-border/50 px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="inline-flex items-center">
          <BrandLogo compact textClassName="text-foreground" />
        </Link>
        <span className="text-xs font-mono text-muted-foreground">TERMS</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Surface className="p-6 space-y-6">
          <h1 className="text-2xl font-semibold">Privacy Terms</h1>
          <p className="text-sm text-muted-foreground">
            These terms describe acceptable use of DevVerify assessments,
            reports, and candidate data handling in your workspace.
          </p>
          <section className="space-y-2">
            <h2 className="font-medium">Acceptable use</h2>
            <p className="text-sm text-muted-foreground">
              Users must not misuse challenge content, attempt unauthorized
              access, or manipulate assessment outcomes.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-medium">Data responsibility</h2>
            <p className="text-sm text-muted-foreground">
              Recruiters are responsible for lawful candidate data processing
              and retention according to their local policies.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-medium">Service scope</h2>
            <p className="text-sm text-muted-foreground">
              DevVerify provides tooling for skill evaluation and reporting;
              hiring decisions remain with the recruiting organization.
            </p>
          </section>
        </Surface>
      </main>
    </div>
  );
}
