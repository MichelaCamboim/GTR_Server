import { Schema, model } from "mongoose";

const chatbotSchema = new Schema(
  {},
  {
    timestamps: true,
  }
);

const chatbotModel = model("Chatbot", chatbotSchema);

export default chatbotModel;
