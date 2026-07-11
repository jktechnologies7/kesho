import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { resetPasswordSchema } from "@kesho/shared";
import { authApi } from "../api/auth.api";
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter";
import { ApiError } from "@/lib/apiClient";

type FormData = { password: string; confirmPassword: string };

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    // Supabase's password recovery link redirects with #access_token=...&type=recovery
    const params = new URLSearchParams(window.location.hash.replace("#", "?"));
    const token = params.get("access_token");
    if (token) setAccessToken(token);
  }, []);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    if (!accessToken) {
      setServerError("This reset link is invalid or has expired. Please request a new one.");
      return;
    }
    try {
      await authApi.resetPassword(accessToken, data.password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-kesho-green-50 to-white px-4 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
        <h1 className="text-xl font-bold text-kesho-green-700 dark:text-kesho-green-300">Set a new password</h1>

        {success ? (
          <div className="mt-4 rounded-lg bg-kesho-green-50 px-3 py-3 text-sm text-kesho-green-800 dark:bg-kesho-green-900/30 dark:text-kesho-green-200">
            Password updated. Redirecting you to login…
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            {serverError && (
              <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {serverError}
              </div>
            )}
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                New Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kesho-green-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <PasswordStrengthMeter password={watch("password") ?? ""} />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kesho-green-500 dark:border-gray-600 dark:bg-gray-800"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-kesho-green-500 py-2.5 font-semibold text-white hover:bg-kesho-green-600 disabled:opacity-60"
            >
              {isSubmitting ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
