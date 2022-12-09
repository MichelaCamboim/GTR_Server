import express from "express";
import ReportModel from "../model/report.model.js";
import UserModel from "../model/user.model.js";

const reportRoute = express.Router();

//CREATE AVALIACAO

reportRoute.post("/create/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const newReport = await ReportModel.create(req.body);
    console.log(newReport._id);
    console.log(userId);

    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          avaliacao: newReport._id,
        },
      },
      { new: true, runValidators: true }
    );
    console.log(updateUser);
    return res.status(201).json(newReport);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//GET ALL

reportRoute.get("/all", async (req, res) => {
  try {
    const reports = await ReportModel.find().populate("user");

    return res.status(200).json(reports);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//GET ONE

reportRoute.get("/oneReport/:repId", async (req, res) => {
  try {
    const { repId } = req.params;
    console.log(repId);

    const avaliacao = await ReportModel.findById(repId).populate("user");

    if (!avaliacao) {
      return res.status(400).json({ msg: "User not found!" });
    }

    return res.status(200).json(avaliacao);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//UPDATE

reportRoute.put("/edit/:avalId", async (req, res) => {
  try {
    const { repId } = req.params;
    console.log(repId);

    const updatedAval = await ReportModel.findByIdAndUpdate(
      { _id: repId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedAval);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//DELETE

reportRoute.delete("/delete/:repId", async (req, res) => {
  try {
    const { repId } = req.params;

    const deletedReport = await ReportModel.findByIdAndDelete(repId);

    if (!deletedReport) {
      return res.status(400).json({ msg: "Report not found!" });
    }

    const allReport = await ReportModel.find();
    console.log(deletedReport);

    //deletar na collection user TODAS as avaliaçoes deletadas
    await UserModel.deleteMany({ report: repId });

    return res.status(200).json(allReport);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

export default reportRoute;
