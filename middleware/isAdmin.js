function isAdmin(req, res, next) {
  if (req.auth.role !== "admin") {
    return res
      .status(401)
      .json({ msg: "Unauthorized request!" });
  }

  next();
}

export default isAdmin;
