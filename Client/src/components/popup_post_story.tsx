import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editStory, GenerateStory } from "../APIs/Story";
import { useContext, useEffect, useRef, useState } from "react";
import { CONTEXT } from "../context/context";
import type { User } from "../pages/home";
import { Bouncy } from "ldrs/react";
import { X } from "lucide-react";
import { useChangeUrlType } from "../services/change_url_type";

interface ResCreateStory {
  message_vi: string;
  message_en: string;
}

function Popup_post_story({
  topic = "Question",
  content_en,
  content_vi,
  lang,
  user,
  dataEdit,
}: {
  topic: string;
  content_en?: string;
  content_vi?: string;
  lang: string;
  user: User;
  dataEdit?: any;
}) {
  const queryClient = useQueryClient();

  const { setShowPopupPostStory, showNotification } = useContext(CONTEXT);

  const changeUrlType = useChangeUrlType();

  const textareaRefFeeling = useRef<HTMLTextAreaElement>(null);
  const [valueFeeling, setValueFeeling] = useState<string>("");

  useEffect(() => {
    if (dataEdit) {
      setValueFeeling(dataEdit?.title);
    }
  }, [dataEdit]);

  const [resCreateStory, setResCreateStory] = useState<ResCreateStory | null>(
    null
  );

  useEffect(() => {
    if (textareaRefFeeling.current) {
      textareaRefFeeling.current.style.height = "auto";
      textareaRefFeeling.current.style.height =
        textareaRefFeeling.current.scrollHeight + "px";
    }
  }, [valueFeeling]);

  const mutateGenerateStory = useMutation({
    mutationFn: GenerateStory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setShowPopupPostStory(false);
      if (topic === "Writing") {
        changeUrlType("story");
      }
      showNotification(
        lang !== "vi" ? data?.data?.message_en : data?.data?.message_vi,
        "Success"
      );
    },
    onError: (error: any) => {
      if (!error.response) {
        showNotification("Server không phản hồi.", "Error");
      } else {
        setResCreateStory({
          message_vi: error?.response?.data?.message_vi,
          message_en: error?.response?.data?.message_en,
        });
        if (error?.response?.status === 500) {
          showNotification(
            lang !== "vi"
              ? error?.response?.data?.message_en
              : error?.response?.data?.message_vi,
            "Error"
          );
        }
      }
    },
  });

  const mutateEditStory = useMutation({
    mutationFn: editStory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setShowPopupPostStory(false);
      showNotification(
        lang !== "vi" ? data?.data?.message_en : data?.data?.message_vi,
        "Success"
      );
    },
    onError: (error: any) => {
      if (!error.response) {
        showNotification("Server không phản hồi.", "Error");
      } else {
        setResCreateStory({
          message_vi: error?.response?.data?.message_vi,
          message_en: error?.response?.data?.message_en,
        });
        if (error?.response?.status === 500) {
          showNotification(
            lang !== "vi"
              ? error?.response?.data?.message_en
              : error?.response?.data?.message_vi,
            "Error"
          );
        }
      }
    },
  });

  const handleClickPost = () => {
    if (!user) {
      return;
    }
    if (mutateGenerateStory.isPending || mutateEditStory.isPending) {
      return;
    }
    if (dataEdit) {
      mutateEditStory.mutate({
        storyId: dataEdit?._id,
        title: valueFeeling,
      });
    } else {
      mutateGenerateStory.mutate({
        topic: topic,
        title: valueFeeling,
        content_vi: content_vi,
        content_en: content_en,
      });
    }
  };

  return (
    <div
      className={`fixed items-center h-full inset-0 z-[999] p-2 md:p-5 bg-zinc-800/50 flex justify-center w-full overflow-hidden`}>
      <div
        className={`min-h-20 max-h-full w-full m-auto md:w-[30rem] overflow-y-auto rounded-md scroll-smooth bg-white rounded-scrollbar`}>
        <div className="flex justify-between border-b-1 border-zinc-500 p-2 items-center sticky top-0 bg-white">
          <button
            onClick={() => setShowPopupPostStory(false)}
            className="text-zinc-900 hover:text-zinc-950 hover:rounded-md hover:bg-zinc-100 p-2 cursor-pointer">
            {lang !== "vi" ? "Back" : "Quay lại"}
          </button>
          {dataEdit ? (
            <p className="text-zinc-900 font-semibold text-sm">
              {lang !== "vi" ? "Edit Post" : "Chỉnh sửa bài viết"}
            </p>
          ) : (
            <p className="text-zinc-900 font-semibold text-sm">
              {lang !== "vi" ? "New Post" : "Bài viết mới"}
            </p>
          )}
          <button
            onClick={handleClickPost}
            className="text-white hover:bg-sky-400 rounded-md md:font-medium bg-sky-500 py-1 md:py-2 px-2 md:px-4 cursor-pointer">
            {mutateGenerateStory.isPending || mutateEditStory.isPending ? (
              <Bouncy size="30" speed="1.75" color="white" />
            ) : lang !== "vi" ? (
              "Post"
            ) : (
              "Đăng"
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 p-2">
          <img
            alt="logo_user"
            src="./logo_user_default.jpg"
            className="rounded-full h-6 w-6 object-cover shrink-0"
          />
          <p className="text-zinc-900 font-semibold text-sm">{user.name}</p>
          <p className="text-zinc-500 font-semibold text-sm">{">"}</p>

          <p className="text-zinc-900 font-semibold text-sm">{topic}</p>
        </div>

        <div className="flex flex-col items-end p-2">
          <textarea
            ref={textareaRefFeeling}
            value={valueFeeling}
            className="w-full active:outline-none focus:outline-none resize-none no-scrollbar"
            placeholder={
              lang !== "vi"
                ? "Write your question here..."
                : "Viết câu hỏi của bạn tại đây..."
            }
            maxLength={topic === "Question" || topic === "Câu hỏi" ? 400 : 300}
            rows={2}
            onChange={(e) => {
              let value = e.target.value;
              if (/\s{2,}/.test(value)) {
                value = value.replace(/\s{2,}/g, " ");
              }
              setValueFeeling(value);
            }}></textarea>
          <p
            className={`text-sm ${
              valueFeeling.length >=
              (topic === "Question" || topic === "Câu hỏi" ? 400 : 300)
                ? "text-red-500"
                : "text-zinc-500 "
            }`}>
            {valueFeeling.length}/
            {topic === "Question" || topic === "Câu hỏi" ? 400 : 300}
          </p>
        </div>

        {resCreateStory && (
          <div className="flex items-center gap-x-2 p-2 w-full">
            <button
              onClick={() => setResCreateStory(null)}
              className="shrink-0 h-7 w-7 cursor-pointer bg-zinc-100 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white">
              <X size={16} className="shrink-0" />
            </button>
            <p className="text-red-500 font-medium text-base p-2 break-words w-full">
              {lang !== "vi"
                ? resCreateStory.message_en
                : resCreateStory.message_vi}
            </p>
          </div>
        )}

        {((dataEdit && dataEdit?.content_vi) || content_vi) && (
          <p className="text-zinc-900 text-base p-2">
            Tiếng Việt: {content_vi || (dataEdit && dataEdit?.content_vi)}
          </p>
        )}
        {((dataEdit && dataEdit?.content_en) || content_en) && (
          <p className="text-zinc-900 text-base p-2">
            English: {content_en || (dataEdit && dataEdit?.content_en)}
          </p>
        )}
      </div>
    </div>
  );
}

export default Popup_post_story;
