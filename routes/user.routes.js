import express from "express";
import bcrypt from "bcrypt";
import generateToken from "../config/jwt.config.js";

import UserModel from "../model/user.model.js";
import TaskModel from "../model/task.model.js";
import ReportModel from "../model/report.model.js";

import isAuth from "../middleware/isAuth.js";
import attachCurrentUser from "../middleware/attachCurrentUser.js";
import isAdmin from "../middleware/isAdmin.js";

const userRoute = express.Router();

const saltRounds = 10;

//---------------------------------------//
// ROUTE SIGN-UP
//---------------------------------------//

userRoute.post("/sign-up", async (req, res) => {
  try {
    const { password } = req.body;

    if (
      !password ||
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#!])[0-9a-zA-Z$*&@#!]{8,}$/
      )
    ) {
      return res
        .status(400)
        .json({ msg: "Password does not meet security policy requirements" });
    }

    const salt = await bcrypt.genSalt(saltRounds); // 10
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    delete newUser._doc.passwordHash;

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//---------------------------------------//
// ROTA LOGIN
//---------------------------------------//

userRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: "Unregistered user" });
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
      delete user._doc.passwordHash;
      const token = generateToken(user);

      return res.status(200).json({
        user: user,
        token: token,
      });
    } else {
      //as senhas são diferentes!!
      return res.status(401).json({ msg: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//---------------------------------------//
// ROTA PROFILE
//---------------------------------------//

userRoute.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    //req.currentUser -> veio do middle attachCurrentUser
    return res.status(200).json(req.currentUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//---------------------------------------//
// ROTAS PERMITIDAS AO ADMIN
//---------------------------------------//

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
    const users = await UserModel.find({}).populate("tasks").populate("report");

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
      .populate("report");

    if (!user) {
      return res.status(400).json({ msg: " User not found!" });
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
      return res.status(400).json({ msg: "User not found!" });
    }

    const users = await UserModel.find();
    console.log(deletedUser);

    await TaskModel.deleteMany({ user: userId });
    await ReportModel.deleteMany({ user: userId });

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

export default userRoute;
