import axios from "../Auth/Axios_Inceptor";

export interface StoryData {
  topic: string;
  title?: string;
  content_vi?: string;
  content_en?: string;
}
interface EditStoryData {
  storyId: string;
  title: string;
}

export const GenerateStory = async (data: StoryData) => {
  return await axios.post("/story/generate", {
    topic: data.topic,
    title: data.title,
    content_vi: data.content_vi || "",
    content_en: data.content_en || "",
  });
};

export const getStories = async () => {
  return await axios.get("/story/get");
};

export const deleteStory = async (storyId: string) => {
  return await axios.post("/story/delete", {
    storyId,
  });
};

export const editStory = async (data: EditStoryData) => {
  return await axios.post("/story/edit", {
    storyId: data.storyId,
    title: data.title,
  });
};
