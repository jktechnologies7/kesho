import { Response } from "express";
import sharp from "sharp";
import { AuthenticatedRequest } from "../../../middleware/requireAuth";
import { prisma } from "../../../lib/prisma";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { supabasePublic } from "../../../lib/supabasePublic";
import { logAuditEvent } from "../../security/services/auditLog.service";

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const profile = await prisma.profile.findUnique({ where: { authUserId: req.authUserId! } });
  if (!profile) {
    return res.status(404).json({ error: { code: "PROFILE_NOT_FOUND", message: "Profile not found." } });
  }
  return res.json({ profile });
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const profile = await prisma.profile.update({
    where: { authUserId: req.authUserId! },
    data: req.body,
  });

  await logAuditEvent({ authUserId: req.authUserId!, action: "PROFILE_UPDATED", metadata: req.body });

  return res.json({ profile });
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const AVATAR_BUCKET = "avatars";

export async function uploadAvatar(req: AuthenticatedRequest, res: Response) {
  const file = req.file;
  if (!file) {
    return res.status(422).json({ error: { code: "NO_FILE", message: "No image was provided." } });
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return res.status(413).json({ error: { code: "FILE_TOO_LARGE", message: "Maximum file size is 5MB." } });
  }

  const compressed = await sharp(file.buffer)
    .resize(512, 512, { fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();

  const path = `${req.authUserId}/avatar-${Date.now()}.webp`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(AVATAR_BUCKET)
    .upload(path, compressed, { contentType: "image/webp", upsert: true });

  if (uploadError) {
    return res.status(500).json({ error: { code: "UPLOAD_FAILED", message: uploadError.message } });
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  const profile = await prisma.profile.update({
    where: { authUserId: req.authUserId! },
    data: { avatarUrl: publicUrlData.publicUrl },
  });

  await logAuditEvent({ authUserId: req.authUserId!, action: "AVATAR_UPDATED" });

  return res.json({ profile });
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response) {
  const { password } = req.body as { password?: string };
  const email = req.authUserEmail!;

  if (!password) {
    return res.status(422).json({ error: { code: "VALIDATION_ERROR", message: "Password is required." } });
  }

  const { error: reauthError } = await supabasePublic.auth.signInWithPassword({ email, password });
  if (reauthError) {
    return res.status(401).json({ error: { code: "INVALID_PASSWORD", message: "Password is incorrect." } });
  }

  // Soft delete: mark profile inactive now; a scheduled job permanently
  // deletes the auth user + data after the configured retention period.
  const RETENTION_DAYS = 30;
  await prisma.profile.update({
    where: { authUserId: req.authUserId! },
    data: {
      accountStatus: "PENDING_DELETION",
      pendingDeletionAt: new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  await logAuditEvent({ authUserId: req.authUserId!, action: "ACCOUNT_DELETION_REQUESTED" });

  return res.json({
    message:
      "Your account has been deactivated and is scheduled for permanent deletion after the retention period.",
  });
}
