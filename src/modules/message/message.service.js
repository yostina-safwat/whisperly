import Message from "../../DB/models/message.model.js";
import User from "../../DB/models/user.model.js";
import AppError from "../../utils/error/appError.js";
import { asyncHandler } from "../../utils/error/errorHandler.js";

// POST /message/:receiverId  (public) — send an anonymous whisper.
// This is the heart of Whisperly: anyone can send, no auth required.
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;
  const { content } = req.body;

  const receiver = await User.findById(receiverId);
  if (!receiver) throw AppError.notFound("Receiver not found");
  if (!receiver.isConfirmed) {
    throw AppError.badRequest("This user cannot receive whispers yet");
  }

  const message = await Message.create({ content, receiver: receiverId });

  res.status(201).json({
    success: true,
    message: "Whisper sent anonymously 🤫",
    data: { id: message._id, createdAt: message.createdAt },
  });
});

// DELETE /message/:id  (protected) — receiver deletes one of their whispers.
export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw AppError.notFound("Message not found");

  if (message.receiver.toString() !== req.user._id.toString()) {
    throw AppError.forbidden("You can only delete your own messages");
  }

  await message.deleteOne();

  res.status(200).json({ success: true, message: "Message deleted" });
});
