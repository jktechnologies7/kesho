import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

export interface AuthenticatedRequest extends Request {
  authUserId?: string;
  authUserEmail?: string;
}

/**
 * Reads the Supabase access token from the httpOnly "kesho_access_token"
 * cookie (preferred) or an Authorization: Bearer header (mobile clients),
 * then verifies it against Supabase Auth before attaching the user to the
 * request. Never trusts a client-supplied user id.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice("Bearer ".length)
      : undefined;
    const token = req.cookies?.kesho_access_token ?? bearer;

    if (!token) {
      return res.status(401).json({ error: { code: "NO_TOKEN", message: "Authentication required." } });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Session is invalid or expired." } });
    }

    if (!data.user.email_confirmed_at) {
      return res.status(403).json({
        error: { code: "EMAIL_NOT_VERIFIED", message: "Please verify your email before continuing." },
      });
    }

    req.authUserId = data.user.id;
    req.authUserEmail = data.user.email ?? undefined;
    next();
  } catch (err) {
    next(err);
  }
}
