import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const signToken = ({ payload, secretSignature, exp }) => {
  try {
    return jwt.sign(payload, secretSignature, {
      expiresIn: exp,
    });
  } catch (error) {
    throw new Error(error);
  }
};

const verifyToken = ({ token, secretSignature }) => {
  try {
    return jwt.verify(token, secretSignature);
  } catch (error) {
    throw new Error(error);
  }
};

export { signToken, verifyToken };
