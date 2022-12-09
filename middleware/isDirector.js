function isDirector(req, res, next) {
    if (req.auth.role !== "director") {
      return res
        .status(401)
        .json({ msg: "Unauthorized request!" });
    }
  
    next();
  }
  
  export default isDirector;