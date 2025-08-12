import { useContext } from "react";
import { CONTEXT } from "../context/context";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";

export const useChangeUrlType = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setStateStory, lang } = useContext(CONTEXT);

  const changeUrlType = (type: string) => {
    setStateStory(type);
    navigate(`${location.pathname}?lang=${lang}&type=${type}`);
  };

  return changeUrlType;
};
