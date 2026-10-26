import mongoose from "mongoose";

// A private chat between two users, created when a Request is accepted.
// The messages themselves live in the Message collection (conversation ref).
const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: {
        validator: (value) => value.length === 2,
        message: "A conversation must have exactly 2 participants",
      },
    },
    // Used to sort the conversation list (most recent chat first).
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);
export default Conversation;
