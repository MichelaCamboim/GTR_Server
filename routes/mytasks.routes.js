import express from "express";
import mongoose from "mongoose";
import TaskModel from "../model/task.model.js";
import UserModel from "../model/user.model.js";

const mytasksRoute = express.Router();

mytasksRoute.post("/new", async (req, res) => {
  try {
    const task = await TaskModel.create({
      ...req.body,
      priority: "regular",
      author: req.currentUser._id,
    });

    let user = await UserModel.find(
      { _id: req.currentUser._id },
      { email: 1, tasks: 1 }
    );
    let emails = [];

   
      user.tasks.push(task._id);
      try {
        await user.save();
        emails.push(user.email);
      } catch (e) {
        return res
          .status(500)
          .json({ msg: "error at adding task to all users", log: e.error });
      }
    



    const mailOptions = {
      from: process.env.EMAIL, //nosso email
      to: emails.join(", "), // emails dos usuários
      subject: "[GTR] New Task",
      html: `
          <div>
            <h1>New task assigned to you: "${task.name}"</h1>
            <p>Description: ${task.description}</p>
            <p>Deadline: ${task.deadline}</p>
          </div>
        `,
    };
    console.log("deactivated! [sending e-mail]", mailOptions);
    // await transporter.sendMail(mailOptions);

    return res.status(201).json({ msg: "Task successfuly created." });
  } catch (error) {
    console.log("failed to create a new task");
    return res.status(400).json(error.errors);
  }
});

mytasksRoute.get("/worked_hours/:init/:end", async (req, res) => {
  console.log(req.params.init)
  console.log(req.params.end)
});

mytasksRoute.get("/outoftime", async (req, res) => {
})

mytasksRoute.get("/status/:type", async (req, res) => {
  try {
    const tasks = await TaskModel.find(
      { status: req.params.type },
      { __v: 0, createdAt: 0, updatedAt: 0 }
    ).populate("members", "_id nome matricula");
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json(error.errors);
  }

});

export default mytasksRoute;
