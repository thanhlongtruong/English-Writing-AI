import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteStory, getStories } from "../APIs/Story";
import { Bouncy } from "ldrs/react";
import { useContext, useEffect, useRef, useState } from "react";
import { CONTEXT } from "../context/context";
import Popup_post_story from "./popup_post_story";
import { keepPreviousData } from "@tanstack/react-query";
import {
  CircleEllipsis,
  MessageCircle,
  MessageCircleOff,
  PenLine,
  Send,
  X,
} from "lucide-react";
import { getComments, postComment } from "../APIs/Comment";
import { convertDateToVNDate } from "../services/convertDateToVN";
import { useChangeUrlType } from "../services/change_url_type";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";

interface ResPostComment {
  message_vi: string;
  message_en: string;
}

function StoryPage() {
  const queryClient = useQueryClient();
  const changeUrlType = useChangeUrlType();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    lang,
    setShowPopupPostStory,
    isShowPopupPostStory,
    setIsTryWriting,
    isCommentStoryId,
    setIsCommentStoryId,
    showNotification,
  } = useContext(CONTEXT);

  const user = JSON.parse(localStorage.getItem("user") ?? "false");

  const refTextareaComment = useRef<HTMLTextAreaElement>(null);

  const [valueComment, setValueComment] = useState<string>("");

  const [resPostComment, setResPostComment] = useState<ResPostComment | null>(
    null
  );
  const [dataEditStory, setDataEditStory] = useState<any>(null);

  const [showMore, setShowMore] = useState<string>("");
  const optionMore: string[] = ["Chỉnh sửa bài viết", "Gỡ bài viết"];

  useEffect(() => {
    if (refTextareaComment.current) {
      refTextareaComment.current.style.height = "auto";
      refTextareaComment.current.style.height =
        refTextareaComment.current.scrollHeight + "px";
    }
  }, [valueComment]);

  const { isLoading, data: stories } = useQuery({
    queryKey: ["stories"],
    queryFn: getStories,
    refetchOnWindowFocus: false,
    retry: false,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 10,
  });

  const funcTryWriting = (story: any) => {
    setIsTryWriting(story?.content_vi);
    changeUrlType("writing");
  };

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ["comments", isCommentStoryId],
    queryFn: () => getComments(isCommentStoryId),
    enabled: isCommentStoryId !== "",
    staleTime: 1000 * 60 * 10,
    retry: false,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const mutationPostComment = useMutation({
    mutationFn: postComment,
    onSuccess: (_) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", isCommentStoryId],
      });
      setValueComment("");
    },
    onError: (error: any) => {
      if (!error.response) {
        showNotification("Server không phản hồi.", "Error");
      } else if (error?.response && error?.response?.data) {
        setResPostComment({
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

  const handleShowComment = (storyId: string) => {
    const params = new URLSearchParams(location.search);
    params.set("storyId", storyId);
    navigate(`${location.pathname}?${params.toString()}`);
    setValueComment("");
    setIsCommentStoryId(isCommentStoryId === storyId ? "" : storyId);
  };

  useEffect(() => {
    if (isCommentStoryId === "") {
      changeUrlType("story");
    }
  }, [isCommentStoryId]);

  const handleShowMore = (storyId: string) => {
    setShowMore(showMore === storyId ? "" : storyId);
  };

  const mutationDeleteStory = useMutation({
    mutationFn: deleteStory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setShowMore("");
      showNotification(
        lang !== "vi" ? data?.data?.message_en : data?.data?.message_vi,
        "Success"
      );
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

  const handleClickOptionMore = (story: any, index: number) => {
    if (story?.accountId?._id !== user?._id) {
      return;
    }
    if (mutationDeleteStory.isPending) {
      return;
    }
    if (optionMore[index] === "Gỡ bài viết") {
      mutationDeleteStory.mutate(story?._id);
    } else if (optionMore[index] === "Chỉnh sửa bài viết") {
      setDataEditStory(story);
      setShowPopupPostStory(true);
    }
  };

  if (isLoading) {
    return (
      <div className="w-fit h-fit justify-center items-center flex m-auto gap-x-2">
        <Bouncy size="30" speed="1.75" color="black" />
        <p className="text-zinc-900 font-medium text-sm">
          {lang !== "vi" ? "Loading stories..." : "Đang tải bài viết..."}
        </p>
      </div>
    );
  }

  return (
    <>
      {isShowPopupPostStory &&
        (dataEditStory ? (
          <Popup_post_story
            topic={dataEditStory?.topic}
            lang={lang}
            user={user}
            dataEdit={dataEditStory}
          />
        ) : (
          <Popup_post_story
            topic={lang !== "vi" ? "Question" : "Câu hỏi"}
            lang={lang}
            user={user}
          />
        ))}
      <div className="md:max-w-4xl w-full m-auto border border-zinc-200 rounded-md h-fit mb-4">
        <div className="flex gap-4 p-3 border-b border-zinc-200 items-center w-full">
          <div className="flex items-center gap-x-4 w-full">
            <img
              alt="logo_user"
              src="./logo_user_default.jpg"
              className="rounded-full h-10 w-10 object-cover shrink-0"
            />
            <p
              onClick={() => {
                if (!user) {
                  return;
                }
                setDataEditStory(null);
                setShowPopupPostStory(true);
              }}
              className={`break-words h-fit cursor-text w-full ${
                user
                  ? "text-zinc-400 text-base"
                  : "text-red-500 font-medium md:text-base text-sm"
              }`}>
              {user
                ? lang !== "vi"
                  ? "New post?"
                  : "Bài viết mới?"
                : lang !== "vi"
                ? "Please login to post"
                : "Vui lòng đăng nhập để đăng bài"}
            </p>
          </div>

          {user && (
            <button
              onClick={() => {
                if (!user) {
                  return;
                }
                setDataEditStory(null);
                setShowPopupPostStory(true);
              }}
              className="text-black hover:text-sky-400 border whitespace-nowrap border-zinc-200 hover:border-sky-400 rounded-md font-medium bg-white md:py-2 py-1 md:px-4 px-2 cursor-pointer">
              {lang !== "vi" ? "Post" : "Đăng bài"}
            </button>
          )}
        </div>

        {stories ? (
          stories.data.map((story: any) => (
            <div
              key={story?._id}
              className="flex flex-col items-start gap-4 p-2 pt-3 border-b border-zinc-200 w-full text-black">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <img
                    alt="logo_user"
                    src="./logo_user_default.jpg"
                    className="rounded-full h-6 w-6 object-cover shrink-0"
                  />
                  <p className="text-zinc-900 font-semibold text-sm">
                    {story?.accountId?._id === user?._id
                      ? "You"
                      : story?.accountId?.name}
                  </p>
                  <p className="text-zinc-500 font-semibold text-sm">{">"}</p>
                  <p className="text-zinc-900 font-semibold text-sm">
                    {story?.topic === "Câu hỏi"
                      ? lang !== "vi"
                        ? "Question"
                        : "Câu hỏi"
                      : story?.topic === "Question"
                      ? lang !== "vi"
                        ? "Question"
                        : "Câu hỏi"
                      : story?.topic}
                  </p>
                </div>
                {story?.accountId?._id === user?._id && (
                  <div className="relative">
                    {story?._id === showMore ? (
                      <X
                        onClick={() => handleShowMore(story?._id)}
                        size={20}
                        className="shrink-0 cursor-pointer text-red-500"
                      />
                    ) : (
                      <CircleEllipsis
                        onClick={() => handleShowMore(story?._id)}
                        size={20}
                        className="shrink-0 cursor-pointer"
                      />
                    )}
                    {story?._id === showMore && (
                      <div className="bg-white w-fit md:w-52 shadow-lg absolute top-7 right-0 border border-zinc-200 rounded-md z-10">
                        <ul>
                          {optionMore.map((item, index) => (
                            <li
                              onClick={() =>
                                handleClickOptionMore(story, index)
                              }
                              key={item}
                              className={`${
                                index === 0 ? "text-zinc-900 " : "text-red-500"
                              } md:p-4 p-3 whitespace-nowrap border-b border-zinc-200 font-medium text-base hover:bg-zinc-100 cursor-pointer`}>
                              {index === 1 && mutationDeleteStory.isPending ? (
                                <Bouncy size="25" speed="1.75" color="black" />
                              ) : (
                                item
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-y-2">
                <p className="text-zinc-900">{story?.title}</p>

                {story?.content_vi && (
                  <p className="text-zinc-900">
                    Tiếng Việt: {story?.content_vi}
                  </p>
                )}

                {story?.content_en && (
                  <p className="text-zinc-900">
                    Tiếng Anh: {story?.content_en}
                  </p>
                )}
              </div>

              {isCommentStoryId === story?._id && (
                <div className="border-t pt-2 border-zinc-200 w-full flex flex-col gap-y-2">
                  {isLoadingComments && (
                    <div className="flex items-center gap-x-2">
                      <Bouncy size="25" speed="1.75" color="black" />
                      <p className="text-zinc-900 font-medium text-sm">
                        {lang !== "vi"
                          ? "Loading comments..."
                          : "Đang tải bình luận..."}
                      </p>
                    </div>
                  )}

                  {!isLoadingComments &&
                  comments &&
                  comments?.data?.data?.length > 0 ? (
                    <>
                      <p className="text-zinc-900 font-medium text-sm md:text-base mb-2">
                        {lang !== "vi"
                          ? "List comments"
                          : "Danh sách bình luận"}
                      </p>
                      {comments?.data?.data?.map(
                        (comment: any) =>
                          comment.storyId === story._id && (
                            <div
                              key={comment._id}
                              className="flex flex-col mb-3 w-full">
                              <div className="flex items-start gap-x-2">
                                <img
                                  alt="logo_user"
                                  src="./logo_user_default.jpg"
                                  className="rounded-full h-6 w-6 shrink-0"
                                />
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-x-2">
                                    <p className="text-zinc-900 text-sm font-medium">
                                      {comment.accountId.name}
                                    </p>
                                    <p className="text-zinc-900 text-sm">
                                      {convertDateToVNDate(
                                        comment.createdAt as string
                                      )}
                                    </p>
                                  </div>

                                  <p className="text-zinc-900">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-10 w-full">
                      <p className="text-zinc-900 font-medium text-sm">
                        {lang !== "vi"
                          ? "No comments."
                          : "Chưa có bình luận nào."}
                      </p>
                    </div>
                  )}

                  {mutationPostComment.isPending ? (
                    <div className="flex items-center gap-x-2">
                      <Bouncy size="25" speed="1.75" color="black" />
                      <p className="text-zinc-900 font-medium text-sm">
                        {lang !== "vi"
                          ? "Posting comment..."
                          : "Đang đăng bình luận..."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-x-2">
                      {user ? (
                        <div className="flex flex-col gap-y-1 w-full">
                          <textarea
                            ref={refTextareaComment}
                            className="w-full h-fit resize-none active:outline-none focus:outline-none"
                            placeholder={
                              lang !== "vi" ? "Here..." : "Bình luận tại đây..."
                            }
                            rows={2}
                            value={valueComment}
                            maxLength={400}
                            onChange={(e) => {
                              let value = e.target.value;
                              if (/\s{2,}/.test(value)) {
                                value = value.replace(/\s{2,}/g, " ");
                              }
                              setValueComment(value);
                            }}
                          />
                          <p
                            className={`text-sm text-right ${
                              valueComment.length >= 400
                                ? "text-red-500"
                                : "text-zinc-500"
                            }`}>
                            {valueComment.length}/400
                          </p>
                        </div>
                      ) : (
                        <p className="text-red-500 font-medium text-sm">
                          {lang !== "vi"
                            ? "Please login to comment"
                            : "Vui lòng đăng nhập để bình luận"}
                        </p>
                      )}

                      <Send
                        onClick={() => {
                          if (valueComment.trim() === "") {
                            return;
                          }
                          mutationPostComment.mutate({
                            storyId: story?._id,
                            content: valueComment,
                            story_accountId: story?.accountId?._id ?? "",
                          });
                        }}
                        size={22}
                        className={`cursor-pointer text-cyan-500 shrink-0 ${
                          valueComment.trim() === "" || !user
                            ? "text-zinc-400"
                            : "text-cyan-500"
                        }`}
                      />
                    </div>
                  )}
                  {resPostComment && (
                    <div className="flex items-center gap-x-2 p-2 w-full">
                      <button
                        onClick={() => setResPostComment(null)}
                        className="shrink-0 h-7 w-7 cursor-pointer bg-zinc-100 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white">
                        <X size={16} className="shrink-0" />
                      </button>
                      <p className="text-red-500 font-medium text-base p-2 break-words w-full">
                        {lang !== "vi"
                          ? resPostComment.message_en
                          : resPostComment.message_vi}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-x-2 flex-wrap">
                <button
                  onClick={() => handleShowComment(story._id)}
                  className="flex items-center gap-x-2 text-black rounded-md font-medium hover:bg-zinc-100 py-1 px-2 cursor-pointer border border-zinc-200">
                  {isCommentStoryId === story._id ? (
                    <MessageCircleOff size={16} />
                  ) : (
                    <MessageCircle size={16} />
                  )}
                  {lang !== "vi" ? "Comment" : "Bình luận"}
                </button>

                {story.topic === "Writing" && story?.content_vi && (
                  <button
                    onClick={() => funcTryWriting(story)}
                    className="flex items-center gap-x-2 text-black rounded-md font-medium hover:bg-zinc-100 py-1 px-2 cursor-pointer border border-zinc-200">
                    <PenLine size={16} />
                    {lang !== "vi" ? "Try" : "Làm thử"}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-32 w-full">
            <p className="text-zinc-900 font-medium">
              {lang !== "vi" ? "Blank" : "Không có bài viết nào."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default StoryPage;
