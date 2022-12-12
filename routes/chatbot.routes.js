import express from "express";
import chatbotModel from "../model/chatbot.model.js";

const chatbotRoute = express.Router();

//CREATE CHAT

chatbotRoute.post("/create/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const newChat = await chatbotModel.create(req.body);
    console.log(req.body.input);
    console.log(userId);

    return res.status(201).json(newChat);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//GET ALL CHAT

chatbotRoute.get("/all", async (req, res) => {
  try {
    const chats = await chatbotModel.find();

    return res.status(200).json(chats);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//GET ONE CHAT

chatbotRoute.get("/oneChat/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    console.log(chatId);

    const chat = await chatbotModel.findById(chatId);

    if (!chat) {
      return res.status(400).json({ msg: "Chat not found!" });
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//UPDATE CHAT

chatbotRoute.put("/edit/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    console.log(chatId);

    const updatedChat = await chatbotModel.findByIdAndUpdate(
      { _id: chatId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedChat);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//DELETE CHAT

chatbotRoute.delete("/delete/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;

    const deletedChat = await chatbotModel.findByIdAndDelete(chatId);

    if (!deletedChat) {
      return res.status(400).json({ msg: "Chat not found!" });
    }

    const allChats = await chatbotModel.find();
    console.log(deletedChat);

    return res.status(200).json(allChats);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

export default chatbotRoute;
