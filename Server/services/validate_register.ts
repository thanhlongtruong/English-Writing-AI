import { validationResult, body } from "express-validator";
import { type Request } from "express";

const validate = () => {
  const validations = [
    body("name")
      .trim()
      .matches(/^[a-zA-ZÀ-ỹ\s]+$/u)
      .isLength({ min: 2, max: 30 })
      .withMessage("Họ tên phải từ 2 đến 30 kí tự."),
  ];

  validations.push(
    body("email")
      .trim()
      .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)
      .withMessage("Định dạng email không hợp lệ.")
      .custom((value) => {
        const domain = value.split("@")[1];
        if (domain !== "gmail.com") {
          throw new Error("Định dạng email không hợp lệ.");
        }
        return true;
      })
  );
  validations.push(
    body("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Mật khẩu phải ít nhất 8 kí tự.")
  );

  return validations;
};

const arrayError = (req: Request) => {
  const errors = validationResult(req);
  return errors;
};

export { validate, arrayError };
