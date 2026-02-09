const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

exports.sign = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
};

exports.verify = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
