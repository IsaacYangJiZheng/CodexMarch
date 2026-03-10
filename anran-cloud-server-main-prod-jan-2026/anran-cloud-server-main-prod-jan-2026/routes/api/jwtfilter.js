const jwt = require("jsonwebtoken");
const config = process.env;
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    var newToken = token.replace("Bearer ", "");
    const decoded = jwt.verify(newToken, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    // console.log(err);
    return res.status(401).send({ message: "Invalid Token" });
  }
  return next();
};
module.exports = verifyToken;
