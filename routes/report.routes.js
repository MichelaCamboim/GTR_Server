import express from "express";
import ReportModel from "../model/report.model.js";
import UserModel from "../model/user.model.js";
import isAuth from "../middleware/isAuth.js";
import attachCurrentUser from "../middleware/attachCurrentUser.js";
import isSuperv from "../middleware/isSuperv.js";
import isDirector from "../middleware/isDirector.js";
const reportRoute = express.Router();
//CREATE REPORT
reportRoute.post(
  "/create-report",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const newReport = await ReportModel.create({
        ...req.body,
        avaliador: req.currentUser._id,
      });
      //Inserir o usuario a ser avaliado
      const user = await UserModel.findByIdAndUpdate(
        req.body.avaliado,
        {
          $push: { report: newReport._id },
        },
        { new: true, runValidators: true }
      );

      return res.status(201).json(newReport);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.errors);
    }
  }
);
//GET ALL
reportRoute.get("/all", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const reports = await ReportModel.find().populate("avaliado");
    return res.status(200).json(reports);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

reportRoute.get("/avaliado", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const reports = await ReportModel.find({
      avaliado: req.currentUser._id,
    }).populate("avaliador");

    return res.status(200).json(reports);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

reportRoute.get(
  "/avaliador",
  isAuth,
  attachCurrentUser,
  isSuperv,
  async (req, res) => {
    try {
      const reports = await ReportModel.find({
        avaliador: req.currentUser._id,
      }).populate("avaliado");

      return res.status(200).json(reports);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.errors);
    }
  }
);

//GET ONE
reportRoute.get(
  "/oneReport/:reportId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { reportId } = req.params;
      const report = await ReportModel.findById(reportId).populate("user");
      if (!report) return res.status(400).json({ msg: "Report not found!" });

      return res.status(200).json(report);
    } catch (error) {
      return res.status(400).json(error.errors);
    }
  }
);
//UPDATE
reportRoute.put(
  "/edit/:reportId",
  isAuth,
  attachCurrentUser,
  isSuperv,
  async (req, res) => {
    try {
      const { reportId } = req.params;
      console.log(reportId);
      const updatedReport = await ReportModel.findByIdAndUpdate(
        { _id: reportId },
        { ...req.body },
        { new: true, runValidators: true }
      );

      return res.status(200).json(updatedReport);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.errors);
    }
  }
);

//DELETE
reportRoute.delete(
  "/delete/:reportId",
  isAuth,
  attachCurrentUser,
  isSuperv,
  async (req, res) => {
    try {
      const { reportId } = req.params;

      const deletedReport = await ReportModel.findByIdAndDelete(reportId);

      if (!deletedReport) {
        return res.status(400).json({ msg: "Report not found!" });
      }

      const allReports = await ReportModel.find();
      const user = await UserModel.findByIdAndUpdate(
        deletedReport.avaliado,
        {
          $pull: { report: deletedReport._id },
        },
        { new: true, runValidators: true }
      );

      console.log(deletedReport);

      return res.status(200).json(allReports);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.errors);
    }
  }
);

export default reportRoute;
