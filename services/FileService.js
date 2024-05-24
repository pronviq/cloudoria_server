const fs = require("fs");
const FileModel = require("../models/FileModel");
const path = require("path");
const ApiError = require("../exceptions/ApiError");
const UserModel = require("../models/UserModel");
const FileDto = require("../dtos/FileDto");

class FileService {
  static async uploadFile(file, user_id, parent_id, name) {
    const parent = await FileModel.findById(parent_id);

    const user = await UserModel.findUserById(user_id);
    if (!user) throw ApiError.BadRequest("Пользователь не найден");
    if (!parent) throw ApiError.BadRequest("Родитель не найден");

    const filePath = path.join(parent.path, "/", name);
    if (fs.existsSync(filePath)) throw ApiError.BadRequest("Файл уже существует");

    // console.log(file.size);
    await FileModel.updateSize(user_id, file.size, "increase");

    const fileDto = new FileDto({
      name,
      path: filePath,
      size: file.size,
      user_id: user_id,
      type: file.mimetype.split(".").pop(),
      parent_file: parent.id,
    });

    await file.mv(filePath);
    const data = await FileModel.addFile(fileDto);
    return data;
  }

  static async deleteFile(id) {
    const file = await FileModel.deleteFile(id);
    if (!file) return;

    await FileModel.updateSize(file.user_id, file.size, "decrease");

    fs.rmSync(file.path, { recursive: true, force: true });
  }

  static async createRootDir(user_id) {
    const filePath = path.resolve(__dirname, "..", "users", user_id.toString());

    const fileDto = new FileDto({
      parent_file: null,
      path: filePath,
      user_id,
      type: "dir",
      size: 4 * 1024,
      name: user_id.toString(),
    });

    await FileModel.updateSize(fileDto.user_id, 4096, "increase");
    fs.mkdirSync(fileDto.path);

    const data = await FileModel.addFile(fileDto);

    return data;
  }

  static async createDir(parent_file, name, user_id) {
    const parentFile = await FileModel.findById(parent_file);
    let filePath = "";

    if (!parentFile) {
      filePath = path.resolve(__dirname, "..", "users", user_id.toString(), name);
    } else {
      filePath = path.resolve(parentFile.path, name);
    }
    if (fs.existsSync(filePath)) {
      throw ApiError.BadRequest("Файл уже существует");
    }

    const fileDto = new FileDto({
      parent_file,
      path: filePath,
      user_id,
      type: "dir",
      size: 4096,
      name,
    });

    await FileModel.updateSize(fileDto.user_id, 4096, "increase");
    fs.mkdirSync(fileDto.path);

    const data = await FileModel.addFile(fileDto);

    return data;
  }
}

module.exports = FileService;
