// backend/middlewares/requireMaster.js

module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "MASTER_ADMIN") {
    return res.status(403).json({
      error: "Master admin access required",
    });
  }

  next();
};
