import express from "express";
// import transporter from "../config/mail.config.js";
import ActivityModel from "../model/activity.model.js";
import UserModel from "../model/user.model.js";
import isAuth from "../middleware/isAuth.js";
import attachCurrentUser from "../middleware/attachCurrentUser.js";

const activityRoute = express.Router();

activityRoute.post("/new", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const activity = await ActivityModel.create({
      ...req.body,
      author: req.currentUser._id,
    });

    return res
      .status(201)
      .json({ activity, msg: "Activity successfuly registred." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error });
  }
});

export default activityRoute;
