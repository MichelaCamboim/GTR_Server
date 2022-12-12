/* import { Schema, model } from "mongoose";
import cod from "../chatConfig/cod.js";

const chatbotSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    codCorrent: {
      type: Number,
      default: cod(),
    },
    input: { type: String },
    output: {
      type: String,
      default: "Desculpe, não entendi.",
    },
    users: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const chatbotModel = model("Chatbot", chatbotSchema);

export default chatbotModel;
 */