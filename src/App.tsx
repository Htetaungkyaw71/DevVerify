import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
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
import AboutPage from "./pages/AboutPage";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import api from "@/lib/api";
import { useAppDispatch } from "./store/hooks";
import { setAuthInitialized, setCredentials } from "./store/authSlice";

const queryClient = new QueryClient();

function AuthBootstrap() {
  const dispatch = useAppDispatch();

  // ...existing code...
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const hasSessionFlag = localStorage.getItem("devverify:has_session");

      if (!hasSessionFlag) {
        if (!cancelled) {
          dispatch(setAuthInitialized(true));
        }
        return;
      }

      try {
        const response = await api.get("/me");
        if (!cancelled) {
          dispatch(setCredentials({ user: response.data?.user ?? null }));
        }
      } catch (err: any) {
        if (!cancelled) {
          dispatch(setCredentials({ user: null }));
          localStorage.removeItem("devverify:has_session");
        }
      } finally {
        if (!cancelled) {
          dispatch(setAuthInitialized(true));
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
  // ...existing code...

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppSettingsProvider>
      <TooltipProvider>
        <AuthBootstrap />
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
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/privacy-terms" element={<PrivacyTermsPage />} />
            <Route
              path="/auth"
              element={
                localStorage.getItem("devverify:has_session") ? (
                  <Navigate to="/" replace />
                ) : (
                  <AuthPage />
                )
              }
            />
            <Route
              path="/forgot-password"
              element={
                localStorage.getItem("devverify:has_session") ? (
                  <Navigate to="/" replace />
                ) : (
                  <ForgotPasswordPage />
                )
              }
            />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppSettingsProvider>
  </QueryClientProvider>
);

export default App;
