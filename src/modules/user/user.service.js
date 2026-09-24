import User from "../../DB/models/user.model.js";
import Message from "../../DB/models/message.model.js";
import AppError from "../../utils/error/appError.js";
import { asyncHandler } from "../../utils/error/errorHandler.js";

// GET /user/profile  (protected) — my own profile
export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

// GET /user/:id  (public) — a user's public card, used to send them a whisper
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("name gender createdAt");
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
