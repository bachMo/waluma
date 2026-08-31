import { Router } from "express";
import {
  sendOtpHandler,
  verifyOtpHandler,
  refreshTokenHandler,
  logoutHandler,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/otp/send", sendOtpHandler);
router.post("/otp/verify", verifyOtpHandler);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", authenticate, logoutHandler);

export default router;