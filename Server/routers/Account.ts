import express from "express";
import { AccountController } from "../controllers/Account.js";
import { validate } from "../services/validate_register.js";
import authorization from "../middleware/authorization.js";

const router = express.Router();

router.post("/register", validate(), AccountController.register);
router.post("/login", AccountController.login);
router.get("/get", authorization, AccountController.getAccount);
router.post(
  "/send-verification-code-email",
  AccountController.sendVerificationCodeEmail
);

export default router;
