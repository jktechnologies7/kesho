import { apiClient } from "@/lib/apiClient";
import type { Profile } from "@/store/authStore";
import type { RegisterInput, LoginInput } from "@kesho/shared";

export const authApi = {
  register: (data: RegisterInput) =>
    apiClient.post<{ message: string; requiresVerification: boolean }>("/auth/register", data),

  resendVerification: (email: string) =>
    apiClient.post<{ message: string }>("/auth/resend-verification", { email }),

  login: (data: LoginInput) =>
    apiClient.post<{ message: string; user: { id: string; email: string }; profile: Profile }>(
      "/auth/login",
      data
    ),

  logout: () => apiClient.post<{ message: string }>("/auth/logout"),

  me: () => apiClient.get<{ profile: Profile }>("/auth/me"),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (accessToken: string, password: string) =>
    apiClient.post<{ message: string }>("/auth/reset-password", { accessToken, password }),

  changePassword: (currentPassword: string, newPassword: string, confirmNewPassword: string) =>
    apiClient.put<{ message: string }>("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmNewPassword,
    }),
};
