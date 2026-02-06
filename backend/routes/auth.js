const router = require("express").Router();
const { signup, login } = require("../services/auth.service");
const { sign } = require("../utils/jwt");
const rateLimiter = require("../middlewares/rateLimiter");

router.post("/signup", rateLimiter.auth, async (req, res) => {
  const user = await signup(req.body.email, req.body.password);
  res.json({ token: sign({ id: user.id, email: user.email }) });
});

router.post("/login", rateLimiter.auth, async (req, res) => {
  const user = await login(req.body.email, req.body.password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ token: sign({ id: user.id, email: user.email }) });
});

module.exports = router;
