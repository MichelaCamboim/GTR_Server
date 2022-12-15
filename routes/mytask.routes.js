import express from "express";
import mongoose from "mongoose";
import TaskModel from "../model/task.model.js";
import UserModel from "../model/user.model.js";
import isAuth from "../middleware/isAuth.js";
import attachCurrentUser from "../middleware/attachCurrentUser.js";
import isSuperv from "../middleware/isSuperv.js";



const mytaskRoute = express.Router();

mytaskRoute.get("/notassigned", isAuth, attachCurrentUser, async (req, res) => {
 
 try {
    const tasks = await TaskModel.find(
      {members: []} ,
      { __v: 0 },
      { sort: { deadline: 1, priority: 1 } }
    )
    return res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});



mytaskRoute.get("/my", isAuth, attachCurrentUser, async (req, res) => {
  const myId = req.currentUser._id;   
     
  try {
    const tasks = await TaskModel.find(
      { members: ObjectId(myId) },
      { __v: 0 },
      { sort: { deadline: 1, priority: 1 } }
    )
    return res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});





mytaskRoute.post("/new", async (req, res) => {
  const id =req.currentUser.id;    
  try {
    const task = await TaskModel.create({
      ...req.body,
      author: req.currentUser._id,
    });

    let users = await UserModel.find(
      { _id: task.members },
      { email: 1, tasks: 1 }
    );
    let emails = [];

    for (let user of users) {
      user.tasks.push(task._id);
      try {
        await user.save();
        emails.push(user.email);
      } catch (e) {
        return res
          .status(500)
          .json({ msg: "error at adding task to all users", log: e.error });
      }
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

mytaskRoute.get("/worked_hours/:init/:end", async (req, res) => {
  console.log(req.params.init)
  console.log(req.params.end)
});

mytaskRoute.get("/outoftime", async (req, res) => {
})

mytaskRoute.get("/status/:type", async (req, res) => {
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

export default mytaskRoute;
