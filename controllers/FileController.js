const ApiError = require("../exceptions/ApiError");
const FileModel = require("../models/FileModel");
const FileService = require("../services/FileService");
const AsyncLock = require("async-lock");
const TokenService = require("../services/TokenService");
const lock = new AsyncLock();
const fs = require("fs");

class FileController {
  async downloadFile(req, res, next) {
    try {
      const { file_id } = req.query;

      const file = await FileModel.findById(file_id);
      if (!file) next(ApiError.BadRequest("Файл не найден"));
      if (!fs.existsSync(file.path)) next(ApiError.BadRequest("Файл не найден"));

      res.download(file.path);
    } catch (error) {
      next(error);
    }
  }

  async searchFiles(req, res, next) {
    try {
      const { q } = req.query;
      const user = req.user;
      const files = await FileModel.getAll(user.id);
      const filtered = files.filter((file) => file.name.toLowerCase().includes(q.toLowerCase()));
      res.status(200).json(filtered);
    } catch (error) {
      next(error);
    }
  }

  async getPreview(req, res, next) {
    try {
      const { file_id } = req.params;
      const { refreshToken } = req.cookies;
      if (!refreshToken) throw ApiError.Unathorized();

      const user = TokenService.validateRefresh(refreshToken);
      if (!user) throw ApiError.Unathorized();

      const file = await FileModel.findById(file_id);
      const filePath = file.path;

      // console.log(filePath);
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }

  async getFavorites(req, res, next) {
    try {
      const user = req.user;
      const data = await FileModel.getFavorites(user.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async getTrash(req, res, next) {
    try {
      const user = req.user;
      const data = await FileModel.getTrash(user.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async check(req, res, next) {
    res.status(500).json();
  }

  async uploadFile(req, res, next) {
    try {
      const uploadFile = req.files.file;
      const { parent_file, name } = req.body;
      const user_id = req.user.id;
      lock.acquire("upload", async () => {
        try {
          const file = await FileService.uploadFile(uploadFile, user_id, parent_file, name);
          res.status(200).json(file);
        } catch (error) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async changeValue(req, res, next) {
    try {
      const { id, prop, value } = req.body;
      await FileModel.changeValue(id, prop, value);

      res.status(200).json();
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req, res, next) {
    try {
      const id = req.query.id;

      lock.acquire("delete", async () => {
        try {
          await FileService.deleteFile(id);
          res.status(200).json();
        } catch (error) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getFiles(req, res, next) {
    try {
      const parent_file = req.query.parent_file;
      const user_id = req.user.id;
      const files = await FileModel.getFiles(parent_file, user_id);

      // console.log(files);
      res.status(200).json(files);
    } catch (error) {
      next(error);
    }
  }

  async createDir(req, res, next) {
    try {
      const { parent_file, name } = req.body;
      const user_id = req.user.id;
      const data = await FileService.createDir(parent_file, name, user_id);

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileController();
