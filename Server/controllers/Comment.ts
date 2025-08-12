import { type Request, type Response } from "express";

import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { funcCatchError } from "../services/catchError.js";
import Comment from "../models/Comment.js";
import Account from "../models/Account.js";
import transporter from "../services/verifyEmail.js";
import openai from "../services/init-open-ai.js";

export const CommentController = {
  post: async (req: Request, res: Response) => {
    try {
      const accessTokenDecoded = req.jwtDecoded;

      const _id = accessTokenDecoded._id;

      const { storyId, content, story_accountId } = req.body;

      const checkContentUser = await openai.moderations.create({
        model: "omni-moderation-latest",
        input: content,
      });

      if (checkContentUser?.results[0]?.flagged) {
        return res.status(400).json({
          message_vi: "Bình luận không hợp lệ.",
          message_en: "The comment is not valid.",
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
            content: content,
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

      const comment = await Comment.create({
        storyId: storyId,
        accountId: _id,
        content: content,
      });

      if (story_accountId && story_accountId !== _id) {
        const account = await Account.findById(story_accountId);
        const mailOption = {
          from: process.env.AUTH_EMAIL,
          to: account?.email,
          subject: "Bạn có một bình luận mới",
          html: `<p>Bài viết của bạn tại website <a href="${process.env.CLIENT_URL}?lang=vi&type=story">English</a> có một bình luận mới. Click vào link để xem bình luận: <a href="${process.env.CLIENT_URL}?lang=vi&type=story&storyId=${storyId}">Xem bình luận</a></p>`,
        };
        transporter.sendMail(mailOption, (error: any, info: any) => {
          if (error) {
            return res.status(500).json({
              message: "Lỗi khi gửi email",
              error: {
                name: error.name,
                message: error.message || "Lỗi khi gửi email",
                stack: error.stack,
              },
            });
          }
          return res.status(200).json({
            message: "Đã gửi email. Vui lòng kiểm tra email",
            info,
          });
        });
      }

      return res.status(200).json({
        message_vi: "Bình luận thành công.",
        message_en: "Comment successfully.",
        data: comment,
      });
    } catch (error) {
      return funcCatchError({
        error: error,
        res: res,
        status: 500,
        message_vi: "Lỗi khi đăng bình luận.",
        message_en: "Error when posting comment.",
      });
    }
  },
  get: async (req: Request, res: Response) => {
    try {
      const { storyId } = req.body;
      const comments = await Comment.find({ storyId: storyId })
        .populate("accountId", "name")
        .sort({
          createdAt: -1,
        });
      return res.status(200).json({
        message_vi: "Lấy bình luận của bài viết thành công.",
        message_en: "Get comment of story successfully.",
        data: comments,
      });
    } catch (error) {
      return funcCatchError({
        error: error,
        res: res,
        status: 500,
        message_vi: "Lỗi khi lấy bình luận của bài viết.",
        message_en: "Error when getting comment of story.",
      });
    }
  },
};
