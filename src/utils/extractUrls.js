const extractUrls = (text = "") => {

  const urlRegex =
    /(https?:\/\/[^\s]+)/g;

  return text.match(urlRegex) || [];

};

export default extractUrls;