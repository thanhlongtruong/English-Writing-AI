import express from "express";
import authorization from "../middleware/authorization.js";
import { CommentController } from "../controllers/Comment.js";

const router = express.Router();

router.post("/post", authorization, CommentController.post);
router.post("/get", CommentController.get);

export default router;
