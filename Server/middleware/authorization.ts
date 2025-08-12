import dotenv from "dotenv";
dotenv.config();
import { type Request, type Response, type NextFunction } from "express";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      jwtDecoded?: any;
    }
  }
}
import { verifyToken } from "../services/JWT.js";

const authorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessTokenFrHeader = req.headers["authorization"];

  if (!accessTokenFrHeader || !accessTokenFrHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "authorization" });
  }

  try {
    const token = accessTokenFrHeader.substring(7);
    const accessTokenDecoded = await verifyToken({
      token,
      secretSignature: process.env.JWT_SECRET,
    });

    req.jwtDecoded = accessTokenDecoded;

    next();
  } catch (error: any) {
    if (
      error.message?.includes("jwt expired") ||
      error.message?.includes("TokenExpiredError")
    ) {
      return res.status(400).json({
        error: {
          name: error.name,
          message: error.message || "",
          stack: error.stack,
        },
      });
    }

    return res.status(401).json({ message: "TokenInvalid" });
  }
};

export default authorization;
