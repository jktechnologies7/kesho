import { useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { Mail } from "lucide-react";
import { authApi } from "../api/auth.api";

export default function VerifyEmailPendingPage() {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    await authApi.resendVerification(email);
    setResent(true);
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-kesho-green-50 to-white px-4 text-center dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-kesho-green-100 dark:bg-kesho-green-900/40">
          <Mail className="text-kesho-green-600 dark:text-kesho-green-300" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-kesho-green-700 dark:text-kesho-green-300">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          We've sent a verification link to {email ? <strong>{email}</strong> : "your email address"}.
          Click the link to activate your account.
        </p>

        <button
          onClick={handleResend}
          disabled={!email || cooldown > 0}
          className="mt-6 w-full rounded-lg border border-kesho-green-500 py-2.5 font-semibold text-kesho-green-600 hover:bg-kesho-green-50 disabled:opacity-50 dark:hover:bg-kesho-green-900/20"
        >
          {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend verification email"}
        </button>
        {resent && cooldown > 0 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Verification email resent.</p>
        )}

        <p className="mt-6 text-sm">
          <Link to="/login" className="font-medium text-kesho-green-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
