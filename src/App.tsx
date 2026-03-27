import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage.tsx";

import CandidateWorkspace from "./pages/CandidateWorkspace.tsx";
import AIReportPage from "./pages/AIReportPage.tsx";
import NotFound from "./pages/NotFound";
import OAuthSuccess from "./pages/OauthSuccess";
import AuthPage from "./pages/Auth/Auth";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ChallengesPage from "./pages/ChallengesPage";
// import PositionsPage from "./pages/PositionsPage";
import PositionDetailsPage from "./pages/PositionDetailsPage";
import InvitePositionPage from "./pages/InvitePositionPage";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import PrivacyPage from "./pages/PrivacyPage";
import PrivacyTermsPage from "./pages/PrivacyTermsPage";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppSettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/challenges" element={<ChallengesPage />} />
            {/* <Route path="/positions" element={<PositionsPage />} /> */}
            <Route
              path="/positions/:id"
              element={
                <ProtectedRoute>
                  <PositionDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/invite/:token" element={<InvitePositionPage />} />
            <Route path="/workspace" element={<CandidateWorkspace />} />
            <Route path="/workspace/:id" element={<CandidateWorkspace />} />
            <Route path="/report" element={<AIReportPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/privacy-terms" element={<PrivacyTermsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppSettingsProvider>
  </QueryClientProvider>
);

export default App;
