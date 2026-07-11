import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import VerifyEmailPendingPage from "@/features/auth/pages/VerifyEmailPendingPage";
import VerifyEmailSuccessPage from "@/features/auth/pages/VerifyEmailSuccessPage";
import { ProtectedRoute } from "./ProtectedRoute";

const queryClient = new QueryClient();

// Dashboard, profile, security-center, and wallet pages are built out in
// later parts (budget engine, payments, admin). This placeholder confirms
// the protected-route flow works end-to-end.
function DashboardPlaceholder() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-kesho-green-700 dark:text-kesho-green-300">
          Welcome to KESHO 👋
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Dashboard, wallets, and pockets are built out in the next module.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email/pending" element={<VerifyEmailPendingPage />} />
          <Route path="/verify-email/success" element={<VerifyEmailSuccessPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPlaceholder />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
