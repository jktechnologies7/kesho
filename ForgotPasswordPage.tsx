import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { forgotPasswordSchema } from "@kesho/shared";
import { authApi } from "../api/auth.api";

type FormData = { email: string };

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: FormData) => {
    await authApi.forgotPassword(data.email);
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-kesho-green-50 to-white px-4 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
        <h1 className="text-xl font-bold text-kesho-green-700 dark:text-kesho-green-300">Reset your password</h1>

        {sent ? (
          <div className="mt-4 rounded-lg bg-kesho-green-50 px-3 py-3 text-sm text-kesho-green-800 dark:bg-kesho-green-900/30 dark:text-kesho-green-200">
            If that email exists in our system, a secure reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kesho-green-500 dark:border-gray-600 dark:bg-gray-800"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-kesho-green-500 py-2.5 font-semibold text-white hover:bg-kesho-green-600 disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-kesho-green-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
