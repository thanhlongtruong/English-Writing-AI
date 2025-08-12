import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { CONTEXT } from "../context/context";
import {
  Get,
  Login,
  Register,
  SendVerificationCodeEmail,
  type LoginData,
  type RegisterData,
} from "../APIs/Account";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Bouncy, Squircle } from "ldrs/react";
import "ldrs/react/Bouncy.css";
import "ldrs/react/Squircle.css";
import { useChangeLanguage } from "../services/change_langue";
import { useNavigate } from "react-router";

export default function LoginPage({ stateLogin }: { stateLogin: boolean }) {
  const navigate = useNavigate();

  const { lang, showNotification } = useContext(CONTEXT);

  const handleChangeLanguage = useChangeLanguage();

  const clickChangeLanguage = (paramLang: string) => {
    handleChangeLanguage(paramLang);
  };

  const [isStateLogin, setStateLogin] = useState<boolean>(stateLogin);
  const [showMessageVerificationCode, setShowMessageVerificationCode] =
    useState<string>("");

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    reset: resetLogin,
    setError: setErrorLogin,
    formState: { errors: errorsLogin },
  } = useForm<LoginData>();

  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    reset: resetRegister,
    setError: setErrorRegister,
    watch: watchRegister,
    formState: { errors: errorsRegister },
  } = useForm<RegisterData>();

  interface LoginError {
    status: number;
    message_vi: string;
    message_en: string;
  }
  interface RegisterError {
    type: string;
    message_vi: string;
    message_en: string;
  }
  interface AuthEmailError {
    message_vi: string;
    message_en: string;
  }

  const mutationLogin = useMutation({
    mutationFn: Login,
    onSuccess: (response) => {
      const { accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      navigate("/");
    },
    onError: (error: AxiosError<LoginError>) => {
      if (!error.response) {
        showNotification("Server không phản hồi.", "Error");
      } else {
        if (error.response.status === 404) {
          setErrorLogin("email", {
            message:
              lang !== "vi"
                ? error.response?.data?.message_en
                : error.response?.data?.message_vi,
          });
        }
        if (error.response.status === 400) {
          setErrorLogin("password", {
            message:
              lang !== "vi"
                ? error.response?.data?.message_en
                : error.response?.data?.message_vi,
          });
        }
        if (error.response.status === 500) {
          showNotification(
            lang !== "vi"
              ? error.response?.data?.message_en
              : error.response?.data?.message_vi,
            "Error"
          );
        }
      }
    },
  });

  const mutationGet = useMutation({
    mutationFn: Get,
    mutationKey: ["user"],
    onSuccess: (response) => {
      localStorage.setItem("user", JSON.stringify(response.data));
      showNotification(
        lang !== "vi" ? response?.data?.message_en : response?.data?.message_vi,
        "Success"
      );
    },
    onError: (error: AxiosError<LoginError>) => {
      if (!error.response) {
        showNotification("Server không phản hồi.", "Error");
      } else {
        showNotification(
          lang !== "vi"
            ? error.response?.data?.message_en
            : error.response?.data?.message_vi,
          "Error"
        );
      }
    },
  });

  const submitLogin: SubmitHandler<LoginData> = async (data) => {
    const response = await mutationLogin.mutateAsync(data);
    if (response.status === 200) {
      mutationGet.mutate();
    } else {
      localStorage.removeItem("accessToken");
    }
  };

  const mutationRegister = useMutation({
    mutationFn: Register,
    onSuccess: (response) => {
      resetRegister();
      setStateLogin(true);
      navigate(`/login?lang=${lang}`);
      showNotification(
        lang !== "vi" ? response?.data?.message_en : response?.data?.message_vi,
        "Success"
      );
    },
    onError: (error: AxiosError<RegisterError>) => {
      if (!error.response) {
        showNotification("Server không phản hồi.", "Error");
      } else {
        if (error.response.data?.type === "code") {
          setErrorRegister("verificationCode", {
            message:
              lang !== "vi"
                ? error.response?.data?.message_en
                : error.response?.data?.message_vi,
          });
        } else if (error?.response?.data?.type === "email") {
          setErrorRegister("email", {
            message:
              lang !== "vi"
                ? error.response?.data?.message_en
                : error.response?.data?.message_vi,
          });
        } else {
          showNotification(
            lang !== "vi"
              ? error.response?.data?.message_en
              : error.response?.data?.message_vi,
            "Error"
          );
        }
      }
    },
  });

  const submitRegister: SubmitHandler<RegisterData> = (data) =>
    mutationRegister.mutate(data);

  const mutationSendVerificationCodeEmail = useMutation({
    mutationFn: SendVerificationCodeEmail,
    onSuccess: (response) => {
      setShowMessageVerificationCode(
        lang !== "vi" ? response.data.message_en : response.data.message_vi
      );
    },
    onError: (error: AxiosError<AuthEmailError>) => {
      if (!error.response) {
        showNotification("Server không phản hồi.", "Error");
      } else {
        setShowMessageVerificationCode(
          lang !== "vi"
            ? error.response?.data?.message_en || ""
            : error.response?.data?.message_vi || ""
        );
      }
    },
  });

  const handleSendVerificationCode = async () => {
    const email = watchRegister("email");
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!email) {
      setErrorRegister("email", {
        message: lang !== "vi" ? "Please enter email" : "Vui lòng nhập email",
      });
      return;
    }

    if (!emailPattern.test(email)) {
      setErrorRegister("email", {
        message: lang !== "vi" ? "Invalid email" : "Email không hợp lệ",
      });
      return;
    }

    if (!email.includes("@gmail.com")) {
      setErrorRegister("email", {
        message: lang !== "vi" ? "e.g. @gmail.com" : "Ví dụ: fruit@gmail.com",
      });
      return;
    }
    mutationSendVerificationCodeEmail.mutate(email);
  };

  const handleSwapClasses = (type: string) => {
    if (type === "Log") {
      resetRegister();
      setStateLogin(true);
      navigate(`/login?lang=${lang}`);
      return;
    } else if (type === "Res") {
      resetLogin();
      setStateLogin(false);
      navigate(`/register?lang=${lang}`);
      return;
    }
  };

  return (
    <div className="p-4 w-full h-screen overflow-hidden text-zinc-950 bg-zinc-50 flex md:flex-row gap-x-3">
      <div className="hidden md:block md:w-1/2 mt-3">
        <div className="w-full h-full flex flex-col items-start justify-start">
          <p className="text-2xl font-bold font-mono mb-4">
            {lang !== "vi"
              ? "Are you looking for a place to practice Writing?"
              : "Bạn đang tìm kiếm một nơi luyện Writing?"}
          </p>
          <p className="text-slate-700 font-mono text-lg">
            {lang !== "vi"
              ? "Don't worry, this is for you. The website is integrated with AI to create diverse content and evaluate your work for free. In addition, you can participate in posting and asking questions to help others learn together. Please log in to the website to practice Writing every day."
              : "Đừng lo, nơi đây giành cho bạn. Website được tích hợp AI tạo nội dung đa dạng và đánh giá bài làm của bạn hoàn toàn miễn phí. Ngoài ra, bạn có thể tham gia đăng bài, hỏi đáp cùng những người khác nữa nhé. Hãy đăng nhập vào website để có thể luyện Writing mỗi ngày nhé."}
          </p>
        </div>
      </div>
      <div className="w-full h-full md:w-1/2 overflow-y-auto">
        <div className="w-full gap-y-10 h-full flex flex-col items-start">
          <div className="flex items-center w-full text-2xl font-medium h-14 text-slate-700">
            <div className={"Typewriter"}>
              <p>{`${
                isStateLogin
                  ? lang !== "vi"
                    ? "Login"
                    : "Đăng nhập"
                  : lang !== "vi"
                  ? "Register"
                  : "Đăng kí"
              }`}</p>
            </div>
          </div>

          <form
            className=" lg:w-2/3 w-full"
            onSubmit={
              isStateLogin
                ? handleSubmitLogin(submitLogin)
                : handleSubmitRegister(submitRegister)
            }>
            {isStateLogin ? (
              <>
                <div className="w-full mb-6 inputBox">
                  <input
                    className={`${
                      errorsLogin.email ? "inputTagBug" : "inputTag"
                    }`}
                    type="text"
                    required
                    autoFocus
                    {...registerLogin("email", {
                      required: "Email",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message:
                          lang !== "vi"
                            ? "Invalid email"
                            : "Email không hợp lệ",
                      },
                      validate: {
                        completeDomain: (value) => {
                          if (!value.includes("@gmail.com")) {
                            return lang !== "vi"
                              ? "e.g. @gmail.com"
                              : "Ví dụ: fruit@gmail.com";
                          }
                          return true;
                        },
                      },
                    })}
                  />
                  <span>
                    {errorsLogin.email ? errorsLogin.email.message : "Email"}
                  </span>
                </div>

                <div className="w-full mb-6 inputBox">
                  <input
                    className={`${
                      errorsLogin.password ? "inputTagBug" : "inputTag"
                    }`}
                    type="password"
                    required
                    {...registerLogin("password", {
                      required: lang !== "vi" ? "Password" : "Mật khẩu",
                      minLength: {
                        value: 8,
                        message:
                          lang !== "vi"
                            ? "Password has at least 8 characters"
                            : "Mật khẩu có ít nhất 8 ký tự",
                      },
                    })}
                  />
                  <span className={`spanTag`}>
                    {errorsLogin.password
                      ? errorsLogin.password.message
                      : lang !== "vi"
                      ? "Password"
                      : "Mật khẩu"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className={`flex justify-between flex-col`}>
                  <div className={`mb-6 inputBox w-full`}>
                    <input
                      className={`${
                        errorsRegister.name ? "inputTagBug" : "inputTag"
                      }`}
                      type="text"
                      required
                      {...registerRegister("name", {
                        required: lang !== "vi" ? "Name" : "Họ tên",
                        minLength: {
                          value: 2,
                          message:
                            lang !== "vi"
                              ? "At least 2 characters"
                              : "Ít nhất 2 kí tự",
                        },
                        maxLength: {
                          value: 20,
                          message:
                            lang !== "vi"
                              ? "At most 20 characters"
                              : "Nhiều nhất 20 kí tự",
                        },
                        pattern: {
                          value: /^[a-zA-ZÀ-ỹà-ỹ\s]+$/,
                          message:
                            lang !== "vi" ? "Enter only letters" : "Nhập chữ",
                        },
                      })}
                    />
                    <span className={`spanTag`}>
                      {errorsRegister.name
                        ? errorsRegister.name.message
                        : lang !== "vi"
                        ? "Name"
                        : "Họ tên"}
                    </span>
                  </div>
                </div>

                <div className={`w-full mb-6 inputBox`}>
                  <input
                    className={`${
                      errorsRegister.email ? "inputTagBug" : "inputTag"
                    }`}
                    type="text"
                    required
                    {...registerRegister("email", {
                      required: "Email",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message:
                          lang !== "vi"
                            ? "Invalid email"
                            : "Email không hợp lệ",
                      },
                      validate: {
                        completeDomain: (value) => {
                          if (value.endsWith("@gmail.co")) {
                            return lang !== "vi"
                              ? "e.g. @gmail.com"
                              : "Ví dụ: fruit@gmail.com";
                          }
                          return true;
                        },
                      },
                    })}
                  />
                  <span className={`spanTag`}>
                    {errorsRegister.email
                      ? errorsRegister.email.message
                      : "Email"}
                  </span>
                </div>

                <div
                  className={`flex justify-between items-start mb-6 flex-col`}>
                  <div className={`w-full inputBox`}>
                    <input
                      className={`${
                        errorsRegister.verificationCode
                          ? "inputTagBug"
                          : "inputTag"
                      }`}
                      type="number"
                      required
                      {...registerRegister("verificationCode", {
                        required:
                          lang !== "vi" ? "Verification code" : "mã xác minh",
                        minLength: {
                          value: 6,
                          message:
                            lang !== "vi"
                              ? "Verification code has 6 characters"
                              : "Mã xác minh có 6 ký tự",
                        },
                        maxLength: {
                          value: 6,
                          message:
                            lang !== "vi"
                              ? "Verification code has 6 characters"
                              : "Mã xác minh có 6 ký tự",
                        },
                      })}
                    />
                    <span>
                      {errorsRegister.verificationCode
                        ? errorsRegister.verificationCode.message
                        : lang !== "vi"
                        ? "Verification code email"
                        : "Mã xác minh email"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (mutationSendVerificationCodeEmail.isPending) {
                        return;
                      }
                      handleSendVerificationCode();
                    }}
                    className="cursor-pointer w-fit p-1 border-teal-400 hover:border-teal-500 hover:text-teal-500 font-medium font-mono flex items-center gap-2">
                    {lang !== "vi" ? "Send code to email" : "Gửi mã tới email"}
                    {mutationSendVerificationCodeEmail.isPending && (
                      <Squircle
                        size="20"
                        stroke="4"
                        stroke-length="0.15"
                        bg-opacity="0.2"
                        speed="0.9"
                        color="#14b8a6"
                      />
                    )}
                  </button>
                  <p
                    className={`text-xs ${
                      mutationSendVerificationCodeEmail.status === "success"
                        ? "text-teal-500"
                        : mutationSendVerificationCodeEmail.status === "error"
                        ? "text-red-500"
                        : ""
                    }`}>
                    {showMessageVerificationCode}
                  </p>
                </div>

                <div className={`mb-6 w-full inputBox`}>
                  <input
                    className={`${
                      errorsRegister.password ? "inputTagBug" : "inputTag"
                    }`}
                    type="password"
                    required
                    {...registerRegister("password", {
                      required: lang !== "vi" ? "Password" : "Mật khẩu",
                      minLength: {
                        value: 8,
                        message:
                          lang !== "vi"
                            ? "Password has at least 8 characters"
                            : "Mật khẩu có ít nhất 8 ký tự",
                      },
                    })}
                  />
                  <span className="spanTag">
                    {errorsRegister.password
                      ? errorsRegister.password.message
                      : lang !== "vi"
                      ? "Password"
                      : "Mật khẩu"}
                  </span>
                </div>

                <div className={`flex justify-between flex-col`}>
                  <div className={`mb-6 inputBox w-full`}>
                    <input
                      className={`${
                        errorsRegister.passwordConfirm
                          ? "inputTagBug"
                          : "inputTag"
                      }`}
                      type="password"
                      required
                      {...registerRegister("passwordConfirm", {
                        validate: (value) => {
                          return value !== watchRegister("password")
                            ? lang !== "vi"
                              ? "Passwords do not match"
                              : "Mật khẩu không khớp"
                            : true;
                        },
                        required:
                          lang !== "vi"
                            ? "Confirm password"
                            : "Xác nhận mật khẩu",
                      })}
                    />
                    <span className={`spanTag`}>
                      {errorsRegister.passwordConfirm
                        ? errorsRegister.passwordConfirm.message
                        : lang !== "vi"
                        ? "Confirm password"
                        : "Xác nhận mật khẩu"}
                    </span>
                  </div>
                </div>
              </>
            )}
            <div className="boxLogRes">
              <button
                className={`${isStateLogin ? "styleLogin" : "styleRes"}`}
                type="submit"
                onClick={() => handleSwapClasses("Log")}>
                {mutationLogin.isPending || mutationGet.isPending ? (
                  <Bouncy size="30" speed="1.75" color="white" />
                ) : (
                  <p className="h-fit text-sm flex justify-center items-center uppercase cursor-pointer">
                    {lang !== "vi" ? "Login" : "Đăng nhập"}
                  </p>
                )}
              </button>
              <button
                className={`${!isStateLogin ? "styleLogin" : "styleRes"}`}
                type="submit"
                onClick={() => handleSwapClasses("Res")}>
                {mutationRegister.isPending ? (
                  <Bouncy size="30" speed="1.75" color="white" />
                ) : (
                  <p className="h-fit text-sm flex justify-center items-center uppercase cursor-pointer">
                    {lang !== "vi" ? "Register" : "Đăng kí"}
                  </p>
                )}
              </button>
            </div>

            <button
              onClick={() => clickChangeLanguage(lang !== "vi" ? "vi" : "en")}
              type="button"
              className="text-black mt-20 flex gap-2 items-center font-mono cursor-pointer m-auto">
              <p className="md:block hidden">
                {lang !== "vi" ? "Change language to: " : "Đổi ngôn ngữ sang: "}
              </p>
              <img
                src={lang !== "vi" ? "./vn-lang.png" : "./us-uk-lang.png"}
                alt="language"
                className="size-5"
              />
              <p>{lang !== "vi" ? "Tiếng Việt" : "English"}</p>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
