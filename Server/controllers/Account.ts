import dotenv from "dotenv";
dotenv.config();

import { funcCatchError } from "../services/catchError.js";
import Account from "../models/Account.js";
import { type Request, type Response } from "express";
import { signToken } from "../services/JWT.js";
import { comparePass, hashPass } from "../services/hash_pass.js";
import { arrayError } from "../services/validate_register.js";
import EmailVerification from "../models/EmailVerification.js";
import transporter from "../services/verifyEmail.js";

export const AccountController = {
  register: async (req: Request, res: Response) => {
    try {
      if (!arrayError(req as Request).isEmpty()) {
        return res.status(400).json(arrayError(req as Request).array());
      }

      const { name, email, password, code_verification_email } = req.body;

      const checkExistedEmail = await Account.findOne({ email: email });

      if (checkExistedEmail) {
        return res.status(409).json({
          message_vi: "Email này đã được đăng kí.",
          message_en: "This email has already been registered.",
          type: "email",
        });
      }

      const checkVerificationEmail = await EmailVerification.findOne({
        email,
      });
      if (
        !checkVerificationEmail ||
        checkVerificationEmail?.code !== code_verification_email
      ) {
        return res.status(400).json({
          type: "code",
          message_vi: "Mã không chính xác hoặc đã hết hạn",
          message_en: "The code is incorrect or has expired",
        });
      }

      const hashPassword = await hashPass(password as string);

      const user = await Account.create({
        name,
        email,
        password: hashPassword,
      });

      if (!user) {
        return res.status(400).json({
          message_vi: "Tạo tài khoản không thành công.",
          message_en: "Create account failed.",
        });
      }

      await EmailVerification.deleteOne({ email });

      return res.status(200).json({
        message_vi: "Đăng kí tài khoản thành công.",
        message_en: "Register account successfully.",
      });
    } catch (error) {
      return funcCatchError({
        res: res,
        status: 500,
        error: error as Error,
        message_vi: "Lỗi khi đăng kí tài khoản.",
        message_en: "Error when registering account.",
      });
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await Account.findOne({ email: email });
      if (!user) {
        return res.status(404).json({
          message_vi: "Email chưa được đăng kí.",
          message_en: "Email has not been registered.",
        });
      }
      const checkPass = await comparePass(password, user.password);

      if (!checkPass) {
        return res.status(400).json({
          message_vi: "Mật khẩu không chính xác",
          message_en: "Password is incorrect",
        });
      }
      const payload = { _id: user._id };

      const userRes = {
        name: user.name,
        email: user.email,
      };

      const accessToken = await signToken({
        payload,
        secretSignature: process.env.JWT_SECRET,
        exp: "2d",
      });
      return res.status(200).json({
        accessToken,
        user: userRes,
        message_vi: "Đăng nhập thành công.",
        message_en: "Login successfully.",
      });
    } catch (e) {
      return funcCatchError({
        error: e as Error,
        res: res,
        status: 500,
        message_vi: "Lỗi khi đăng nhập.",
        message_en: "Error when logging in.",
      });
    }
  },
  getAccount: async (req: Request, res: Response) => {
    try {
      const accessTokenDecoded = req.jwtDecoded;

      const _id = accessTokenDecoded._id;

      const user = await Account.findById(_id);
      if (!user) {
        return res.status(404).json({
          message_vi: "Tài khoản không tồn tại.",
          message_en: "Account not found.",
        });
      }
      const resUser = {
        name: user.name,
        _id: user._id,
      };

      return res.status(200).json({
        user: resUser,
        message_vi: "Đăng nhập thành công.",
        message_en: "Login successfully.",
      });
    } catch (error) {
      return funcCatchError({
        error: error as Error,
        res: res,
        status: 500,
        message_vi: "Lỗi khi đăng nhập.",
        message_en: "Error when logging in.",
      });
    }
  },
  sendVerificationCodeEmail: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

      if (!email || !emailPattern.test(email) || email.endsWith("@gmail.co")) {
        return res.status(400).json({
          message: "Email không hợp lệ",
        });
      }

      const existedEmail = await EmailVerification.findOne({ email });
      if (existedEmail) {
        return res.status(400).json({
          message:
            "Đã gửi mã xác nhận tới email của bạn. Vui lòng kiểm tra email",
        });
      }
      const code = Math.floor(100000 + Math.random() * 900000);
      const mailOption = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Xác minh email",
        html: `<p>Mã xác minh email của bạn là: ${code}. Mã này có tác dụng trong 5 phút</p>`,
      };
      const emailVerification = new EmailVerification({
        code,
        email,
      });
      await emailVerification.save().then(() => {
        transporter.sendMail(mailOption, (error: any, info: any) => {
          if (error) {
            return res.status(500).json({
              message_vi: "Lỗi khi gửi mã xác nhận",
              message_en: "Error sending verification code",
              error: {
                name: error.name,
                message: error.message || "Lỗi khi gửi mã xác nhận",
                stack: error.stack,
              },
            });
          }
          return res.status(200).json({
            message_vi: "Đã gửi mã xác nhận. Vui lòng kiểm tra email",
            message_en:
              "Verification code has been sent. Please check your email",
            info,
          });
        });
      });
    } catch (error) {
      return funcCatchError({
        error: error as Error,
        res: res,
        status: 500,
        message_vi: "Lỗi khi gửi mã xác nhận email.",
        message_en: "Error sending verification code email.",
      });
    }
  },
};
