import cloudinary from "./cloudinary.js";

const extractPublicId = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  const uploadSegment = "/upload/";
  const idx = imageUrl.indexOf(uploadSegment);
  if (idx === -1) return null;

  let path = imageUrl.slice(idx + uploadSegment.length);
  // Remove version if present, e.g. v17123456/
  path = path.replace(/^v\d+\//, "");
  const dotIndex = path.lastIndexOf(".");
  return dotIndex !== -1 ? path.slice(0, dotIndex) : path;
};

const transformationsByType = {
  enhance: [{ effect: "auto_enhance" }, { effect: "sharpen" }],
  remove_bg: [{ effect: "background_removal" }],
  vintage: [{ effect: "art:incognito" }],
  bw: [{ effect: "grayscale" }],
  // "colorize" without strength can look washed/gray; add strength and a cinematic punch.
  cinematic: [
    { effect: "colorize:35", color: "#2b2f3a" },
    { effect: "contrast:15" },
    { effect: "saturation:12" },
  ],
  // Warm tone via tint + mild punch (reliable across accounts).
  warm: [
    { effect: "tint:35", color: "#f59e0b" },
    { effect: "saturation:10" },
    { effect: "contrast:5" },
  ],
};

export const generateTransformedImage = (imageUrl, types) => {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) {
    throw new Error("Unable to parse Cloudinary public ID");
  }

  const requested = Array.isArray(types) ? types : [types];
  if (!requested.length) {
    return imageUrl;
  }

  const chained = [];
  for (const type of requested) {
    if (!transformationsByType[type]) {
      throw new Error("Unsupported transformation type");
    }
    chained.push(...transformationsByType[type]);
  }

  return cloudinary.url(publicId, {
    secure: true,
    transformation: chained,
  });
};

export const getAvailableTransformations = () => Object.keys(transformationsByType);
