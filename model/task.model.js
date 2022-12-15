import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    // required
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
    },

    // optional
    deadline: {
      type: Date,
      get: (v) => {
        return v.toISOString().split("T")[0];
      },
      default: () => new Date().toISOString().split("T")[0],
    },
    estimated: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => {
          return /^(?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9])$/.test(v);
        },
        message:
          "Estimated time should be in HH:MM format. Informed string is invalid: {VALUE}",
      },
    },
    priority: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["high", "regular", "low"],
      default: "regular",
    },
    status: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["started", "rejected", "active", "pending", "done", "archive"],
      default: "started",
    },

    // not strictly required at creation

    activities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Activity",
      },
    ],
    annex: [String],
    closed: Date,
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [String],
  },
  {
    timestamps: {
      createdAt: true,
    },
    toJSON: {
      getters: true,
    },
  }
);

const TaskModel = model("Task", taskSchema);

export default TaskModel;
