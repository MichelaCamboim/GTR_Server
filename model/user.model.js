import { Schema, model } from "mongoose";
/* import isURL from "validator/es/lib/isURL.js";
import isEmail from "validator/es/lib/isEmail.js";
import normalizeEmail from "validator/es/lib/normalizeEmail.js";
import isMobilePhone from "validator/es/lib/isMobilePhone.js"; */
import validator from "validator";

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
    },
    photo: {
      type: String,
      trim: true,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
      validate: {
        validator: validator.isURL,
        message: "Photo's url is invalid.",
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      set: validator.normalizeEmail,
      validate: {
        validator: (v) =>
          validator.isEmail(v, { domain_specific_validation: true }),
        message: "Informed e-mail is invalid.",
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        // celular ou telefone fixo
        validator: (v) =>
          validator.isMobilePhone(v, "pt-BR") ||
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
