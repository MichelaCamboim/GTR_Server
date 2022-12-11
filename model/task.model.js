import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    // required
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // optional
    status: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["started", "rejected", "active", "pending", "done", "archive"],
      default: "started",
    },
    priority: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["high", "regular", "low"],
      default: "regular",
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
    deadline: {
      type: Date,
      trim: true,
      get: (v) => {
        return v.toISOString().split("T")[0];
      },
      default: () => new Date().toISOString().split("T")[0],
      validate: {
        validator: function (v) {
          let today = new Date();
          today.setUTCHours(0, 0, 0, 0);

          if (v < today)
            throw new Error(
              "A data de prazo final deve ser maior que a data de início."
            );

          return true;
        },
      },
    },

    // not strictly required at creation
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    activities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Activity",
      },
    ],
    closed: Date,
    tags: [String],
    annex: [String],
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
