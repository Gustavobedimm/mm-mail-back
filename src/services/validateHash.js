require("dotenv").config();
const bcrypt = require("bcryptjs");

module.exports = async (req) => {
  const { authorization = "" } = req.headers;

  return bcrypt.compare(process.env.AUTH_INTEGRATION_SECRET_KEY, authorization);
};
