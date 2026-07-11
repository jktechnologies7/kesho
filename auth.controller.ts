import { Request, Response } from "express";
import { supabasePublic } from "../../../lib/supabasePublic";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { prisma } from "../../../lib/prisma";
import { setAuthCookies, clearAuthCookies } from "../../../lib/authCookies";
import { AuthenticatedRequest } from "../../../middleware/requireAuth";
import { logAuditEvent } from "../../security/services/auditLog.service";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

export async function register(req: Request, res: Response) {
  const { firstName, lastName, email, phone, password, payday } = req.body;

  const { data, error } = await supabasePublic.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, phone },
      emailRedirectTo: `${CLIENT_ORIGIN}/verify-email/success`,
    },
  });

  if (error || !data.user) {
    const status = error?.status === 422 ? 409 : 400;
    return res.status(status).json({
      error: {
        code: status === 409 ? "EMAIL_IN_USE" : "SIGNUP_FAILED",
        message:
          status === 409
            ? "An account with this email already exists."
            : error?.message ?? "Could not create account.",
      },
    });
  }

  await prisma.profile.create({
    data: {
      authUserId: data.user.id,
      firstName,
      lastName,
      email,
      phone,
      payday: payday ?? null,
    },
  });

  await logAuditEvent({ authUserId: data.user.id, action: "REGISTER", metadata: { email } });

  return res.status(201).json({
    message: "Account created. Please check your email to verify your address.",
    requiresVerification: true,
  });
}

export async function resendVerification(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(422).json({ error: { code: "VALIDATION_ERROR", message: "Email is required." } });
  }

  await supabasePublic.auth.resend({ type: "signup", email });
  // Always return success to avoid leaking whether an email is registered.
  return res.json({ message: "If that email exists, a new verification link has been sent." });
}

export async function login(req: Request, res: Response) {
  const { email, password, rememberMe } = req.body;

  const { data, error } = await supabasePublic.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    if (error?.message?.toLowerCase().includes("email not confirmed")) {
      return res.status(403).json({
        error: { code: "EMAIL_NOT_VERIFIED", message: "Please verify your email before continuing." },
      });
    }
    return res.status(401).json({
      error: { code: "INVALID_CREDENTIALS", message: "Incorrect email or password." },
    });
  }

  setAuthCookies(
    res,
    { accessToken: data.session.access_token, refreshToken: data.session.refresh_token },
    Boolean(rememberMe)
  );

  await logAuditEvent({ authUserId: data.user.id, action: "LOGIN", metadata: { email } });

  const profile = await prisma.profile.findUnique({ where: { authUserId: data.user.id } });

  return res.json({
    message: "Logged in successfully.",
    user: { id: data.user.id, email: data.user.email },
    profile,
  });
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  const token = req.cookies?.kesho_access_token;
  clearAuthCookies(res);

  if (token) {
    try {
      // Best-effort server-side revocation; cookie clearing above is what
      // actually ends the session for this browser regardless of outcome.
      await supabaseAdmin.auth.admin.signOut(token);
    } catch {
      /* non-fatal */
    }
  }

  if (req.authUserId) {
    await logAuditEvent({ authUserId: req.authUserId, action: "LOGOUT" });
  }

  return res.json({ message: "Logged out." });
}

export async function me(req: AuthenticatedRequest, res: Response) {
  const profile = await prisma.profile.findUnique({ where: { authUserId: req.authUserId! } });
  if (!profile) {
    return res.status(404).json({ error: { code: "PROFILE_NOT_FOUND", message: "Profile not found." } });
  }
  return res.json({ profile });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  await supabasePublic.auth.resetPasswordForEmail(email, {
    redirectTo: `${CLIENT_ORIGIN}/reset-password`,
  });

  // Always respond the same way whether or not the email exists.
  return res.json({ message: "If that email exists, a password reset link has been sent." });
}

export async function resetPassword(req: Request, res: Response) {
  const { accessToken, password } = req.body as { accessToken?: string; password?: string };

  if (!accessToken || !password) {
    return res.status(422).json({
      error: { code: "VALIDATION_ERROR", message: "Reset token and new password are required." },
    });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userData?.user) {
    return res.status(400).json({
      error: { code: "INVALID_RESET_TOKEN", message: "This reset link is invalid or has expired." },
    });
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
    password,
  });

  if (updateError) {
    return res.status(400).json({
      error: { code: "RESET_FAILED", message: updateError.message },
    });
  }

  await logAuditEvent({ authUserId: userData.user.id, action: "PASSWORD_RESET" });

  return res.json({ message: "Password updated. You can now log in." });
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  const { currentPassword, newPassword } = req.body;
  const email = req.authUserEmail!;

  const { error: reauthError } = await supabasePublic.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (reauthError) {
    return res.status(401).json({
      error: { code: "INVALID_CURRENT_PASSWORD", message: "Current password is incorrect." },
    });
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(req.authUserId!, {
    password: newPassword,
  });

  if (error) {
    return res.status(400).json({ error: { code: "PASSWORD_CHANGE_FAILED", message: error.message } });
  }

  await logAuditEvent({ authUserId: req.authUserId!, action: "PASSWORD_CHANGED" });

  return res.json({ message: "Password changed successfully." });
}
