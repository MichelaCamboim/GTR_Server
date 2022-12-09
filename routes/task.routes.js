import express from "express";
import mongoose from "mongoose";
import TaskModel from "../model/task.model.js";
import UserModel from "../model/user.model.js";
import isAdmin from "../middleware/isAdmin.js";
import isAuth from "../middleware/isAuth.js";
import attachCurrentUser from "../middleware/attachCurrentUser.js";

const taskRoute = express.Router();

taskRoute.post("/new", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const task = await TaskModel.create({
      ...req.body,
      author: req.currentUser._id,
    });

    try {
      await UserModel.updateMany(
        { _id: { $in: task.members } },
        { $push: { tasks: task._id } },
        { runValidators: true }
      );
    } catch (error) {
      console.log("failed to push the task to users tasks");
      return res.status(500).json({ message: error.errors });
    }

    return res.status(201).json({ msg: "The task successfuly created." });
  } catch (error) {
    console.log("failed to create a new task");
    return res.status(400).json(error.errors);
  }
});

taskRoute.get("/all", isAuth, attachCurrentUser, async (_, res) => {
  let ids;

  if (req.user.role === "user") {
    // get user tasks ids
    ids = req.user.role;
  } else {
    // get supervisor's subordinates tasks ids
    users = req.user.subordinates;

    if (!users)
      return res.status(400).json({ msg: "User doesn't have subordinates" });

    let tasks = await UserModel.find({ _id: { $in: users } }, { tasks: 1 });
    ids = tasks.reduce((acc, { tasks }) => {
      acc.push(...tasks);
      return acc;
    }, []);
  }

  try {
    const tasks = await TaskModel.find({ _id: { $in: ids } }, { __v: 0 })
      .populate("members", "_id name registration")
      .populate("author", "_id name registration")
      .populate("activities");
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json(error.errors);
  }
});

taskRoute.get("/:taskId", isAuth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await TaskModel.findById(taskId)
      .populate("members", "_id name registration")
      .populate("author", "_id name registration")
      .populate("activities");
    if (!task) return res.status(400).json({ msg: "Usuário não encontrado!" });

    return res.status(200).json(task);
  } catch (error) {
    return res.status(400).json(error.errors);
  }
});

taskRoute.put(
  "/:taskId",
  isAuth,
  attachCurrentUser,
  isSupervisor,
  async (req, res) => {
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
  }
);

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
