module.exports = async (urlImage) => {
  const imageUrl = urlImage;
  const imageUrlData = await fetch(imageUrl);
  const buffer = await imageUrlData.arrayBuffer();
  const stringifiedBuffer = Buffer.from(buffer).toString("base64");
  const contentType = imageUrlData.headers.get("content-type");
  return `data:${contentType};base64,${stringifiedBuffer}`;
};
