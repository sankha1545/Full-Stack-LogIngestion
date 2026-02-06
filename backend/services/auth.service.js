const prisma = require("@prisma/client").PrismaClient;
const db = new prisma();

const { hash, compare } = require("../utils/bcrypt");

exports.signup = async (email, password) => {
  return db.user.create({
    data: { email, password: await hash(password) },
  });
};

exports.login = async (email, password) => {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.password) return null;

  const ok = await compare(password, user.password);
  return ok ? user : null;
};
