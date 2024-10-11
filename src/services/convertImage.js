module.exports = async () => {
  // const imageUrl = empresaImagem;
  const imageUrl =
    "https://live.staticflickr.com/65535/53907540152_131cb7eecb_m.jpg";
  const imageUrlData = await fetch(imageUrl);

  const buffer = await imageUrlData.arrayBuffer();
  const stringifiedBuffer = Buffer.from(buffer).toString("base64");
  const contentType = imageUrlData.headers.get("content-type");

  return `data:${contentType};base64,${stringifiedBuffer}`;
};
