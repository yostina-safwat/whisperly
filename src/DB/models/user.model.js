import mongoose from "mongoose";

export const UserRoles = {
  USER: "user",
  ADMIN: "admin",
};

export const Gender = {
  MALE: "male",
  FEMALE: "female",
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.MALE,
    },
    role: {
      type: String,
      enum: Object.values(UserRoles),
      default: UserRoles.USER,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        // Never leak the password hash in API responses.
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
