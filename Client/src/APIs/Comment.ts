import axios from "../Auth/Axios_Inceptor";

export interface CommentData {
  storyId: string;
  content: string;
  story_accountId: string;
}

export const postComment = async (data: CommentData) => {
  return await axios.post("/comment/post", {
    storyId: data.storyId,
    content: data.content,
    story_accountId: data.story_accountId,
  });
};

export const getComments = async (storyId: string) => {
  return await axios.post("/comment/get", {
    storyId: storyId,
  });
};
