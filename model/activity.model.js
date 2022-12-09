import { Schema, model } from "mongoose";

const ActivitySchema = new Schema(
  {
    hours: { type: Number, required: true, default: 0 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("Activity", ActivitySchema);
