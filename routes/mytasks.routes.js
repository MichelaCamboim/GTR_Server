import express from "express";
import mongoose from "mongoose";
import TaskModel from "../model/task.model.js";
import UserModel from "../model/user.model.js";
import taskRoute from "./task.routes.js"

const mytasksRoute = express.Router();

mytasksRoute.get("/worked_hours/:init/:end", async (req, res) => {
console.log(req.params.init)
console.log("oi")
console.log(req.params.end)
});

mytasksRoute.get("/status/type", async (req, res) => {
  
});


mytasksRoute.get("/assigned", async (req, res) => {

});




export default mytasksRoute;
