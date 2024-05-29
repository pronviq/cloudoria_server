const UserService = require("../services/UserService");
const TokenModel = require("../models/TokenModel");
const UserModel = require("../models/UserModel");
const parser = require("ua-parser-js");
const ApiError = require("../exceptions/ApiError");

const cookieSettings = {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "Strict",
  // secure: true,
};

class UserController {
  async terminateSession(req, res, next) {
    try {
      const { id } = req.query;
      const user_id = req.user.id;
      const data = await TokenModel.terminateSession(id, user_id);
      if (!data.length) next(ApiError.BadRequest("Сессия не найдена"));
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req, res, next) {
    try {
      const user_id = req.user.id;
      const data = await TokenModel.getSessions(user_id);
      const { refreshToken } = req.cookies;
      const index = data.findIndex((v) => v.token === refreshToken);

      index !== -1 ? (data[index].isCurrent = true) : null;
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

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
      const ua = parser(req.headers["user-agent"]);
      const browser = ua.browser.name;
      const ip = req.ip.split(":").pop();
      const os = ua.os.name;

      const user = await UserService.login(user_info, password, ip, browser, os);

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
      const ip = req.ip.split(":").pop();
      const ua = parser(req.headers["user-agent"]);
      const browser = ua.browser.name;
      const os = ua.os.name;
      const user = await UserService.registration(
        email,
        username,
        password,
        gender,
        ip,
        browser,
        os
      );

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
      const ua = parser(req.headers["user-agent"]);
      const browser = ua.browser.name;
      const ip = req.ip.split(":").pop();
      const os = ua.os.name;
      const user = await UserService.refresh(refreshToken, ip, browser, os);

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
