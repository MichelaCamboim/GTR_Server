function isSuperv(req, res, next) {
    if (req.auth.role !== "supervisor") {
      return res
        .status(401)
        .json({ msg: "Unauthorized request!" });
    }
  
    next();
  }
  
  export default isSuperv;