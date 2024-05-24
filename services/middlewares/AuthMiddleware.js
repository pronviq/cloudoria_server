const ApiError = require("../exceptions/ApiError");
const TokenService = require("../services/TokenService");

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(ApiError.Unathorized());
    }

    const access = authHeader.split(" ")[1];
    if (!access) {
      return next(ApiError.Unathorized());
    }

    const userData = TokenService.validateAccess(access);
    if (!userData) {
      return next(ApiError.Unathorized());
    }

    req.user = userData;
    next();
  } catch (error) {
    return next(ApiError.Unathorized());
  }
};
