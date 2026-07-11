import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { logAuditEvent } from "./auditLog.service";

const SALT_ROUNDS = Number(process.env.PIN_HASH_SALT_ROUNDS ?? 12);
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;

export async function createWalletPin(authUserId: string, pin: string) {
  const existing = await prisma.walletPin.findUnique({ where: { authUserId } });
  if (existing) {
    throw Object.assign(new Error("Wallet PIN already set. Use change-PIN instead."), { status: 409 });
  }

  const pinHash = await bcrypt.hash(pin, SALT_ROUNDS);
  await prisma.walletPin.create({ data: { authUserId, pinHash } });
  await logAuditEvent({ authUserId, action: "WALLET_PIN_CREATED" });
}

export async function changeWalletPin(authUserId: string, currentPin: string, newPin: string) {
  const record = await verifyNotLocked(authUserId);
  const matches = await bcrypt.compare(currentPin, record.pinHash);

  if (!matches) {
    await registerFailedAttempt(authUserId, record.failedAttempts);
    throw Object.assign(new Error("Current PIN is incorrect."), { status: 401 });
  }

  const pinHash = await bcrypt.hash(newPin, SALT_ROUNDS);
  await prisma.walletPin.update({
    where: { authUserId },
    data: { pinHash, failedAttempts: 0, lockedUntil: null },
  });
  await logAuditEvent({ authUserId, action: "WALLET_PIN_CHANGED" });
}

/**
 * Verifies a Wallet PIN for a sensitive action (withdrawal, transfer,
 * emergency fund access, etc). Throws with `status` set so controllers can
 * translate it into the right HTTP response.
 */
export async function verifyWalletPin(authUserId: string, pin: string): Promise<void> {
  const record = await verifyNotLocked(authUserId);
  const matches = await bcrypt.compare(pin, record.pinHash);

  if (!matches) {
    const attempts = await registerFailedAttempt(authUserId, record.failedAttempts);
    if (attempts >= MAX_ATTEMPTS) {
      throw Object.assign(
        new Error("Wallet locked due to too many failed PIN attempts. Please re-authenticate."),
        { status: 423 }
      );
    }
    throw Object.assign(new Error("Incorrect PIN."), { status: 401 });
  }

  if (record.failedAttempts > 0) {
    await prisma.walletPin.update({ where: { authUserId }, data: { failedAttempts: 0 } });
  }
}

async function verifyNotLocked(authUserId: string) {
  const record = await prisma.walletPin.findUnique({ where: { authUserId } });
  if (!record) {
    throw Object.assign(new Error("Wallet PIN not set up yet."), { status: 404 });
  }
  if (record.lockedUntil && record.lockedUntil > new Date()) {
    throw Object.assign(new Error("Wallet is temporarily locked. Please try again later."), {
      status: 423,
    });
  }
  return record;
}

async function registerFailedAttempt(authUserId: string, currentAttempts: number) {
  const attempts = currentAttempts + 1;
  const shouldLock = attempts >= MAX_ATTEMPTS;

  await prisma.walletPin.update({
    where: { authUserId },
    data: {
      failedAttempts: attempts,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null,
    },
  });

  if (shouldLock) {
    await logAuditEvent({ authUserId, action: "WALLET_LOCKED_FAILED_PIN_ATTEMPTS" });
    // TODO: send email notification — wired up once the email provider is configured in Part 8.
  }

  return attempts;
}
