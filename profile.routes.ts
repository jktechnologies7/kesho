import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { updateProfileSchema } from "@kesho/shared";
import { requireAuth } from "../../../middleware/requireAuth";
import { validateBody } from "../../../middleware/validateBody";
import * as controller from "../controllers/profile.controller";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const deleteAccountSchema = z.object({
  password: z.string().min(1),
  confirm: z.literal(true, {
    errorMap: () => ({ message: "You must confirm account deletion." }),
  }),
});

router.use(requireAuth);

router.get("/", controller.getProfile);
router.put("/", validateBody(updateProfileSchema), controller.updateProfile);
router.post("/avatar", upload.single("avatar"), controller.uploadAvatar);
router.post("/delete", validateBody(deleteAccountSchema), controller.deleteAccount);

export default router;
