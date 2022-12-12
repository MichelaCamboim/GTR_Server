import { Schema, model } from "mongoose";
import isURL from "validator/es/lib/isURL";
import isEmail from "validator/es/lib/isEmail";
import normalizeEmail from "validator/es/lib/normalizeEmail";
import isMobilePhone from "validator/es/lib/isMobilePhone";

const userSchema = new Schema(
  {
    // required
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    registration: {
      type: Number,
      unique: true,
      required: true,
    },

    // optional -> default
    director: {
      type: Boolean,
      default: false,
    },
    inactive: {
      type: Boolean,
      default: false,
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
    role: {
      type: String,
      enum: ["admin", "user", "supervisor", "director"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["Active", "Vacation", "Inactive"],
      default: "Active",
    },
    supervisor: {
      type: Boolean,
      default: false,
    },

    // not strictly required at creation
    admission: Date,
    codUser: Number,
    departament: {
      type: String,
      trim: true,
    },
    jobPosition: {
      type: String,
      trim: true,
    },
    manager: [String],
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
    report: [{ type: Schema.Types.ObjectId, ref: "Report" }],
    skills: [String],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    team: [String],
    timezone: Number,
    workHours: Number,
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", userSchema);

export default UserModel;
