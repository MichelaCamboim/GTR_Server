import express from "express";
import bcrypt from "bcrypt";
import generateToken from "../config/jwt.config.js";

import UserModel from "../model/user.model.js";
import TaskModel from "../model/task.model.js";
import ReportModel from "../model/report.model.js";

import isAuth from "../middleware/isAuth.js";
import attachCurrentUser from "../middleware/attachCurrentUser.js";
import isDirector from "../middleware/isDirector.js";
import isSuperv from "../middleware/isSuperv.js";

const userRoute = express.Router();

//------------------------------------------------------//
// LOGIN PAGE : ONLY REGISTERED USERS ARE AUTHORIZED
//-----------------------------------------------------//

userRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        msg: "The username or password is not correct. Please try again.",
      });
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
      delete user._doc.passwordHash;

      const token = generateToken(user);

      return res.status(200).json({
        user: user,
        token: token,
      });
    } else {
      return res.status(401).json({
        msg: "The username or password is not correct. Please try again.",
      });
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
    return res.status(200).json(req.currentUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});
//---------------------------------------//
//---------------------------------------//
// ROUTES ONLY DIRECTOR AUTHORIZED
//---------------------------------------//

//---------------------------------------//
// CREATE USER
//---------------------------------------//

const saltRounds = 10;

userRoute.post(
  "/create",
  isAuth,
  attachCurrentUser,
  isDirector,
  async (req, res) => {
    try {
      const { password } = req.body;

      if (
        !password ||
        !password.match(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#!])[0-9a-zA-Z$*&@#!]{8,}$/
        )
      ) {
        return res.status(400).json({
          msg: "Password does not meet security policy requirements. Please try again.",
        });
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
  }
);

//---------------------------------------//
// DELETE USER
//---------------------------------------//

userRoute.delete(
  "/delete",
  isAuth,
  attachCurrentUser,
  isDirector,
  async (req, res) => {
    try {
      const deletedUser = await UserModel.findByIdAndDelete(
        req.currentUser._id
      );

      if (!deletedUser) {
        return res.status(400).json({ msg: "User not found!" });
      }
      const users = await UserModel.find();
      console.log(deletedUser);

      await TaskModel.deleteMany({ author: req.currentUser._id });
      await ReportModel.deleteMany({ user: req.currentUser._id });

      return res.status(200).json(users);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.errors);
    }
  }
);

//--------------------------------------------//
//--------------------------------------------//
// ROUTES AUTHORIZED DIRECTOR AND SUPERVISOR
//--------------------------------------------//

//---------------------------------------//
// GET ALL USERS
//---------------------------------------//

userRoute.get(
  "/all",
  isAuth,
  attachCurrentUser,
  isDirector,
  isSuperv,
  async (req, res) => {
    try {
      const users = await UserModel.find({})
        .populate("tasks")
        .populate("report");

      return res.status(200).json(users);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.errors);
    }
  }
);

//---------------------------------------//
// GET ONE USER
//---------------------------------------//

userRoute.get("/one-user", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const user = await UserModel.findById(req.currentUser._id)
      .populate("tasks")
      .populate("report");

    if (!user) {
      return res.status(400).json({ msg: "User not found!" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});
//---------------------------------------//
// EDIT USER
//---------------------------------------//

userRoute.put("/edit", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.currentUser._id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

export default userRoute;
