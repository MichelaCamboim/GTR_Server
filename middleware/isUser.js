function isUser(req, res, next) {
    if (req.auth.role !== "user") {
      return res
        .status(401)
        .json({ msg: "Unauthorized request!" });
    }
  
    next();
  }
  
  export default isUser;