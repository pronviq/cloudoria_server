const UserService = require("../services/UserService");
const TokenModel = require("../models/TokenModel");
const UserModel = require("../models/UserModel");
const parser = require("ua-parser-js");
const ApiError = require("../exceptions/ApiError");
const fs = require("fs");
const path = require("path");
const TokenService = require("../services/TokenService");

const cookieSettings = {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "Strict",
  // secure: true,
};

class UserController {
  async deleteAccount(req, res, next) {
    try {
      const { password } = req.body;
      const user_id = req.user.id;
      await UserService.deleteAccount(user_id, password);
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  }

  async getAvatar(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) throw ApiError.Unathorized();

      const user = TokenService.validateRefresh(refreshToken);
      if (!user) throw ApiError.Unathorized();

      const user_id = user.id;
      const userFromDb = await UserModel.findUserById(user_id);

      const avatarPath = path.resolve(__dirname, "..", "static", userFromDb.avatar);
      if (fs.existsSync(avatarPath)) {
        return res.sendFile(avatarPath);
      }
      res.status(200).json();
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      const user_id = req.user.id;
      let avatar;
      if (req.files) avatar = req.files.file;
      const avatarName = await UserService.uploadAvatar(avatar, user_id);
      res.status(200).json(avatarName);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async changeEmail(req, res, next) {
    try {
      const { email } = req.body;
      const user_id = req.user.id;
      const user = await UserModel.findUser(email);
      if (user) return next(ApiError.BadRequest("Такая почта уже занята"));
      if (user) console.log("user exits");
      await UserModel.updateProperty("email", email, user_id);
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  }

  async changeUsername(req, res, next) {
    try {
      const { username } = req.body;
      const user_id = req.user.id;
      const user = await UserModel.findUser(username);
      if (user) return next(ApiError.BadRequest("Такое имя уже занято"));
      await UserModel.updateProperty("username", username, user_id);
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { password, newPassword } = req.body;
      const user_id = req.user.id;
      await UserService.changePassword(user_id, password, newPassword);
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  }

  async terminateSession(req, res, next) {
    try {
      const { id } = req.query;
      const user_id = req.user.id;
      const data = await TokenModel.terminateSession(id, user_id);
      if (!data.length) return next(ApiError.BadRequest("Сессия не найдена"));
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
