import config from "./config";

export const resolveImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${config.env.imagekit.urlEndpoint}${url}`;
};

