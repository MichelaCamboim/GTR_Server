import express from "express";
import AvaliacaoModel from "../model/avaliacao.model.js";
import UserModel from "../model/user.model.js";

const avaliacaoRoute = express.Router();

//CREATE AVALIACAO

avaliacaoRoute.post("/create/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const newAvaliacao = await AvaliacaoModel.create(req.body);
    console.log(newAvaliacao._id);
    console.log(userId);

    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          avaliacao: newAvaliacao._id,
        },
      },
      { new: true, runValidators: true }
    );
    console.log(updateUser);
    return res.status(201).json(newAvaliacao);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//GET ALL

avaliacaoRoute.get("/all", async (req, res) => {
  try {
    const avaliacoes = await AvaliacaoModel.find().populate("user");

    return res.status(200).json(avaliacoes);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//GET ONE

avaliacaoRoute.get("/oneAval/:avalId", async (req, res) => {
  try {
    const { avalId } = req.params;
    console.log(avalId);

    const avaliacao = await AvaliacaoModel.findById(avalId).populate("user");

    if (!avaliacao) {
      return res.status(400).json({ msg: " Usuário não encontrado!" });
    }

    return res.status(200).json(avaliacao);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//UPDATE

avaliacaoRoute.put("/edit/:avalId", async (req, res) => {
  try {
    const { avalId } = req.params;
    console.log(avalId);

    const updatedAval = await AvaliacaoModel.findByIdAndUpdate(
      { _id: avalId },
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

avaliacaoRoute.delete("/delete/:avalId", async (req, res) => {
  try {
    const { avalId } = req.params;

    const deletedAval = await AvaliacaoModel.findByIdAndDelete(avalId);

    if (!deletedAval) {
      return res.status(400).json({ msg: "Avaliação não encontrada!" });
    }

    const allAval = await AvaliacaoModel.find();
    console.log(deletedAval);

    //deletar na collection user TODAS as avaliaçoes deletadas
    await UserModel.deleteMany({ avaliacao: avalId });

    return res.status(200).json(allAval);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

export default avaliacaoRoute;
