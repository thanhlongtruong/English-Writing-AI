import { useContext } from "react";
import { CONTEXT } from "../context/context";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";

export const useChangeLanguage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLang, isCommentStoryId, isStateStory } = useContext(CONTEXT);

  const handleChangeLanguage = (paramLang: string) => {
    let pathLoginAndRegister: boolean =
      location.pathname === "/login" || location.pathname === "/register";

    setLang(paramLang);

    if (pathLoginAndRegister) {
      navigate(`${location.pathname}?lang=${paramLang}`);
      return;
    }

    navigate(
      `${location.pathname}?lang=${paramLang}&type=${isStateStory}${
        isCommentStoryId ? `&storyId=${isCommentStoryId}` : ""
      }`
    );
  };

  return handleChangeLanguage;
};
