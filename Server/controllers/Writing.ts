import dotenv from "dotenv";
dotenv.config();

import { type Request, type Response } from "express";

import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { funcCatchError } from "../services/catchError.js";
import GenerateWriting from "../models/GenerateWriting.js";
import openai from "../services/init-open-ai.js";

export const WritingController = {
  generate: async (req: Request, res: Response) => {
    try {
      const accessTokenDecoded = req.jwtDecoded;

      const _id = accessTokenDecoded._id;

      const checkGenerateWriting = await GenerateWriting.findOne({
        idAccount: _id,
      });
      if (checkGenerateWriting) {
        return res.status(200).json({
          message_vi:
            "Bạn phải hoàn thành bài viết bên dưới trước khi tạo bài viết mới bằng AI.",
          message_en:
            "You must complete the writing below before creating a new writing by AI.",
          data: {
            content: checkGenerateWriting.content,
            suggest: checkGenerateWriting.suggest,
          },
        });
      } else {
        const { topic, level, number } = req.body;

        if (!topic || !level || !number) {
          return res.status(400).json({ message: "Thiếu dữ liệu yêu cầu." });
        }

        const Writing = z.object({
          content: z.string(),
          suggest: z.object({
            vocabulary: z.array(z.string()),
            phrases: z.array(z.string()),
          }),
        });

        const response = await openai.responses.parse({
          model: "gpt-4o-mini",
          input: [
            {
              role: "system",
              content:
                "You are an English teacher helping students practice writing English. As requested by the user for a paragraph in Vietnamese and related vocabulary(English + type word + Vietnamese) and phrases(Vietnamese + English) in the article.",
            },
            {
              role: "user",
              content: `
                      Topic: ${topic}
                      Level: ${level}
                      Number of sentences: ${number}
            `,
            },
          ],
          text: {
            format: zodTextFormat(Writing, "writing"),
          },
        });

        const generateWriting = new GenerateWriting({
          content: response.output_parsed?.content,
          idAccount: _id,
          suggest: response.output_parsed?.suggest,
        });
        await generateWriting.save();

        return res.status(200).json({
          message_vi: "Bài viết đã được tạo thành công.",
          message_en: "The writing has been created successfully.",
          data: response.output_parsed,
        });
      }
    } catch (error) {
      return funcCatchError({
        error: error as Error,
        res: res,
        status: 500,
        message_vi: "Lỗi khi tạo bài viết.",
        message_en: "Error when creating writing.",
      });
    }
  },
  evaluate: async (req: Request, res: Response) => {
    try {
      const accessTokenDecoded = req.jwtDecoded;

      const _id = accessTokenDecoded._id;

      const { content_user, content_original } = req.body;

      if (!content_user) {
        return res.status(400).json({ message: "Thiếu dữ liệu yêu cầu." });
      }

      const checkContentUser = await openai.moderations.create({
        model: "omni-moderation-latest",
        input: content_user,
      });

      if (checkContentUser?.results[0]?.flagged) {
        return res.status(400).json({
          message_vi: "Bài viết không hợp lệ.",
          message_en: "The writing is not valid.",
        });
      }

      const Feedback = z.object({
        feedback_vi: z.string(),
        feedback_en: z.string(),
        improve_vi: z.array(z.string()),
        improve_en: z.array(z.string()),
        score: z.number(),
      });

      const response = await openai.responses.parse({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: `{You are an English teacher. ${
              content_original
                ? `Based on the English essay and the original Vietnamese essay that the user provided to you, please evaluate the essay based on the original essay according to the criteria: Meaning, Vocabulary, Grammar, Spelling. And give comments, encouragement to the user and at least 3 improvements to the essay.`
                : "You are an English teacher. Based on the English essay that the user provided to you, please evaluate the essay based on the original essay according to the criteria: Meaning, Vocabulary, Grammar, Spelling. And give comments, encouragement to the user and at least 3 improvements to the essay."
            }(the improvements and comments must be in both English and Vietnamese). If the user provides a non-English article and the meaning of the article is not appropriate, the score will be 0 and the user will be gently reminded.}`,
          },
          {
            role: "user",
            content: `
                      ${
                        content_original &&
                        `Original text (Vietnamese): ${content_original}`
                      }
                      English assignment: ${content_user}
                    `,
          },
        ],
        text: {
          format: zodTextFormat(Feedback, "feedback"),
        },
      });

      const feedback = response?.output_parsed;

      if (feedback && parseInt(feedback?.score.toString()) > 5) {
        await GenerateWriting.findOneAndDelete({
          idAccount: _id,
        });
      }

      return res.status(200).json({
        message_vi: `Bài viết đã được đánh giá thành công. ${
          feedback && parseInt(feedback?.score.toString()) > 5
            ? "Bạn có thể tạo bài viết mới bằng AI để cải thiện kỹ năng viết của bạn nhé."
            : "Hãy thử làm lại để cải thiện kỹ năng viết nhé."
        }`,
        message_en: `The writing has been evaluated successfully. ${
          feedback && parseInt(feedback?.score.toString()) > 5
            ? "You can create a new writing by AI to improve your writing skills."
            : "Try again to improve your writing skills."
        }`,
        data: {
          feedback_vi: feedback?.feedback_vi,
          feedback_en: feedback?.feedback_en,
          improve_vi: feedback?.improve_vi,
          improve_en: feedback?.improve_en,
          score: feedback?.score,
        },
      });
    } catch (error) {
      return funcCatchError({
        error: error as Error,
        res: res,
        status: 500,
        message_vi: "Lỗi khi đánh giá bài viết.",
        message_en: "Error when evaluating writing.",
      });
    }
  },
};
