import express from "express";
import authorization from "../middleware/authorization.js";
import { StoryController } from "../controllers/Story.js";

const router = express.Router();

router.post("/generate", authorization, StoryController.generate);
router.get("/get", StoryController.get);
router.post("/delete", authorization, StoryController.delete);
router.post("/edit", authorization, StoryController.edit);

export default router;
