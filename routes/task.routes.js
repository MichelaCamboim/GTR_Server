import express from "express";
// import transporter from "../config/mail.config.js";
import TaskModel from "../model/task.model.js";
import UserModel from "../model/user.model.js";
import isAuth from "../middleware/isAuth.js";
import attachCurrentUser from "../middleware/attachCurrentUser.js";

const taskRoute = express.Router();

taskRoute.post("/new", isAuth, attachCurrentUser, async (req, res) => {
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

taskRoute.get("/all", isAuth, attachCurrentUser, async (req, res) => {
  let ids;

  if (req.currentUser.role === "user") {
    ids = req.currentUser.tasks.map((task) => task._id); // get user's tasks ids
  } else {
    let users = req.currentUser.team; // get team's tasks ids

    if (!users)
      return res
        .status(200)
        .json({ msg: `${req.currentUser.role}'s team is empty.` });

    let tasks = await UserModel.find({ _id: { $in: users } }, { tasks: 1 });
    ids = tasks.reduce((acc, { tasks }) => {
      acc.push(...tasks);
      return acc;
    }, []);
  }

  try {
    const tasks = await TaskModel.find(
      { $or: [{ _id: ids }, { author: req.currentUser._id }] },
      { __v: 0 },
      { sort: { deadline: 1, priority: 1 } }
    )
      .populate("members", "_id name registration")
      .populate("author", "_id name registration")
      .populate("activities");

    return res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
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
    if (!task) return res.status(400).json({ msg: "Task not found!" });

    return res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.errors);
  }
});

taskRoute.put("/:taskId", isAuth, attachCurrentUser, async (req, res) => {
  const { taskId } = req.params;
  let updateObj = req.body;

  if (req.currentUser.role === "user") {
    updateObj = {};
    // user's allowed updates
    let keys = ["status", "annex"];
    for (let key of keys) {
      if (key in req.body) updateObj[key] = req.body[key];
    }
  }

  try {
    const task = await TaskModel.findById(taskId);
    if (!task) throw new Error("Task not found!");

    if ("members" in updateObj) {
      function diff(array1, array2) {
        return array1.filter((item1) => array2.indexOf(item1) === -1);
      }

      let OgAsString = task.members.map((member) => member.toString());

      let removedMembers = diff(OgAsString, updateObj.members);
      let insertedMembers = diff(updateObj.members, OgAsString);

      if (removedMembers.length) {
        await UserModel.updateMany(
          { _id: { $in: removedMembers } },
          {
            $pull: { tasks: taskId },
          }
        );
      }

      if (insertedMembers.length) {
        let emails = [];
        for (let memberId of insertedMembers) {
          let user = await UserModel.findByIdAndUpdate(
            memberId,
            {
              $addToSet: { tasks: taskId },
            },
            {
              runValidators: true,
              new: true,
              select: "email",
            }
          );
          emails.push(user.email);
        }

        const mailOptions = {
          from: process.env.EMAIL,
          to: emails.join(", "),
          subject: "[GTR] New Task",
          html: `
              <div>
                <h1>${task.name} was assigned to you</h1>
                <p>${task.description}</p>
                <p>${task.deadline}</p>
              </div>
            `,
        };
        console.log("deactivated! [sending e-mail]", mailOptions);
        // await transporter.sendMail(mailOptions);
      }
    }

    if ("annex" in updateObj) {
      console.log(
        "not implemented! should save the file in cloudnary and store the url"
      );
    }

    for (let key in updateObj) {
      task[key] = updateObj[key];
    }
    await task.save();

    return res.status(200).json({ msg: "Task successfully updated!" });
  } catch (error) {
    console.log(error);
    res.status(400).json("message" in error ? { msg: error.message } : error);
  }
});

taskRoute.delete("/:taskId", isAuth, attachCurrentUser, async (req, res) => {
  if (req.currentUser.role === "user")
    return res.status(401).json({ msg: "Unauthorized request!" });

  try {
    const { taskId } = req.params;
    const task = await TaskModel.findByIdAndDelete(taskId);

    if (!task) return res.status(400).json({ msg: "Task not found!" });
    await TaskModel.updateMany({ task: taskId }, { $pull: { tasks: taskId } });

    return res.status(200).json({ msg: "Task successfully deleted!" });
  } catch (error) {
    return res.status(500).json(error.errors);
  }
});

export default taskRoute;
