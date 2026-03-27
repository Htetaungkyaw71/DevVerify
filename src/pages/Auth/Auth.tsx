import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2, Github } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useLoginMutation,
  useRegisterMutation,
  useSendRegisterOtpMutation,
} from "@/store/authApi";
import BrandLogo from "@/components/BrandLogo";
import {
  getFirstValidationMessage,
  loginInputSchema,
  registerInputSchema,
  registerWithOtpInputSchema,
} from "@/lib/validationSchemas";
import { API_AUTH_GITHUB_URL } from "@/lib/apiConfig";
import { getErrorMessage } from "@/lib/errorUtils";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [sendRegisterOtp, { isLoading: sendOtpLoading }] =
    useSendRegisterOtpMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const submitting = loginLoading || registerLoading || sendOtpLoading;
  const redirectTo =
    (location.state as { redirectTo?: string } | null)?.redirectTo || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const parsed = loginInputSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast({
            title: "Invalid input",
            description: getFirstValidationMessage(parsed.error),
            variant: "destructive",
          });
          return;
        }

        await login({
          email: email.trim(),
          password,
        }).unwrap();
        toast({ title: "Welcome back!" });
        navigate(redirectTo);
        return;
      }

      const parsed = registerInputSchema.safeParse({
        username,
        email,
        password,
      });

      if (!parsed.success) {
        toast({
          title: "Invalid input",
          description: getFirstValidationMessage(parsed.error),
          variant: "destructive",
        });
        return;
      }

      await sendRegisterOtp({ email: parsed.data.email }).unwrap();
      setCode("");
      setOtpModalOpen(true);
      toast({
        title: "OTP sent",
        description: "Check your email and enter the 6-digit code.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorMessage(err, "Unable to complete sign in."),
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const parsed = registerWithOtpInputSchema.safeParse({
        username,
        email,
        password,
        code,
      });

      if (!parsed.success) {
        toast({
          title: "Invalid input",
          description: getFirstValidationMessage(parsed.error),
          variant: "destructive",
        });
        return;
      }

      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        code,
      }).unwrap();
      toast({ title: "Account created!" });
      setOtpModalOpen(false);
      navigate(redirectTo);
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorMessage(err, "Unable to complete registration."),
        variant: "destructive",
      });
    }
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setCode("");
    setOtpModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center mb-6">
            <BrandLogo textClassName="text-foreground" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-4">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {isLogin
              ? "Enter your credentials to continue"
              : "Start your coding journey today"}
          </p>
        </div>

        <div className="surface-card p-6 rounded-xl">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = API_AUTH_GITHUB_URL;
            }}
          >
            <Github className="w-4 h-4 mr-2" />
            Sign in with GitHub
          </Button>

          <div className="my-4 text-center text-xs font-mono text-muted-foreground">
            OR
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background border-border"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background border-border"
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              className="w-full glow-primary"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Send OTP"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleSwitchMode}
              className="text-sm text-muted-foreground  transition-colors"
            >
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <span className="text-primary font-medium">
                {isLogin ? "Sign up" : "Sign in"}
              </span>
            </button>
          </div>
        </div>

        <Dialog open={otpModalOpen} onOpenChange={setOtpModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Verify your email</DialogTitle>
              <DialogDescription>
                Enter the 6-digit OTP sent to {email}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                className="text-center tracking-widest"
                autoFocus
              />

              <Button
                type="submit"
                className="w-full"
                disabled={registerLoading}
              >
                {registerLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
