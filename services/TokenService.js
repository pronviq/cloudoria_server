const jwt = require("jsonwebtoken");
const TokenModel = require("../models/TokenModel");
const ApiError = require("../exceptions/ApiError");

class TokenService {
  async findToken(refresh) {
    try {
      const tokenData = TokenModel.findRefresh(refresh);
      return tokenData;
    } catch (error) {
      throw new ApiError.ServerError(error.message);
    }
  }

  validateAccess(access) {
    try {
      const user = jwt.verify(access, process.env.JWT_ACCESS);
      return user;
    } catch (error) {
      return null;
    }
  }

  validateRefresh(refresh) {
    try {
      const user = jwt.verify(refresh, process.env.JWT_REFRESH);
      return user;
    } catch (error) {
      return null;
    }
  }

  async generateTokens(payload) {
    try {
      const access = jwt.sign(payload, process.env.JWT_ACCESS, {
        expiresIn: process.env.ACCESS_EXPIRES,
      });
      const refresh = jwt.sign(payload, process.env.JWT_REFRESH, {
        expiresIn: process.env.REFRESH_EXPIRES,
      });

      return { access, refresh };
    } catch (error) {
      throw new ApiError.ServerError(error.message);
    }
  }
}

module.exports = new TokenService();
