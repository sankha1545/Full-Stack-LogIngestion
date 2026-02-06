const bcrypt = require("bcryptjs");
const prisma = require("@prisma/client").PrismaClient;
const { signToken } = require("./jwt");

const db = new prisma();

exports.signup = async (req, res) => {
  const { email, password, role } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: { email, password: hashed, role }
  });

  res.json({ token: signToken(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ token: signToken(user) });
};
