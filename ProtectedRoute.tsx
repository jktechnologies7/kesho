import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/features/auth/api/auth.api";
import { ApiError } from "@/lib/apiClient";

export function ProtectedRoute() {
  const { profile, isLoading, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    if (profile) return;
    authApi
      .me()
      .then((res) => setProfile(res.profile))
      .catch((err) => {
        if (!(err instanceof ApiError)) console.error(err);
        setProfile(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-kesho-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace />;

  return <Outlet />;
}
