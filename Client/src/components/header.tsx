import { useContext } from "react";
import { Link, useNavigate } from "react-router";
import { CONTEXT } from "../context/context";
import type { User } from "../pages/home";

import { LogOut } from "lucide-react";
import { useChangeLanguage } from "../services/change_langue";

function Header() {
  const navigate = useNavigate();

  const { lang } = useContext(CONTEXT);

  const handleChangeLanguage = useChangeLanguage();

  const clickChangeLanguage = (paramLang: string) => {
    handleChangeLanguage(paramLang);
  };

  const user: User | null = JSON.parse(localStorage.getItem("user") || "null");

  const funcLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  const handleClickLogin = () => {
    navigate("/login?lang=" + lang);
  };

  return (
    <header className="sticky h-[70px] top-0 w-full bg-[#fafafa] flex items-center px-4 z-10 shadow-sm justify-between">
      <Link to="/" className="logo">
        <p className="uppercase md:text-2xl font-bold text-gray-800">English</p>
      </Link>

      <div className="flex gap-10 items-center">
        <button
          onClick={() => clickChangeLanguage(lang !== "vi" ? "vi" : "en")}
          className="text-black flex gap-2 items-center font-mono cursor-pointer">
          <img
            src={lang !== "vi" ? "./vn-lang.png" : "./us-uk-lang.png"}
            alt="language"
            className="size-5"
          />
          <p className="md:block hidden">
            {lang !== "vi" ? "Tiếng Việt" : "English"}
          </p>
        </button>

        {!user ? (
          <button
            className={`flex gap-1 rounded-md border-2 p-[6px] hover:border-[#0194f3] transition-colors cursor-pointer`}
            onClick={handleClickLogin}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#0194f3"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#0194f3"
              className="size-5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <p className="font-mono tracking-tight text-sky-500 drop-shadow-md shadow-black">
              {lang !== "vi" ? "Login" : "Đăng nhập"}
            </p>
          </button>
        ) : (
          <button
            className={`flex gap-1 rounded-md border-2 p-[6px] hover:border-red-500 transition-colors cursor-pointer`}
            onClick={funcLogout}>
            <LogOut className="size-5 text-red-500" />
            <p className="font-mono tracking-tight text-red-500 drop-shadow-md shadow-black">
              {lang !== "vi" ? "Logout" : "Đăng xuất"}
            </p>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
