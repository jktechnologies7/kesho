import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { registerSchema, type RegisterInput } from "@kesho/shared";
import { authApi } from "../api/auth.api";
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter";
import { InternationalPhoneInput } from "../components/InternationalPhoneInput";
import { PaydayPicker } from "../components/PaydayPicker";
import { ApiError } from "@/lib/apiClient";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { payday: null },
  });

  const password = watch("password") ?? "";

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      await authApi.register(data);
      navigate("/verify-email/pending", { state: { email: data.email } });
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-kesho-green-50 to-white px-4 py-10 dark:from-gray-900 dark:to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 sm:p-8"
      >
        <h1 className="text-2xl font-bold text-kesho-green-700 dark:text-kesho-green-300">
          Create your KESHO account
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Spend Smarter Today. Secure Tomorrow.
        </p>

        {serverError && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                First Name
              </label>
              <input
                id="firstName"
                {...register("firstName")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kesho-green-500 dark:border-gray-600 dark:bg-gray-800"
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Last Name
              </label>
              <input
                id="lastName"
                {...register("lastName")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kesho-green-500 dark:border-gray-600 dark:bg-gray-800"
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

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

          <InternationalPhoneInput name="phone" control={control} error={errors.phone?.message} />

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
            <PasswordStrengthMeter password={password} />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kesho-green-500 dark:border-gray-600 dark:bg-gray-800"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <PaydayPicker name="payday" control={control} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-kesho-green-500 py-2.5 font-semibold text-white transition-colors hover:bg-kesho-green-600 disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-kesho-green-600 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
