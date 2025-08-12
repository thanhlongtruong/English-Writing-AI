import { createContext } from "react";

import type { Dispatch, SetStateAction } from "react";

interface ContextType {
  lang: string;
  setLang: Dispatch<SetStateAction<string>>;
  isShowPopupPostStory: boolean;
  setShowPopupPostStory: Dispatch<SetStateAction<boolean>>;
  isStateStory: string;
  setStateStory: Dispatch<SetStateAction<string>>;
  isTryWriting: string;
  setIsTryWriting: Dispatch<SetStateAction<string>>;
  isCommentStoryId: string;
  setIsCommentStoryId: Dispatch<SetStateAction<string>>;
  notification: {
    message: string;
    type: string;
  } | null;
  setNotification: Dispatch<SetStateAction<{
    message: string;
    type: string;
  } | null>>;
  showNotification: (message: string, type: string) => void;
}

export const CONTEXT = createContext<ContextType>({
  lang: "vi",
  setLang: () => {},
  isShowPopupPostStory: false,
  setShowPopupPostStory: () => {},
  isStateStory: "story",
  setStateStory: () => {},
  isTryWriting: "",
  setIsTryWriting: () => {},
  isCommentStoryId: "",
  setIsCommentStoryId: () => { },
  notification: null,
  setNotification: () => { },
  showNotification: () => { },
});
