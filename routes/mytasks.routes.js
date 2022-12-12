import express from "express";
import mongoose from "mongoose";
import TaskModel from "../model/task.model.js";
import UserModel from "../model/user.model.js";
import taskRoute from "./task.routes.js"

const mytasksRoute = express.Router();

mytasksRoute.get("/worked_hours/:init/:end", async (req, res) => {
console.log(req.params.init)
console.log(req.params.end)
});

mytasksRoute.get("/outoftime", async (req, res) => {
})

mytasksRoute.get("/status/:type", async (req, res) => {
  try {
    const tasks = await TaskModel.find(
      {status: req.params.type},
      { __v: 0, createdAt: 0, updatedAt: 0 }
    ).populate("members", "_id nome matricula");
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json(error.errors);
  }
    
});

export default mytasksRoute;
