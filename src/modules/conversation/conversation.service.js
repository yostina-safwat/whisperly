import Conversation from "../../DB/models/conversation.model.js";
import Message from "../../DB/models/message.model.js";
import AppError from "../../utils/error/appError.js";
import { asyncHandler } from "../../utils/error/errorHandler.js";

/** Load a conversation and make sure the current user is part of it. */
const findMyConversation = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw AppError.notFound("Conversation not found");

  const isParticipant = conversation.participants.some(
    (id) => id.toString() === userId.toString()
  );
  if (!isParticipant) throw AppError.forbidden("You are not part of this conversation");

  return conversation;
};

// GET /conversation  (protected) — my chats, latest first
export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate("participants", "name profileImage")
    .sort({ lastMessageAt: -1 });

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations,
  });
});

// GET /conversation/:id/messages  (protected)
export const getConversationMessages = asyncHandler(async (req, res) => {
  const conversation = await findMyConversation(req.params.id, req.user._id);

  const messages = await Message.find({ conversation: conversation._id })
    .populate("sender", "name profileImage")
    .sort({ createdAt: 1 });

  // Whatever the other person sent me is now read.
  await Message.updateMany(
    { conversation: conversation._id, receiver: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ success: true, count: messages.length, data: messages });
});

// POST /conversation/:id/messages  (protected) — send a message in the chat
export const sendConversationMessage = asyncHandler(async (req, res) => {
  const conversation = await findMyConversation(req.params.id, req.user._id);

  const receiver = conversation.participants.find(
    (id) => id.toString() !== req.user._id.toString()
  );

  const message = await Message.create({
    content: req.body.content,
    sender: req.user._id,
    receiver,
    conversation: conversation._id,
  });

  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  res.status(201).json({ success: true, message: "Message sent", data: message });
});
