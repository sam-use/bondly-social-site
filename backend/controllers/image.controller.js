import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { generateTransformedImage } from "../utils/imageTransform.js";

export const uploadTempImage = async (req, res) => {
  try {
    const image = req.file;
    if (!image) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    const optimizedImageBuffer = await sharp(image.buffer)
      .resize(1000, 1000, { fit: sharp.fit.inside, withoutEnlargement: true })
      .toFormat("jpeg", { quality: 88 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri, {
      folder: "bondly/temp",
    });

    return res.status(200).json({
      success: true,
      imageUrl: cloudResponse.secure_url,
    });
  } catch (error) {
    console.error("Temporary upload failed:", error);
    return res.status(500).json({ success: false, message: "Failed to upload temporary image" });
  }
};

export const transformImage = async (req, res) => {
  try {
    const { imageUrl, transformationType, transformations } = req.body;
    const requested = transformations || transformationType;
    if (!imageUrl || !requested) {
      return res.status(400).json({
        success: false,
        message: "imageUrl and transformationType/transformations are required",
      });
    }

    const transformedUrl = generateTransformedImage(imageUrl, requested);
    return res.status(200).json({ success: true, transformedUrl });
  } catch (error) {
    console.error("Image transform failed:", error);
    return res.status(400).json({ success: false, message: error.message || "Transform failed" });
  }
};
