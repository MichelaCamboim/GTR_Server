import { Schema, model } from "mongoose";
import isURL from "validator/es/lib/isURL";
import isEmail from "validator/es/lib/isEmail";
import normalizeEmail from "validator/es/lib/normalizeEmail";
import isMobilePhone from "validator/es/lib/isMobilePhone";

const userSchema = new Schema(
  {
    registration: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    admission: {
      type: Date,
      match:
        /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/,
    },
    photo: {
      type: String,
      trim: true,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
      validate: {
        validator: isURL,
        message: "Photo's url is invalid.",
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      set: normalizeEmail,
      validate: {
        validator: (v) => isEmail(v, { domain_specific_validation: true }),
        message: "Informed e-mail is invalid.",
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        // celular ou telefone fixo
        validator: (v) =>
          isMobilePhone(v, "pt-BR") ||
          v.test(/^(?:(?:\(\d{2}\)|\d{2})[\.\s-]*)?[2-5]\d{3}[\.\s-]?\d{4}$/),
        message: "Telephone number is invalid.",
      },
    },
    timezone: { type: Number },
    workHours: { type: Number },
    department: {
      type: String,
      trim: true,
    },
    jobPosition: {
      type: String,
      trim: true,
    },
    skills: [{ type: String }],
    status: {
      type: String,
      enum: ["Active", "Vacation", "Inactive"],
      default: "Active",
    },
    role: {
      type: String,
      enum: ["admin", "user", "supervisor", "director"],
      default: "user",
    },
    manager: [{ type: String }],
    team: [{ type: String }],
    report: [{ type: Schema.Types.ObjectId, ref: "Report" }],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    chat: [{ type: Schema.Types.ObjectId, ref: "Chatbot" }],
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", userSchema);

export default UserModel;
