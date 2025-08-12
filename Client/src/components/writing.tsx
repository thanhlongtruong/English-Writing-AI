import { useContext, useEffect, useRef, useState } from "react";
import { CONTEXT } from "../context/context";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  EvaluateWriting,
  GenerateWriting,
  type WritingData,
} from "../APIs/Writing";
import { Bouncy } from "ldrs/react";
import Popup_post_story from "./popup_post_story";
import { X } from "lucide-react";

interface ContentFromAI {
  data: {
    content: string;
    suggest: {
      vocabulary: string[];
      phrases: string[];
    };
  };
  message_vi: string;
  message_en: string;
}

interface EvaluateFromAI {
  data: {
    feedback_vi: string;
    feedback_en: string;
    improve_vi: string[];
    improve_en: string[];
    score: number;
  };
  message_vi: string;
  message_en: string;
}

function WritingPage() {
  const {
    lang,
    isShowPopupPostStory,
    setShowPopupPostStory,
    isTryWriting,
    setIsTryWriting,
    showNotification,
  } = useContext(CONTEXT);

  const user = JSON.parse(localStorage.getItem("user") ?? "false");

  const topicWriting: string[] = [
    lang !== "vi" ? "Economy" : "Kinh tế",
    lang !== "vi" ? "Politics" : "Chính trị",
    lang !== "vi" ? "Literature" : "Văn học",
    lang !== "vi" ? "Science" : "Khoa học",
    lang !== "vi" ? "Technology" : "Công nghệ",
    lang !== "vi" ? "Education" : "Giáo dục",
    lang !== "vi" ? "Health" : "Sức khỏe",
    lang !== "vi" ? "Sports" : "Thể thao",
    lang !== "vi" ? "Entertainment" : "Giải trí",
    lang !== "vi" ? "News" : "Tin tức",
  ];

  const levelWriting: string[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const numberWriting: number[] = [3, 5, 7, 9, 11, 13, 15];

  const { register, handleSubmit } = useForm<WritingData>();

  const refTextarea = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState<string>("");
  const [contentFromAI, setContentFromAI] = useState<ContentFromAI>({
    data: {
      content: "",
      suggest: {
        vocabulary: [],
        phrases: [],
      },
    },
    message_vi: "",
    message_en: "",
  });
  const [isChooseAI, setIsChooseAI] = useState<boolean>(false);

  const [evaluate, setEvaluate] = useState<EvaluateFromAI>({
    data: {
      feedback_vi: "",
      feedback_en: "",
      improve_vi: [],
      improve_en: [],
      score: 0,
    },
    message_vi: "",
    message_en: "",
  });

  useEffect(() => {
    if (refTextarea.current) {
      refTextarea.current.style.height = "auto";
      refTextarea.current.style.height =
        refTextarea.current.scrollHeight + "px";
    }
  }, [value]);

  const mutateGenerateWriting = useMutation({
    mutationFn: GenerateWriting,
    onSuccess: (data) => {
      setContentFromAI(data.data);
      setIsChooseAI(false);
      setIsTryWriting("");
    },
    onError: (error: any) => {
      if (!error.response) {
        showNotification("Server không phản hồi.", "Error");
      } else if (error?.response && error?.response?.data) {
        showNotification(
          lang !== "vi"
            ? error?.response?.data?.message_en
            : error?.response?.data?.message_vi,
          "Error"
        );
      }
    },
  });

  const handleGenerateWriting = (data: WritingData) => {
    if (!user) {
      return;
    }
    mutateGenerateWriting.mutate({
      topic: data.topic,
      level: data.level,
      number: data.number as number,
    });
  };

  const mutateEvaluateWriting = useMutation({
    mutationFn: EvaluateWriting,
    onSuccess: (res) => {
      const { data, message_vi, message_en } = res.data;
      setEvaluate({
        data: {
          feedback_vi: data.feedback_vi,
          feedback_en: data.feedback_en,
          improve_vi: data.improve_vi,
          improve_en: data.improve_en,
          score: data.score,
        },
        message_vi: message_vi,
        message_en: message_en,
      });
    },
    onError: (error: any) => {
      if (!error.response) {
        showNotification("Server không phản hồi.", "Error");
      } else if (error?.response && error?.response?.data) {
        showNotification(
          lang !== "vi"
            ? error?.response?.data?.message_en
            : error?.response?.data?.message_vi,
          "Error"
        );
      }
    },
  });

  return (
    <>
      {isShowPopupPostStory && user && (
        <Popup_post_story
          lang={lang}
          user={user}
          topic="Writing"
          content_en={value}
          content_vi={contentFromAI.data.content}
        />
      )}
      <div className="flex flex-col gap-2 w-full">
        <div className="md:max-w-4xl w-full m-auto">
          <p
            onClick={() => setIsChooseAI(!isChooseAI)}
            className="text-base text-zinc-800 hover:text-zinc-950 cursor-pointer w-fit">
            {!isChooseAI
              ? lang !== "vi"
                ? "Don't have a topic to write? Click here to get help from AI."
                : "Bạn không có chủ đề viết? Hãy bấm vào để nhờ sự giúp đỡ từ AI."
              : lang !== "vi"
              ? "Have a topic to write? Click here to turn off option AI."
              : "Bạn đã có chủ đề viết? Hãy bấm vào đây để tắt tùy chọn AI."}
          </p>
        </div>
        <form
          onSubmit={handleSubmit(handleGenerateWriting)}
          className={`flex flex-col gap-2 border-zinc-900 border-1 rounded-md p-2 w-full md:max-w-4xl m-auto transition-all duration-300 items-start ${
            isChooseAI ? "block" : "hidden"
          }`}>
          <label htmlFor="topic" className="flex gap-x-2 items-center">
            <span className="text-zinc-900">
              {lang !== "vi" ? "Topic: " : "Chủ đề: "}
            </span>
            <select
              id="topic"
              {...register("topic")}
              className="w-fit h-full active:outline-none focus:outline-none p-2">
              {topicWriting.map((topic) => (
                <option key={topic} value={topic}>
                  {topic || topicWriting[0]}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="level" className="flex gap-x-2 items-center">
            <span className="text-zinc-900">
              {lang !== "vi" ? "Level: " : "Trình độ: "}
            </span>
            <select
              id="level"
              {...register("level")}
              className="w-fit h-full active:outline-none focus:outline-none p-2">
              {levelWriting.map((level) => (
                <option key={level} value={level}>
                  {level || levelWriting[0]}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="number" className="flex gap-x-2 items-center w-full">
            <span className="text-zinc-900 whitespace-nowrap">
              {lang !== "vi" ? "Number of sentences: " : "Số câu: "}
            </span>
            <select
              id="number"
              {...register("number")}
              className="w-fit h-full active:outline-none focus:outline-none p-2">
              {numberWriting.map((number) => (
                <option key={number} value={number}>
                  {number || numberWriting[0]}
                </option>
              ))}
            </select>
          </label>

          {mutateGenerateWriting.isPending ? (
            <span className="text-zinc-900 flex items-center gap-x-2">
              {lang !== "vi" ? "Generating" : "Đang tạo"}
              <Bouncy size="30" speed="1.75" color="black" />
            </span>
          ) : (
            <div className="flex gap-x-2 items-center">
              <button
                type="submit"
                className={`w-fit h-full  border-1 rounded-md py-1 px-3 ${
                  !user
                    ? "opacity-50 border-zinc-500 text-zinc-500"
                    : "cursor-pointer border-sky-500 text-sky-500"
                }`}>
                {lang !== "vi" ? "Generate" : "Tạo"}
              </button>
              {!user && (
                <p className="text-red-500 text-sm font-medium">
                  {lang !== "vi"
                    ? "Please login to generate writing."
                    : "Vui lòng đăng nhập để tạo bài viết."}
                </p>
              )}
            </div>
          )}
        </form>

        <div className="flex flex-wrap gap-2 justify-end items-end w-full md:max-w-4xl m-auto">
          {contentFromAI.data.content !== "" && (
            <div className="flex flex-col gap-y-2 w-full border-zinc-900 border-1 rounded-md">
              <div className="flex items-start gap-x-2 md:w-fit w-full md:border-r md:rounded-br-md border-b-1 border-zinc-900 pb-2 p-2">
                <button
                  onClick={() =>
                    setContentFromAI({
                      data: {
                        content: "",
                        suggest: {
                          vocabulary: [],
                          phrases: [],
                        },
                      },
                      message_vi: "",
                      message_en: "",
                    })
                  }
                  className="shrink-0 h-7 w-7 cursor-pointer bg-zinc-100 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white">
                  <X size={16} className="shrink-0" />
                </button>
                <p className="text-sm text-zinc-900 font-medium">
                  {lang !== "vi"
                    ? contentFromAI.message_en
                    : contentFromAI.message_vi}
                </p>
              </div>
              <p className="w-full p-2 h-fit">{contentFromAI.data.content}</p>

              <div className="flex md:flex-row flex-col gap-2 w-full p-2">
                <div className="flex flex-col gap-2 w-full p-2">
                  <p className="text-zinc-900 font-medium">
                    {lang !== "vi" ? "Vocabulary" : "Từ vựng"}
                  </p>
                  {contentFromAI.data.suggest.vocabulary.map((vocabulary) => (
                    <p key={vocabulary} className="text-zinc-900">
                      {vocabulary}
                    </p>
                  ))}
                </div>
                <div className="flex flex-col gap-2 w-full p-2">
                  <p className="text-zinc-900 font-medium">
                    {lang !== "vi" ? "Phrases" : "Cụm từ"}
                  </p>
                  {contentFromAI.data.suggest.phrases.map((phrases) => (
                    <p key={phrases} className="text-zinc-900">
                      {phrases}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isTryWriting && (
            <div className="flex flex-col gap-y-2 w-full md:max-w-4xl m-auto border-zinc-900 border-1 rounded-md">
              <div className="flex items-start gap-x-2 w-fit border-r rounded-br-md border-b-1 border-zinc-900 pb-2 p-2">
                <button
                  onClick={() => setIsTryWriting("")}
                  className="shrink-0 h-7 w-7 cursor-pointer bg-zinc-100 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white">
                  <X size={16} className="shrink-0" />
                </button>

                <p className="text-sm text-zinc-900 font-medium">
                  {lang !== "vi"
                    ? "Writing from community"
                    : "Bài viết từ cộng đồng"}
                </p>
              </div>
              <p className="w-full p-2 h-fit">{isTryWriting}</p>
            </div>
          )}

          {evaluate.data.feedback_vi !== "" && (
            <div className="flex flex-col text-zinc-900 gap-y-2 w-full md:max-w-4xl m-auto border-zinc-900 border-1 rounded-md">
              <div className="flex items-start gap-x-2 w-fit border-r rounded-br-md border-b-1 border-zinc-900 pb-2 p-2">
                <button
                  onClick={() =>
                    setEvaluate({
                      data: {
                        feedback_vi: "",
                        feedback_en: "",
                        improve_vi: [],
                        improve_en: [],
                        score: 0,
                      },
                      message_vi: "",
                      message_en: "",
                    })
                  }
                  className="shrink-0 h-7 w-7 cursor-pointer bg-zinc-100 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white">
                  <X size={16} className="shrink-0" />
                </button>

                <p className="text-sm text-zinc-900 font-medium">
                  {lang !== "vi" ? evaluate.message_en : evaluate.message_vi}
                </p>
              </div>
              <div className="flex flex-col gap-y-2 p-2">
                <p className="w-full h-fit font-medium">
                  {lang !== "vi" ? "Feedback: " : "Nhận xét: "}
                </p>
                <p className="w-full h-fit">
                  {lang !== "vi"
                    ? evaluate.data.feedback_en
                    : evaluate.data.feedback_vi}
                </p>
              </div>
              {(evaluate.data.improve_en.length > 0 ||
                evaluate.data.improve_vi.length > 0) && (
                <div className="flex flex-col gap-y-2 p-2 mb-3">
                  <p className="w-full h-fit font-medium">
                    {lang !== "vi" ? "Improve: " : "Cải thiện: "}
                  </p>

                  {(lang !== "vi"
                    ? evaluate.data.improve_en
                    : evaluate.data.improve_vi
                  ).map((improve) => (
                    <p className="w-full h-fit">{improve}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="w-full h-fit rounded-md resize-none border-zinc-900 border-1 max-h-[calc(100svh-250px)]">
            <div className="flex items-start gap-x-2 w-fit border-r rounded-br-md border-b-1 border-zinc-900 pb-2 p-2">
              <p className="text-sm text-zinc-900 font-medium">
                {lang !== "vi" ? "Your English writing" : "Bài làm của bạn"}
              </p>
            </div>
            <textarea
              placeholder={
                lang !== "vi"
                  ? "✏️ Enter your English writing here..."
                  : "✏️ Nhập bài viết tiếng Anh của bạn tại đây..."
              }
              className="w-full h-full p-2 resize-none active:outline-none focus:outline-none"
              value={value}
              rows={2}
              lang="en"
              spellCheck={true}
              maxLength={2000}
              ref={refTextarea}
              onChange={(e) => {
                let value = e.target.value;
                if (/\s{2,}/.test(value)) {
                  value = value.replace(/\s{2,}/g, " ");
                }
                setValue(value);
              }}></textarea>
            <p className="text-sm text-zinc-500 p-2 text-right">
              {value.length}/2000 {lang !== "vi" ? "words" : "từ"}
            </p>
          </div>
        </div>
        {!user && (
          <div className="w-full md:max-w-4xl m-auto">
            <p className="text-red-500 text-sm font-medium">
              {lang !== "vi"
                ? "Please login to post or evaluate by AI."
                : "Vui lòng đăng nhập để đăng bài hoặc đánh giá bài viết bằng AI."}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 w-full md:max-w-4xl m-auto my-4">
          <button
            onClick={() => {
              if (!user || mutateEvaluateWriting.isPending) {
                return;
              }
              mutateEvaluateWriting.mutate({
                content_user: value,
                content_original: contentFromAI.data.content,
              });
            }}
            className={`w-fit h-full border-sky-500 text-sky-500 border-1 rounded-md py-1 px-3 cursor-pointer ${
              !user || !value || value.trim() === ""
                ? "opacity-50 border-zinc-500 text-zinc-500"
                : ""
            }`}>
            {mutateEvaluateWriting.isPending ? (
              <span className="text-zinc-900 flex items-center gap-x-2">
                {lang !== "vi" ? "Evaluating" : "Đang đánh giá"}
                <Bouncy size="30" speed="1.75" color="black" />
              </span>
            ) : lang !== "vi" ? (
              "Evaluate by AI"
            ) : (
              "Đánh giá bằng AI"
            )}
          </button>
          <button
            onClick={() => {
              if (!user || !value || value.trim() === "") {
                return;
              }
              setShowPopupPostStory(true);
            }}
            className={`w-fit h-full border-sky-500 text-sky-500 border-1 rounded-md py-1 px-3 cursor-pointer ${
              !user || !value || value.trim() === ""
                ? "opacity-50 border-zinc-500 text-zinc-500"
                : ""
            }`}>
            {lang !== "vi" ? "Post" : "Đăng bài"}
          </button>
        </div>
      </div>
    </>
  );
}

export default WritingPage;
