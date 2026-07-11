import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { loginSchema, type LoginInput } from "@kesho/shared";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/apiClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const setProfile = useAuthStore((s) => s.setProfile);
  const [serverError, setServerError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setUnverifiedEmail(null);
    try {
      const res = await authApi.login(data);
      setProfile(res.profile);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(data.email);
        setServerError("Please verify your email before continuing.");
      } else if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  };

  const handleResend = async () => {
    const email = unverifiedEmail ?? getValues("email");
    if (email) await authApi.resendVerification(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-kesho-green-50 to-white px-4 py-10 dark:from-gray-900 dark:to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 sm:p-8"
      >
        <h1 className="text-2xl font-bold text-kesho-green-700 dark:text-kesho-green-300">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Log in to your KESHO account</p>

        {serverError && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
          >
            {serverError}
            {unverifiedEmail && (
              <button
                type="button"
                onClick={handleResend}
                className="ml-2 font-medium text-kesho-green-700 underline dark:text-kesho-green-300"
              >
                Resend email
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kesho-green-500 dark:border-gray-600 dark:bg-gray-800"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-kesho-green-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-kesho-green-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-kesho-green-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" {...register("rememberMe")} className="rounded border-gray-300" />
            Remember me
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-kesho-green-500 py-2.5 font-semibold text-white transition-colors hover:bg-kesho-green-600 disabled:opacity-60"
          >
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-kesho-green-600 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
