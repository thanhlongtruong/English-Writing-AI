import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { type Request, type Response } from "express";

import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { funcCatchError } from "../services/catchError.js";

import Story from "../models/Story.js";
import Comment from "../models/Comment.js";

import openai from "../services/init-open-ai.js";

export const StoryController = {
  generate: async (req: Request, res: Response) => {
    try {
      const accessTokenDecoded = req.jwtDecoded;

      const _id = accessTokenDecoded._id;

      const { title, content_vi, content_en, topic } = req.body;

      const checkContentUser = await openai.moderations.create({
        model: "omni-moderation-latest",
        input: title,
      });

      if (checkContentUser?.results[0]?.flagged) {
        return res.status(400).json({
          message_vi: "Bài viết chứa nội dung không hợp lệ.",
          message_en: "The story contains invalid content.",
        });
      }

      const title_check = z.object({
        feedback_vi: z.string(),
        feedback_en: z.string(),
        state: z.boolean(),
      });

      let checkTitleAndContentUser: any;

      if (
        (topic === "Question" || topic === "Câu hỏi") &&
        title.trim() !== ""
      ) {
        checkTitleAndContentUser = await openai.responses.parse({
          model: "gpt-4o-mini",
          input: [
            {
              role: "system",
              content: `You are an AI assistant and follow the user's request.
                
                Give short feedback in both English and Vietnamese. State is true or false based on whether the user request is valid or not.`,
            },
            {
              role: "user",
              content: `Task - Content check:
                  - No insults, superstitions, racism, reactionary calls, obscenities, or swearing, 18+.
                  - Reject if it is just repeated letters, symbols, numbers, or nonsense strings.
                  Content: "${title}"`,
            },
          ],
          text: {
            format: zodTextFormat(title_check, "title_check"),
          },
        });
      } else if (topic === "Writing") {
        checkTitleAndContentUser = await openai.responses.parse({
          model: "gpt-4o-mini",
          input: [
            {
              role: "system",
              content: `You are an AI assistant and follow the user's request.
                
                Give short feedback in both English and Vietnamese. State is true or false based on whether the user request is valid or not.`,
            },
            {
              role: "user",
              content:
                title && title.trim() !== ""
                  ? `Task 1 - Title check:
                  - Must be meaningful in either English or Vietnamese.
                  - No insults, superstitions, racism, reactionary calls, obscenities, or swearing, 18+.
                  - Reject if it is just repeated letters, symbols, numbers, or nonsense strings.
                  Title: "${title}"`
                  : "",
            },
            {
              role: "user",
              content: content_en
                ? `Task 2 - English check:
                - Must be fully in English.
                - No insults, superstitions, racism, reactionary calls, obscenities, or swearing, 18+
                - Reject if written in any other language or nonsense.
                content_en: "${content_en}"`
                : "",
            },
            {
              role: "user",
              content: content_vi
                ? `Task 3 - Translation match:
                    - content_en must be translated into English according to content_vi. content_en may differ in wording but the meaning must be similar to content_vi.
                    content_vi: "${content_vi}"`
                : "",
            },
          ],
          text: {
            format: zodTextFormat(title_check, "title_check"),
          },
        });
      }

      console.log(checkTitleAndContentUser);

      if (checkTitleAndContentUser?.output_parsed?.state) {
        const story = new Story({
          topic,
          title: title || "",
          content_vi: content_vi || "",
          content_en: content_en || "",
          accountId: _id,
        });

        await story.save();

        return res.status(200).json({
          message_vi: "Bài viết đã được tạo thành công.",
          message_en: "The story has been created successfully.",
        });
      } else {
        return res.status(400).json({
          message_vi: checkTitleAndContentUser?.output_parsed?.feedback_vi,
          message_en: checkTitleAndContentUser?.output_parsed?.feedback_en,
        });
      }
    } catch (error) {
      return funcCatchError({
        error: error as Error,
        res: res,
        status: 500,
        message_vi: "Lỗi khi tạo bài viết.",
        message_en: "Error when creating story.",
      });
    }
  },
  get: async (req: Request, res: Response) => {
    try {
      const stories = await Story.find()
        .populate("accountId", "name")
        .sort({ createdAt: -1 });
      return res.status(200).json(stories);
    } catch (error) {
      return funcCatchError({
        error: error as Error,
        res: res,
        status: 500,
        message_vi: "Lỗi khi lấy bài viết.",
        message_en: "Error when getting story.",
      });
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const accessTokenDecoded = req.jwtDecoded;
      const _id = accessTokenDecoded._id;

      const { storyId } = req.body;

      const story = await Story.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(storyId),
        accountId: _id,
      });

      if (!story) {
        return res.status(400).json({
          message_vi: "Bài viết không tồn tại.",
          message_en: "The story does not exist.",
        });
      }

      await Comment.deleteMany({ storyId: storyId });

      return res.status(200).json({
        message_vi: "Bài viết đã được gỡ thành công.",
        message_en: "The story has been deleted successfully.",
      });
    } catch (error) {
      return funcCatchError({
        error: error as Error,
        res: res,
        status: 500,
        message_vi: "Lỗi khi gỡ bài viết.",
        message_en: "Error when deleting story.",
      });
    }
  },
  edit: async (req: Request, res: Response) => {
    try {
      const accessTokenDecoded = req.jwtDecoded;
      const _id = accessTokenDecoded._id;

      const { storyId, title } = req.body;

      const story_check = await Story.findOne({
        _id: new mongoose.Types.ObjectId(storyId),
        accountId: _id,
      });

      if (!story_check) {
        return res.status(404).json({
          message_vi: "Bài viết không tồn tại.",
          message_en: "The story does not exist.",
        });
      }

      if (story_check?.title?.trim() === title?.trim()) {
        return res.status(200).json({
          message_vi: "Bài viết đã được chỉnh sửa thành công.",
          message_en: "The story has been edited successfully.",
        });
      }

      if (title?.trim() !== "") {
        const checkContentUser = await openai.moderations.create({
          model: "omni-moderation-latest",
          input: title,
        });

        if (checkContentUser?.results[0]?.flagged) {
          return res.status(400).json({
            message_vi: "Tiêu đề bài viết không hợp lệ.",
            message_en: "The title of the story is not valid.",
          });
        }

        const content_check = z.object({
          feedback_vi: z.string(),
          feedback_en: z.string(),
          state: z.boolean(),
        });
        const checkContentByAI = await openai.responses.parse({
          model: "gpt-4o-mini",
          input: [
            {
              role: "system",
              content:
                "You are the one who reviews the content that users provide. Check if this content fits the community criteria or makes sense. The state is false and the feedback (English & Vietnamese) is the reason why it is not valid.",
            },
            {
              role: "user",
              content: title,
            },
          ],
          text: {
            format: zodTextFormat(content_check, "content_check"),
          },
        });

        if (!checkContentByAI?.output_parsed?.state) {
          return res.status(400).json({
            message_vi: checkContentByAI?.output_parsed?.feedback_vi,
            message_en: checkContentByAI?.output_parsed?.feedback_en,
          });
        }
      }

      const story = await Story.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(storyId), accountId: _id },
        { title },
        { new: true }
      );

      return res.status(200).json({
        message_vi: "Bài viết đã được chỉnh sửa thành công.",
        message_en: "The story has been edited successfully.",
      });
    } catch (error) {
      return funcCatchError({
        error: error as Error,
        res: res,
        status: 500,
        message_vi: "Lỗi khi chỉnh sửa bài viết.",
        message_en: "Error when editing story.",
      });
    }
  },
};
