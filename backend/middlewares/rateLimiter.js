const rateLimit = require("express-rate-limit");

exports.global = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

exports.auth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});
