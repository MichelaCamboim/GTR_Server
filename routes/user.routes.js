import express from "express";
import UserModel from "../model/user.model.js";
import TaskModel from "../model/task.model.js";
import AvaliacaoModel from "../model/avaliacao.model.js";

const userRoute = express.Router();

//CREATE USER

userRoute.post("/create", async (req, res) => {
  try {
    const newUser = await UserModel.create(req.body);
    console.log(req.body);

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//GET ALL USERS

userRoute.get("/all", async (req, res) => {
  try {
    const users = await UserModel.find({})
      .populate("tasks")
      .populate("avaliacao");

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//GET ONE USER

userRoute.get("/oneUser/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    const user = await UserModel.findById(userId)
      .populate("tasks")
      .populate("avaliacao");

    if (!user) {
      return res.status(400).json({ msg: " Usuário não encontrado!" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

// EDIT USER

userRoute.put("/edit/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    const updatedUser = await UserModel.findByIdAndUpdate(
      { _id: userId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//DELETE USER

userRoute.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(400).json({ msg: "Usuário não encontrado!" });
    }

    const users = await UserModel.find();
    console.log(deletedUser);

    //deletar TODAS as tarefas e avaliações que são do usuário
    await TaskModel.deleteMany({ user: userId });
    await AvaliacaoModel.deleteMany({ user: userId });

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});



export default userRoute;
