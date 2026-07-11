import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function VerifyEmailSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-kesho-green-50 to-white px-4 text-center dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-kesho-green-100 dark:bg-kesho-green-900/40">
          <CheckCircle2 className="text-kesho-green-600 dark:text-kesho-green-300" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-kesho-green-700 dark:text-kesho-green-300">
          Email verified
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your account is now active. You can log in and start using KESHO.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block w-full rounded-lg bg-kesho-green-500 py-2.5 font-semibold text-white hover:bg-kesho-green-600"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
