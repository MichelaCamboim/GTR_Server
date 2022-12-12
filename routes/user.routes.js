import express from "express";
import bcrypt from "bcrypt";
import generateToken from "../config/jwt.config.js";
import nodemailer from "../config/mail.config.js";

import UserModel from "../model/user.model.js";
import TaskModel from "../model/task.model.js";
import ReportModel from "../model/report.model.js";

import isAuth from "../middleware/isAuth.js";
import attachCurrentUser from "../middleware/attachCurrentUser.js";
import isDirector from "../middleware/isDirector.js";
import isSuperv from "../middleware/isSuperv.js";

const userRoute = express.Router();

//------------------------------------------------------//
// SIGN-UP PAGE
//-----------------------------------------------------//

userRoute.post("/sign-up", async (req, res) => {
  try {
    const { password, email } = req.body;

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

    delete newUser._doc.passwordHash;
/* 
    const mailOptions = {
      from: process.env.EMAIL,
      to: email // emails dos usuários
      subject: "[GTR] Ativação de Conta",
      html: `
          <div>
            <h1>${newUser.name} bem vindo ao nosso site. </h1>
            <p>Por favor, confirme seu email clicando no link abaixo.</p>
            <a href=http://localhost:8080/user/activate-account/${newUser._id}>ATIVE SUA CONTA</a>
              </div>
        `,
    }; */
    //envio do email
    //await transporter.sendMail(mailOptions);

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

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
// EDIT
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
// GET ALL
//---------------------------------------//

userRoute.get(
  "/allDir",
  isAuth,
  attachCurrentUser,
  isDirector,
  async (req, res) => {
    try {
      const users = await UserModel.find().populate("tasks").populate("report");

      if (!users) return res.status(400).json({ msg: "Users not found!" });

      console.log(users);

      return res.status(200).json(users);
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
      console.log(deletedUser);

      if (!deletedUser) {
        return res.status(400).json({ msg: "User not found!" });
      }

      await TaskModel.deleteMany({ members: req.currentUser._id });
      await ReportModel.deleteMany({ user: req.currentUser._id });
      const users = await UserModel.find();

      return res.status(200).json(users);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.errors);
    }
  }
);

//--------------------------------------------//
//--------------------------------------------//
// ROUTES ONLY SUPERVISOR AUTHORIZED
//--------------------------------------------//

//---------------------------------------//
// GET USER
//---------------------------------------//

userRoute.get(
  "/allSuperv",
  isAuth,
  attachCurrentUser,
  isSuperv,
  async (req, res) => {
    try {
      const users = await UserModel.find().populate("tasks").populate("report");

      return res.status(200).json(users);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.errors);
    }
  }
);

//---------------------------------------//
// EDIT ROLE: USER, ALLOWED FOR SUPERV OR DIR
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

/*
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

//GET SUPERVISOR/

userRoute.get("/role/:typeN", async (req, res) => {
  try {
    const { typeN } = req.params;
    console.log(typeN);

    const user = await UserModel.findById(typeN)
      .populate("tasks")
      .populate("report")
      .populate("manager", "_id name registration");

    if (!user) {
      return res.status(400).json({ msg: " Usuário não encontrado!" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//GET user/

userRoute.get("/role/:typeN", async (req, res) => {
  try {
    const { typeN } = req.params;
    console.log(typeN);

    const user = await UserModel.findById(typeN)
      .populate("tasks")
      .populate("report")
      .populate("manager", "_id name registration");

    if (!user) {
      return res.status(400).json({ msg: " Usuário não encontrado!" });
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
      return res.status(400).json({ msg: "Usuário não encontrado!" });
    }

    const users = await UserModel.find();
    console.log(deletedUser);

    //deletar TODAS as tarefas e avaliações que são do usuário
    await TaskModel.deleteMany({ user: userId });
    await ReportModel.deleteMany({ user: userId });

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});
*/
export default userRoute;
