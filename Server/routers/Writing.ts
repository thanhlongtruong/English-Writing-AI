import express from "express";
import { WritingController } from "../controllers/Writing.js";
import authorization from "../middleware/authorization.js";

const router = express.Router();

router.post("/generate", authorization, WritingController.generate);
router.post("/evaluate", authorization, WritingController.evaluate);

export default router;
