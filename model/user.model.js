import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    registration: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    admission: {
      type: Date,
      match:
        /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/,
    },
    photo: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm,
    },
    phone: {
      type: Number,
      match: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    },
    timezone: { type: Number },
    workHours: { type: Number },
    codUser: { type: Number },
    departament: {
      type: String,
      trim: true,
    },
    jobPosition: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Vacation", "Inactive"],
      default: "Active",
    },
    role: {
      type: String,
      enum: ["admin", "user", "supervisor"],
      default: "user",
    },
    passwordHash: { type: String, required: true },
    skills: [{ type: String }],
    report: [{ type: Schema.Types.ObjectId, ref: "Report" }],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", userSchema);

export default UserModel;
