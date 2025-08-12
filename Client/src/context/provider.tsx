import { useEffect, useState } from "react";
import { CONTEXT } from "./context";

import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";

interface ProviderProps {
  children: ReactNode;
}

export const Provider = ({ children }: ProviderProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [lang, setLang] = useState("vi");

  const [isStateStory, setStateStory] = useState<string>("story");
  const [isCommentStoryId, setIsCommentStoryId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const langParams = params.get("lang");
    const typeParams = params.get("type");
    const storyIdParams = params.get("storyId");

    let pathLoginAndRegister: boolean =
      location.pathname === "/login" || location.pathname === "/register";

    const validLang =
      langParams && ["vi", "en"].includes(langParams) ? langParams : "vi";
    setLang(validLang);

    const validType =
      typeParams && ["story", "writing"].includes(typeParams)
        ? typeParams
        : "story";
    setStateStory(validType);

    if (storyIdParams) {
      setIsCommentStoryId(storyIdParams);
    }

    if (pathLoginAndRegister) {
      const user = JSON.parse(localStorage.getItem("user") ?? "false");
      if (user) {
        navigate(
          `/?lang=${validLang}${
            storyIdParams ? `&storyId=${storyIdParams}` : ""
          }`
        );
      } else {
        navigate(`${location.pathname}?lang=${validLang}`);
      }
      return;
    }

    navigate(
      `${location.pathname}?lang=${validLang}&type=${validType}${
        storyIdParams ? `&storyId=${storyIdParams}` : ""
      }`
    );
  }, [location.search]);

  const [isShowPopupPostStory, setShowPopupPostStory] = useState(false);

  const [isTryWriting, setIsTryWriting] = useState<string>("");

  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
  };

  return (
    <CONTEXT.Provider
      value={{
        lang,
        setLang,
        isShowPopupPostStory,
        setShowPopupPostStory,
        isStateStory,
        setStateStory,
        isTryWriting,
        setIsTryWriting,
        isCommentStoryId,
        setIsCommentStoryId,
        notification,
        setNotification,
        showNotification,
      }}>
      {children}
    </CONTEXT.Provider>
  );
};
