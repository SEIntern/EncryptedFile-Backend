import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constant/statusCodes.js";
import CryptoJS from "crypto-js";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import File from "../models/files.model.js";
import User from "../models/users.model.js";

// Use memory storage (not disk)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Utility to wrap upload_stream in a Promise
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

export const uploadFile = async (req, res, next) => {
  try {
    const userId = req.user.userId; // from JWT
    const user = await User.findById(userId);

    if (!user) return sendResponse(res, STATUS.NOT_FOUND, "User not found");

    if (user.current_file_count >= user.max_files) {
      return sendResponse(res, STATUS.FORBIDDEN, "File upload limit reached");
    }

    if (!req.file) return sendResponse(res, STATUS.BAD_REQUEST, "No file uploaded");

    // Generate encryption key & IV
    const key = CryptoJS.lib.WordArray.random(32); // 256-bit key
    const iv = CryptoJS.lib.WordArray.random(16);

    // Read file buffer directly
    const fileBuffer = req.file.buffer;
    const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);

    // Encrypt file
    const encrypted = CryptoJS.AES.encrypt(wordArray, key, { iv });
    const encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(Buffer.from(encryptedBase64), {
      resource_type: "raw",
      folder: "encrypted_files",
      public_id: req.file.originalname,
      overwrite: true,
    });

    // Save file details in DB
    const newFile = await File.create({
      filename: req.file.originalname,
      user_id: user._id,
      manager_id: user.manager_id,
      admin_id: user.admin_id,
      iv: iv.toString(CryptoJS.enc.Hex),
      public_id: result.public_id,
      url: result.secure_url,
      encryption_key: key.toString(CryptoJS.enc.Hex),
    });

    // Update user's file count
    user.current_file_count += 1;
    await user.save();

    return sendResponse(
      res,
      STATUS.OK,
      "File uploaded and encrypted successfully",
      { file: newFile }
    );
  } catch (err) {
    next(err);
  }
};

import axios from "axios";


export const downloadFile = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const file = await File.findById(fileId);

    if (!file) {
      return sendResponse(res, STATUS.NOT_FOUND, "File not found");
    }

    // fetch encrypted file from Cloudinary
    const response = await axios.get(file.url, { responseType: "arraybuffer" });
    const encryptedBuffer = response.data;

    // convert ArrayBuffer → Base64
    const binary = Buffer.from(encryptedBuffer, "binary").toString("base64");

    // decrypt
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(binary) },
      CryptoJS.enc.Hex.parse(file.encryption_key),
      { iv: CryptoJS.enc.Hex.parse(file.iv) }
    );

    // convert CryptoJS WordArray → Node Buffer
    const wordArrayToBuffer = (wordArray) => {
      const words = wordArray.words;
      const sigBytes = wordArray.sigBytes;
      const buffer = Buffer.alloc(sigBytes);
      for (let i = 0; i < sigBytes; i++) {
        buffer[i] =
          (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      }
      return buffer;
    };

    const decryptedBuffer = wordArrayToBuffer(decrypted);

    // set headers so browser knows it's a file download
    res.set({
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Content-Type": "application/octet-stream",
    });

    sendResponse(res, STATUS.OK, "File downloaded successfully", {
      file: decryptedBuffer,
    });
  } catch (err) {
    next(err);
  }
};

