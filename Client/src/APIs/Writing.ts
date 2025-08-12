import axios from "../Auth/Axios_Inceptor";

export interface WritingData {
  topic: string;
  level: string;
  number: number;
}

export interface EvaluateData {
  content_user: string;
  content_original?: string;
}

export const GenerateWriting = async (data: WritingData) => {
  return await axios.post("/writing/generate", {
    topic: data.topic,
    level: data.level,
    number: data.number,
  });
};

export const EvaluateWriting = async (data: EvaluateData) => {
  return await axios.post("/writing/evaluate", {
    content_user: data.content_user,
    content_original: data.content_original,
  });
};
