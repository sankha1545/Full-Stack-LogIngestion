const { OAuth2Client } = require("google-auth-library");
const prisma = require("@prisma/client").PrismaClient;
const { signToken } = require("./jwt");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const db = new prisma();

exports.googleAuth = async (req, res) => {
  const { token } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const { email } = ticket.getPayload();

  let user = await db.user.findUnique({ where: { email } });

  if (!user) {
    user = await db.user.create({
      data: { email, provider: "google" }
    });
  }

  res.json({ token: signToken(user) });
};
