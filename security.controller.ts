import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/requireAuth";
import { prisma } from "../../../lib/prisma";
import * as walletPinService from "../services/walletPin.service";

function handleServiceError(err: unknown, res: Response) {
  const anyErr = err as { status?: number; message?: string };
  const status = anyErr.status ?? 500;
  return res.status(status).json({
    error: {
      code: status === 500 ? "INTERNAL_ERROR" : "WALLET_PIN_ERROR",
      message: anyErr.message ?? "Something went wrong.",
    },
  });
}

export async function setupWalletPin(req: AuthenticatedRequest, res: Response) {
  try {
    await walletPinService.createWalletPin(req.authUserId!, req.body.pin);
    return res.status(201).json({ message: "Wallet PIN created." });
  } catch (err) {
    return handleServiceError(err, res);
  }
}

export async function changeWalletPinHandler(req: AuthenticatedRequest, res: Response) {
  try {
    await walletPinService.changeWalletPin(req.authUserId!, req.body.currentPin, req.body.newPin);
    return res.json({ message: "Wallet PIN updated." });
  } catch (err) {
    return handleServiceError(err, res);
  }
}

export async function listSessions(req: AuthenticatedRequest, res: Response) {
  const devices = await prisma.trustedDevice.findMany({
    where: { authUserId: req.authUserId! },
    orderBy: { lastActiveAt: "desc" },
  });
  return res.json({ devices });
}

export async function listLoginHistory(req: AuthenticatedRequest, res: Response) {
  const history = await prisma.loginHistory.findMany({
    where: { authUserId: req.authUserId! },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json({ history });
}

export async function listAuditLog(req: AuthenticatedRequest, res: Response) {
  const events = await prisma.auditLog.findMany({
    where: { authUserId: req.authUserId! },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json({ events });
}

export async function revokeDevice(req: AuthenticatedRequest, res: Response) {
  const { deviceId } = req.params;
  await prisma.trustedDevice.deleteMany({
    where: { id: deviceId, authUserId: req.authUserId! },
  });
  return res.json({ message: "Device signed out." });
}
