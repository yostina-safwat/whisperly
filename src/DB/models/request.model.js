import mongoose from "mongoose";

export const RequestStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

// A chat request: "I want to talk to you (not anonymously)". Once the
// receiver accepts it, a Conversation is opened between the two.
const requestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
    },
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING,
    },
  },
  { timestamps: true }
);

// Only one pending request between the same two people at a time.
requestSchema.index(
  { sender: 1, receiver: 1 },
  { unique: true, partialFilterExpression: { status: RequestStatus.PENDING } }
);

const Request =
  mongoose.models.Request || mongoose.model("Request", requestSchema);
export default Request;
