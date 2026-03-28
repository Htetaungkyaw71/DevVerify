import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/store/authApi";
import BrandLogo from "@/components/BrandLogo";
import {
  forgotPasswordInputSchema,
  getFirstValidationMessage,
  otpCodeSchema,
  resetPasswordInputSchema,
} from "@/lib/validationSchemas";
import { getErrorMessage } from "@/lib/errorUtils";

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [forgotPassword, { isLoading: forgotLoading }] =
    useForgotPasswordMutation();
  const [resetPassword, { isLoading: resetLoading }] =
    useResetPasswordMutation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = forgotPasswordInputSchema.safeParse({ email });
    if (!parsed.success) {
      toast({
        title: "Invalid input",
        description: getFirstValidationMessage(parsed.error),
        variant: "destructive",
      });
      return;
    }

    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setStep("code");
      toast({
        title: "Code sent",
        description: "Check your email for OTP code.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorMessage(err, "Unable to send reset code."),
        variant: "destructive",
      });
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = otpCodeSchema.safeParse(code);
    if (!parsed.success) {
      toast({
        title: "Invalid input",
        description: getFirstValidationMessage(parsed.error),
        variant: "destructive",
      });
      return;
    }

    setStep("password");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = resetPasswordInputSchema.safeParse({
      email,
      code,
      newPassword,
      confirmPassword,
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
      await resetPassword({
        email: email.trim(),
        code,
        newPassword,
      }).unwrap();
      toast({ title: "Success", description: "Password reset successfully." });
      navigate("/auth");
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorMessage(err, "Unable to reset password."),
        variant: "destructive",
      });
    }
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
            Reset password
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {step === "email" && "Enter your email to receive OTP code"}
            {step === "code" && "Enter the OTP code sent to your email"}
            {step === "password" && "Set your new password"}
          </p>
        </div>

        <div className="surface-card p-6 rounded-xl">
          {step === "email" && (
            <>
              <form onSubmit={handleSendCode} className="space-y-4">
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

                <Button
                  type="submit"
                  className="w-full glow-primary"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Send Code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/auth"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}

          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  OTP Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  className="bg-background border-border text-center tracking-widest"
                  required
                />
              </div>

              <Button type="submit" className="w-full glow-primary">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("email")}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background border-border"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background border-border"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full glow-primary"
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("code")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
