import express from "express";
import bcrypt from "bcrypt";
import generateToken from "../config/jwt.config.js";

import UserModel from "../model/user.model.js";
import TaskModel from "../model/task.model.js";
import ReportModel from "../model/report.model.js";

import isAuth from "../middleware/isAuth.js";
import attachCurrentUser from "../middleware/attachCurrentUser.js";
import isSuperv from "../middleware/isSuperv.js";

const userRoute = express.Router();

//------------------------------------------------------//
// SIGN-UP PAGE
//-----------------------------------------------------//

userRoute.post("/sign-up", async (req, res) => {
  try {
    const { password, email } = req.body;
    console.log("rota sig-up");
    if (
      !password ||
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#!])[0-9a-zA-Z$*&@#!]{8,}$/
      )
    ) {
      return res.status(400).json({
        msg: "Password does not meet minimum security requirements. Password length: minimum eight characters. Numeric characters: minimum of two numbers. Special Characters: minimum of one special character. Capital letters: minimum of one capital letter. Lowercase: minimum of one lowercase letter. Please type again.",
      });
    }

    const salt = await bcrypt.genSalt(saltRounds);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });
    console.log(newUser);

    delete newUser._doc.passwordHash;

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//--------------------------------//
// LOGIN PAGE
//--------------------------------//

userRoute.post("/login", async (req, res) => {
  try {
    console.log("rota login");

    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email })
      .populate("team", "_id registration name")
      .populate("manager", "_id registration name")
      .populate("tasks")
      .populate("report");
    console.log(user);
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
// CREATE USER
//---------------------------------------//

const saltRounds = 10;

userRoute.post(
  "/create",
  isAuth,
  attachCurrentUser,
  isSuperv,
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
// SUPERVISOR GET ALL
//---------------------------------------//

// se for role = director, pode ver todo mundo, menos o seu dado.
userRoute.get("/all", isAuth, attachCurrentUser, isSuperv, async (req, res) => {
  try {
    const dir = req.currentUser._id;
    const user = await UserModel.find({ dir: { $ne: req.currentUser._id } })
      .populate("team", "_id registration name")
      .populate("manager", "_id registration name")
      .populate("tasks")
      .populate("report");

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});
//---------------------------------------//
// DELETE USER
//---------------------------------------//

userRoute.delete("/delete/:userId", isAuth, isSuperv, async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    console.log(deletedUser);

    if (!deletedUser) {
      return res.status(400).json({ msg: "User not found!" });
    }

    await TaskModel.updateMany({ $pull: { members: userId } });
    await ReportModel.deleteMany({ user: userId });

    return res.status(200).json();
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//---------------------------------------//
// SUVERVISOR GET BY ID DO USER
//---------------------------------------//

userRoute.get(
  "/one/:userId",
  isAuth,
  attachCurrentUser,
  isSuperv,
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(userId);
      console.log(req.params);

      const user = await UserModel.findById(userId)
        .populate("tasks")
        .populate("report");

      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.errors);
    }
  }
);

//---------------------------------------//
// GET OWN PROFILE
//---------------------------------------//

userRoute.get("/:userId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    console.log(req.params);

    const user = await UserModel.findById(userId)
      .populate("tasks")
      .populate("report");

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//---------------------------------------//
// EDIT OWN PROFILE
//---------------------------------------//

userRoute.put("/edit", isAuth, attachCurrentUser, async (req, res) => {
  try {
    console.log(req.body);
    console.log("estou no edit do user");

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

//---------------------------------------//
// EDIT BYID FOR SUPERVISOR
//---------------------------------------//

userRoute.put("/edit/:userId", isAuth, isSuperv, async (req, res) => {
  try {
    console.log(req.body);
    console.log("estou no edit do chefe");

    const { userId } = req.params;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
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
