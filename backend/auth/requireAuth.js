const { verify } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = verify(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
