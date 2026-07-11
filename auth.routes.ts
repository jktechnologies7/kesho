import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  changePasswordSchema,
} from "@kesho/shared";
import { validateBody } from "../../../middleware/validateBody";
import { requireAuth } from "../../../middleware/requireAuth";
import * as controller from "../controllers/auth.controller";

const router = Router();

// Tighter limits on auth endpoints to slow down credential stuffing / brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many attempts. Please try again later." } },
});

router.post("/register", authLimiter, validateBody(registerSchema), controller.register);
router.post("/resend-verification", authLimiter, controller.resendVerification);
router.post("/login", authLimiter, validateBody(loginSchema), controller.login);
router.post("/logout", requireAuth, controller.logout);
router.get("/me", requireAuth, controller.me);

router.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", authLimiter, controller.resetPassword);
router.put("/change-password", requireAuth, validateBody(changePasswordSchema), controller.changePassword);

export default router;
