import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateWorkspace from "./pages/CandidateWorkspace";
import AIReportPage from "./pages/AIReportPage";
import NotFound from "./pages/NotFound";
import OAuthSuccess from "./pages/OauthSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<RecruiterDashboard />} />
          <Route path="/workspace" element={<CandidateWorkspace />} />
          <Route path="/report" element={<AIReportPage />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
