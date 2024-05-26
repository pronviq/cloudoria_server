module.exports = function (req, res, next) {
  const ip = req.ip.split(":").pop();
  next();
};
