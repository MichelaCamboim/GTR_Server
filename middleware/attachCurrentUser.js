import UserModel from "../model/user.model.js";

async function attachCurrentUser(req, res, next) {
  try {
    const userData = req.auth; // -> _id, email, role

    const user = await UserModel.findById(userData._id, { passwordHash: 0 });

    if (!user) {
      return res.status(400).json({ msg: "Usuário não encontrado" });
    }

    req.currentUser = user;

    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
}

export default attachCurrentUser;
