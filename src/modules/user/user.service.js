import User from "../../DB/models/user.model.js";
import Message from "../../DB/models/message.model.js";
import AppError from "../../utils/error/appError.js";
import { asyncHandler } from "../../utils/error/errorHandler.js";
import { saveFile, deleteFile } from "../../utils/upload/saveFile.js";
import { cacheDel } from "../../utils/cache/cache.js";

// GET /user/profile  (protected) — my own profile
export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

// POST /user/profile/image  (protected) — upload / replace my profile picture
export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest("An image file is required");

  // Validate (magic numbers) + persist to disk, then store the path.
  const relativePath = await saveFile(req.file, "users");

  // Remove the previous image if there was one.
  if (req.user.profileImage) await deleteFile(req.user.profileImage);

  req.user.profileImage = relativePath;
  await req.user.save();

  // The public profile is cached — invalidate this user's entry.
  await cacheDel(`user:${req.user._id}`);

  res.status(200).json({
    success: true,
    message: "Profile image updated",
    data: {
      profileImage: relativePath,
      url: `${req.protocol}://${req.get("host")}/${relativePath}`,
    },
  });
});

// GET /user/:id  (public) — a user's public card, used to send them a whisper
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name gender profileImage createdAt"
  );
  if (!user) throw AppError.notFound("User not found");

  res.status(200).json({
    success: true,
    message: `Send an anonymous whisper to ${user.name} 🤫`,
    data: user,
  });
});

// GET /user/messages  (protected) — whispers I have received
export const getMyMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ receiver: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});
