const { validationResult } = require("express-validator");
const UserService = require("../services/UserService");
const ApiError = require("../exceptions/ApiError");
const TokenModel = require("../models/TokenModel");
const UserModel = require("../models/UserModel");

const cookieSettings = {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "Strict",
  // secure: true,
};

// console.log(cookieSettings);

class UserController {
  async updateTheme(req, res, next) {
    try {
      const { theme } = req.body;
      const user_id = req.user.id;
      await UserModel.updateProperty("theme", theme, user_id);

      res.status(200).json();
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { user_info, password } = req.body;
      const user = await UserService.login(user_info, password);

      res
        .cookie("refreshToken", user.refresh, {
          ...cookieSettings,
        })
        .status(200)
        .json(user);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      await TokenModel.removeRefresh(refreshToken);

      res.clearCookie("refreshToken").status(200).json();
    } catch (error) {
      next(error);
    }
  }

  async registration(req, res, next) {
    try {
      const { email, username, password, gender } = req.body;
      const user = await UserService.registration(email, username, password, gender);

      res
        .cookie("refreshToken", user.refresh, {
          ...cookieSettings,
        })
        .status(200)
        .json(user);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      // console.log("refresh", refreshToken);
      const user = await UserService.refresh(refreshToken);

      res
        .cookie("refreshToken", user.refresh, {
          ...cookieSettings,
        })
        .status(200)
        .json(user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
