const extractUrls = (text = "") => {

  const regex =
    /https?:\/\/[^\s]+/g;

  const matches =
    text.match(regex) || [];

  // remove duplicates + cleanup
  return [
    ...new Set(
      matches.map((url) =>
        url.replace(/[.,!?]+$/, "")
      )
    ),
  ];
};

export default extractUrls;
