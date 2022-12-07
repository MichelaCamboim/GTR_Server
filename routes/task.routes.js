import express from "express";
import mongoose from "mongoose";
import TaskModel from "../model/task.model.js";
import UserModel from "../model/user.model.js";

const taskRoute = express.Router();

taskRoute.post("/new", async (req, res) => {
  try {
    const task = await TaskModel.create(req.body);

    try {
      await UserModel.updateMany(
        { _id: { $in: task.membros } },
        { $push: { tasks: task._id } },
        { runValidators: true }
      );
    } catch (error) {
      return res.status(500).json({ message: error.errors });
    }

    return res.status(201).json(task);
  } catch (error) {
    return res.status(400).json(error.errors);
  }
});

taskRoute.get("/all", async (_, res) => {
  try {
    const tasks = await TaskModel.find(
      {},
      { __v: 0, createdAt: 0, updatedAt: 0 }
    ).populate("membros", "_id nome matricula");
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json(error.errors);
  }
});

taskRoute.get("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await TaskModel.findById(taskId).populate(
      "membros",
      "_id nome matricula"
    );
    if (!task) return res.status(400).json({ msg: "Usuário não encontrado!" });

    return res.status(200).json(task);
  } catch (error) {
    return res.status(400).json(error.errors);
  }
});

taskRoute.put("/:taskId", async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await TaskModel.findByIdAndUpdate(taskId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) throw new Error("Tarefa não encontrada");

    // adiciona a task aos usuários atribuídos, caso ainda não conste nas tasks
    await UserModel.updateMany(
      {
        _id: { $in: task.membros },
      },
      { $addToSet: { tasks: taskId } },
      { runValidators: true }
    );
    // remove a task dos usuários que não atribuídos à ela
    await UserModel.updateMany(
      { _id: { $nin: task.membros }, tasks: taskId },
      {
        $pull: { tasks: taskId },
      }
    );
    return res.status(200).json(task);
  } catch (error) {
    console.log(error);
    res.status(400).json("message" in error ? { msg: error.message } : error);
  }
});

taskRoute.delete("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await TaskModel.findByIdAndDelete(taskId);
    if (!task) return res.status(400).json({ msg: "Usuário não encontrado!" });

    await TaskModel.updateMany({ task: taskId }, { $pull: { tasks: taskId } });

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json(error.errors);
  }
});

export default taskRoute;
