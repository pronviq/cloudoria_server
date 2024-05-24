const UserDto = require("../dtos/UserDto");
const ApiError = require("../exceptions/ApiError");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const TokenService = require("./TokenService");
const TokenModel = require("../models/TokenModel");
const FileService = require("./FileService");

class UserService {
  async refresh(refresh) {
    if (!refresh) throw ApiError.Unathorized();

    const userData = TokenService.validateRefresh(refresh);
    const tokenFromDatabase = await TokenService.findToken(refresh);

    if (!userData || !tokenFromDatabase) throw ApiError.Unathorized();

    const id = userData.id;
    const user = await UserModel.findUserById(id);

    const payload = new UserDto(user);

    const tokens = await TokenService.generateTokens({ ...payload });
    await TokenModel.updateRefresh(payload.email, tokens.refresh);

    return { ...tokens, ...payload };
  }

  async login(user_info, password) {
    const user = await UserModel.findUser(user_info);
    if (!user) throw ApiError.BadRequest("Неверное имя или пароль");

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) throw ApiError.BadRequest("Неверное имя или пароль");

    const payload = new UserDto(user);

    const tokens = await TokenService.generateTokens({ ...payload });
    await TokenModel.updateRefresh(payload.email, tokens.refresh);

    return { ...tokens, ...payload };
  }

  async registration(email, username, password, gender) {
    const mailCandidate = await UserModel.findUser(email);
    const nameCandidate = await UserModel.findUser(username);
    if (!email || !username || !password || !gender)
      throw ApiError.BadRequest("Ошибка регистрации");
    if (mailCandidate) throw ApiError.BadRequest("Почта занята");
    if (nameCandidate) throw ApiError.BadRequest("Такое имя уже занято");

    const hashedPassword = await bcrypt.hash(password, 3);
    const user = await UserModel.addUser(email, username, hashedPassword, gender);
    const payload = new UserDto(user);

    const tokens = await TokenService.generateTokens({ ...payload });
    await TokenModel.updateRefresh(payload.email, tokens.refresh);

    const dir = await FileService.createRootDir(payload.id);
    await UserModel.updateRootDirectory(dir.id, payload.id);
    payload.root_directory = dir.id;

    return { ...tokens, ...payload };
  }
}

module.exports = new UserService();
