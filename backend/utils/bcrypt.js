const bcrypt = require("bcrypt");

exports.hash = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

exports.compare = (password, hash) => {
  return bcrypt.compare(password, hash);
};
