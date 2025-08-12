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

      if ((topic === "Question" || topic === "Câu hỏi") && title !== "") {
        checkTitleAndContentUser = await openai.responses.parse({
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
            format: zodTextFormat(title_check, "title_check"),
          },
        });
      } else if (topic === "Writing") {
        checkTitleAndContentUser = await openai.responses.parse({
          model: "gpt-4o-mini",
          input: [
            {
              role: "system",
              content:
                "You are a content checker and No need to compare title with content. The state is false and the feedback (English & Vietnamese) is the reason why it is not valid.",
            },
            {
              role: "user",
              content: `${
                title &&
                `- Check if it fits community criteria or makes sense.: title: ${title}.;`
              } ${
                content_vi &&
                `- No need to compare title with content.${content_vi};`
              } ${
                !content_vi &&
                content_en &&
                `- No need to compare title with content.Check if it makes sense? or is it insulting or offensive or harmful to the community? and may confuse others about the content of the article and is written in English: content_en: ${content_en};`
              } ${
                content_vi &&
                content_en &&
                `- No need to compare title with content.Check if the meaning of content_en is similar to content_vi and is written in English: content_en: ${content_en}.`
              } ${
                title &&
                `- And the title does not necessarily match the content, it is just a title.`
              }`,
            },
          ],
          text: {
            format: zodTextFormat(title_check, "title_check"),
          },
        });
      }
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
