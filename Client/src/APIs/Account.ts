import axios from "../Auth/Axios_Inceptor";

export interface LoginData {
  email: string;
  password: string;
}
export const Login = async (data: LoginData) => {
  return await axios.post("/account/login", {
    email: data.email,
    password: data.password,
  });
};

export const Get = async () => {
  return await axios.get("/account/get");
};

export interface RegisterData {
  name: string;
  password: string;
  passwordConfirm: string;
  email: string;
  verificationCode: string | number;
}

export const Register = async (data: RegisterData) => {
  return await axios.post("/account/register", {
    name: data.name,
    password: data.password,
    passwordConfirm: data.passwordConfirm,
    email: data.email,
    code_verification_email: Number(data.verificationCode),
  });
};

export const SendVerificationCodeEmail = async (email: string) => {
  return await axios.post("/account/send-verification-code-email", { email });
};
