const UserDto = require("../dtos/UserDto");
const ApiError = require("../exceptions/ApiError");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const TokenService = require("./TokenService");
const TokenModel = require("../models/TokenModel");
const FileService = require("./FileService");
const uuid = require("uuid");
const fs = require("fs");
const path = require("path");

class UserService {
  async deleteAccount(user_id, password) {
    const user = await UserModel.findUserById(user_id);
    if (!user) throw ApiError.BadRequest("Пользователь не найден");
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) throw ApiError.BadRequest("Неверный пароль");

    await UserModel.deleteAccount(user_id);
    await TokenModel.clearTokens(user_id);
    fs.rmSync(path.resolve(__dirname, "..", "users", user_id.toString()), {
      recursive: true,
    });
    const pathToAvatar = path.resolve(__dirname, "..", "static", user.avatar);
    if (fs.existsSync(pathToAvatar)) fs.rmSync(pathToAvatar);
  }

  async changePassword(user_id, password, newPassword) {
    const user = await UserModel.findUserById(user_id);
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) throw ApiError.BadRequest("Неверный пароль");

    const hashedPassword = await bcrypt.hash(newPassword, 3);
    await UserModel.updateProperty("password", hashedPassword, user_id);
  }

  async uploadAvatar(avatar, user_id) {
    const staticPath = path.resolve(__dirname, "..", "static");
    const userFromDb = await UserModel.findUserById(user_id);
    if (userFromDb.avatar === null) userFromDb.avatar = "";
    const pathToAvatar = path.resolve(staticPath, userFromDb.avatar);
    if (fs.existsSync(pathToAvatar)) {
      fs.rmSync(pathToAvatar);
    }
    let avatarName;
    avatarName = uuid.v4() + ".jpg";
    if (!avatar) avatarName = "empty";
    await UserModel.uploadAvatar(avatarName, user_id);
    if (avatar) await avatar.mv(path.join(staticPath, avatarName));

    return avatarName;
  }

  async refresh(refresh, ip, browser, os) {
    if (!refresh) throw ApiError.Unathorized();

    const userData = TokenService.validateRefresh(refresh);
    const tokenFromDatabase = await TokenService.findToken(refresh);

    if (!userData || !tokenFromDatabase) throw ApiError.Unathorized();

    const id = userData.id;
    const user = await UserModel.findUserById(id);

    const payload = new UserDto(user);

    const tokens = await TokenService.generateTokens({ ...payload });
    await TokenModel.removeRefresh(refresh);
    await TokenModel.addRefresh(payload.id, tokens.refresh, ip, payload.email, browser, os);

    return { ...tokens, ...payload };
  }

  async login(user_info, password, ip, browser, os) {
    const user = await UserModel.findUser(user_info);
    if (!user) throw ApiError.BadRequest("Неверное имя или пароль");

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) throw ApiError.BadRequest("Неверное имя или пароль");

    const payload = new UserDto(user);

    const tokens = await TokenService.generateTokens({ ...payload });
    await TokenModel.addRefresh(payload.id, tokens.refresh, ip, payload.email, browser, os);

    return { ...tokens, ...payload };
  }

  async registration(email, username, password, gender, ip, browser, os) {
    const mailCandidate = await UserModel.findUser(email);
    const nameCandidate = await UserModel.findUser(username);
    if (!email || !username || !password || !gender)
      throw ApiError.BadRequest("Ошибка регистрации");
    if (mailCandidate) throw ApiError.BadRequest("Почта занята");
    if (nameCandidate) throw ApiError.BadRequest("Такое имя уже занято");

    const hashedPassword = await bcrypt.hash(password, 3);
    const user = await UserModel.addUser(email, username, hashedPassword, gender, null, ip);
    const payload = new UserDto(user);

    const tokens = await TokenService.generateTokens({ ...payload });
    await TokenModel.addRefresh(payload.id, tokens.refresh, payload.ip, payload.email, browser, os);

    const dir = await FileService.createRootDir(payload.id);
    await UserModel.updateRootDirectory(dir.id, payload.id);
    payload.root_directory = dir.id;

    return { ...tokens, ...payload };
  }
}

module.exports = new UserService();
