import dotenv from "dotenv";
import express from "express";

dotenv.config();

import { EnglishDB } from "./services/connect-mult-mogoose.js";

import cors from "cors";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const helmet = require("helmet");
import AccountRouter from "./routers/Account.js";
import WritingRouter from "./routers/Writing.js";
import StoryRouter from "./routers/Story.js";
import CommentRouter from "./routers/Comment.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://english-writing-fruit-v1.vercel.app",
      "https://english-writing-fruit-v1.vercel.app/",
    ],
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());

app.use("/api/account", AccountRouter);
app.use("/api/writing", WritingRouter);
app.use("/api/story", StoryRouter);
app.use("/api/comment", CommentRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
