import { type Response } from "express";

export const funcCatchError = ({
  error,
  res,
  status,
  message_vi,
  message_en,
}: {
  error: any;
  res: Response;
  status: number;
  message_vi: string;
  message_en: string;
}) => {
  return res.status(status).json({
    message_vi: message_vi,
    message_en: message_en,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });
};
