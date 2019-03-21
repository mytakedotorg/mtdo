const axios = require("axios");
const { Image } = require("canvas");

export function loadImage(url: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    axios.get(url, { responseType: "arraybuffer" }).then((res: any) => {
      img.src = new Buffer(res.data, "binary").toString();
    });
  });
}
