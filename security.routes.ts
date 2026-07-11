import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../../middleware/requireAuth";
import { validateBody } from "../../../middleware/validateBody";
import { walletPinSchema } from "@kesho/shared";
import * as controller from "../controllers/security.controller";

const router = Router();

const changePinSchema = z.object({
  currentPin: z.string().regex(/^\d{4}$/),
  newPin: z.string().regex(/^\d{4}$/),
  confirmNewPin: z.string().regex(/^\d{4}$/),
}).refine((d) => d.newPin === d.confirmNewPin, {
  message: "New PINs do not match",
  path: ["confirmNewPin"],
});

router.use(requireAuth);

router.post("/wallet-pin", validateBody(walletPinSchema), controller.setupWalletPin);
router.put("/wallet-pin", validateBody(changePinSchema), controller.changeWalletPinHandler);

router.get("/sessions", controller.listSessions);
router.delete("/sessions/:deviceId", controller.revokeDevice);

router.get("/login-history", controller.listLoginHistory);
router.get("/audit-log", controller.listAuditLog);

export default router;
