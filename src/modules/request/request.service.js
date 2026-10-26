import Request, { RequestStatus } from "../../DB/models/request.model.js";
import Conversation from "../../DB/models/conversation.model.js";
import User from "../../DB/models/user.model.js";
import AppError from "../../utils/error/appError.js";
import { asyncHandler } from "../../utils/error/errorHandler.js";

const publicUserFields = "name profileImage";

// POST /request/:receiverId  (protected) — ask someone to open a chat
export const sendRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;
  const me = req.user._id;

  if (receiverId === me.toString()) {
    throw AppError.badRequest("You can't send a request to yourself");
  }

  const receiver = await User.findById(receiverId);
  if (!receiver || !receiver.isConfirmed) throw AppError.notFound("User not found");

  const alreadyChatting = await Conversation.exists({
    participants: { $all: [me, receiverId] },
  });
  if (alreadyChatting) throw AppError.conflict("You already have a conversation with this user");

  // A pending request in either direction counts.
  const pending = await Request.exists({
    status: RequestStatus.PENDING,
    $or: [
      { sender: me, receiver: receiverId },
      { sender: receiverId, receiver: me },
    ],
  });
  if (pending) throw AppError.conflict("There is already a pending request between you two");

  const request = await Request.create({ sender: me, receiver: receiverId });

  res.status(201).json({
    success: true,
    message: `Request sent to ${receiver.name}`,
    data: request,
  });
});

// GET /request  (protected) — requests waiting for my answer
export const getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({
    receiver: req.user._id,
    status: RequestStatus.PENDING,
  })
    .populate("sender", publicUserFields)
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: requests.length, data: requests });
});

// GET /request/sent  (protected) — requests I sent
export const getSentRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ sender: req.user._id })
    .populate("receiver", publicUserFields)
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: requests.length, data: requests });
});

// PATCH /request/:id  (protected) — receiver accepts or rejects
export const respondToRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const request = await Request.findById(req.params.id);
  if (!request) throw AppError.notFound("Request not found");
  if (request.receiver.toString() !== req.user._id.toString()) {
    throw AppError.forbidden("Only the receiver can answer this request");
  }
  if (request.status !== RequestStatus.PENDING) {
    throw AppError.badRequest(`This request was already ${request.status}`);
  }

  request.status = status;
  await request.save();

  let conversation = null;
  if (status === RequestStatus.ACCEPTED) {
    conversation = await Conversation.create({
      participants: [request.sender, request.receiver],
    });
  }

  res.status(200).json({
    success: true,
    message: `Request ${status}`,
    data: { request, conversation },
  });
});

// DELETE /request/:id  (protected) — sender cancels a pending request
export const cancelRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw AppError.notFound("Request not found");
  if (request.sender.toString() !== req.user._id.toString()) {
    throw AppError.forbidden("You can only cancel your own requests");
  }
  if (request.status !== RequestStatus.PENDING) {
    throw AppError.badRequest("Only pending requests can be cancelled");
  }

  await request.deleteOne();

  res.status(200).json({ success: true, message: "Request cancelled" });
});
