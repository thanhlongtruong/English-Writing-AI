import { useContext } from "react";
import Header from "../components/header";
import { CONTEXT } from "../context/context";
import WritingPage from "../components/writing";
import StoryPage from "../components/story";
import { useChangeUrlType } from "../services/change_url_type";

export interface User {
  name: string;
  email: string;
}

function HomePage() {
  const { lang, isStateStory, setIsCommentStoryId } =
    useContext(CONTEXT);
  const changeUrlType = useChangeUrlType();

  const handleClickChangeUrlType = (type: string) => {
    changeUrlType(type);
    setIsCommentStoryId("");
  };
  return (
    <>
      <Header />

      <div className="w-full h-full text-zinc-950 bg-white px-2 md:px-4">
        <div
          className={`flex mb-4 w-full md:max-w-4xl m-auto sticky top-[70px] py-4 z-9 bg-white`}>
          <button
            onClick={() => handleClickChangeUrlType("story")}
            className={`${
              isStateStory === "story"
                ? "border-zinc-900"
                : "border-gray-300 text-gray-300"
            } flex-1/2 border-b-2 font-semibold md:text-lg text-base cursor-pointer transition-colors hover:text-gray-400 hover:border-gray-400`}>
            {lang !== "vi" ? "Story" : "Bài viết"}
          </button>
          <button
            onClick={() => handleClickChangeUrlType("writing")}
            className={`${
              isStateStory === "writing"
                ? "border-zinc-900"
                : "border-gray-300 text-gray-300"
            } flex-1/2 border-b-2 font-semibold md:text-lg text-base cursor-pointer transition-colors hover:text-gray-400 hover:border-gray-400`}>
            {lang !== "vi" ? "Practice Writing" : "Luyện tập Writing"}
          </button>
        </div>
        {isStateStory === "story" ? <StoryPage /> : <WritingPage />}
      </div>
    </>
  );
}

export default HomePage;
