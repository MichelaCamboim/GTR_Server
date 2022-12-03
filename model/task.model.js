import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {},
  {
    timestamps: true,
  }
);

const TaskModel = model("Task", taskSchema);

export default TaskModel;
