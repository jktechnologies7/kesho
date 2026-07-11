import { prisma } from "../../../lib/prisma";

interface AuditEventInput {
  authUserId: string;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Writes an immutable audit trail entry. Never log secrets (passwords,
 * PINs, tokens) in metadata — only enough context to investigate later
 * (what happened, when, from where).
 */
export async function logAuditEvent(input: AuditEventInput) {
  await prisma.auditLog.create({
    data: {
      authUserId: input.authUserId,
      action: input.action,
      metadata: input.metadata as any,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}
