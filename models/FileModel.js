const db = require("../database/postgresql");
const FileDto = require("../dtos/FileDto");
const ApiError = require("../exceptions/ApiError");

class FileModel {
  async getAll(user_id) {
    const data = await db.query("select * from files where user_id = $1", [user_id]);
    return data.rows;
  }

  async getTrash(user_id) {
    const data = await db.query("select * from files where user_id = $1 and is_trash = true", [
      user_id,
    ]);
    return data.rows;
  }

  async getFavorites(user_id) {
    const data = await db.query(
      "select * from files where user_id = $1 and is_trash = false and is_favorite = true",
      [user_id]
    );
    return data.rows;
  }

  async changeValue(id, prop, value) {
    const data = await db.query(`update files set ${prop} = $1 where id = $2`, [value, id]);
    return data.rows[0];
  }

  async deleteFile(id) {
    const data = await db.query("delete from files where id = $1 returning *", [id]);
    return data.rows[0];
  }

  async updateSize(user_id, value, action) {
    const user = (await db.query("select * from users where id = $1", [user_id])).rows[0];
    if (!user) {
      throw ApiError.BadRequest("Пользователь не найден");
    }
    user.used_space = Number(user.used_space);
    user.disk_space = Number(user.disk_space);

    if (action === "increase") {
      if (user.used_space + value > user.disk_space) {
        throw ApiError.BadRequest("Недостаточно места");
      }

      const data = await db.query("update users set used_space = $1 where id = $2 returning *", [
        user.used_space + value,
        user.id,
      ]);

      return data.rows[0];
    } else if (action === "decrease") {
      const data = await db.query("update users set used_space = $1 where id = $2 returning *", [
        Math.max(user.used_space - value, 0),
        user.id,
      ]);

      return data.rows[0];
    } else {
      throw ApiError.ServerError("update size err");
    }
  }

  async getFiles(parent_file, user_id) {
    const data = await db.query(
      "select * from files where parent_file = $1 and user_id = $2 and is_trash = false",
      [parent_file, user_id]
    );

    return data.rows;
  }

  async addFile(fileDto) {
    const data = await db.query(
      "insert into files (name, path, size, user_id, type, parent_file) values ($1, $2, $3, $4, $5, $6) returning *",
      [fileDto.name, fileDto.path, fileDto.size, fileDto.user_id, fileDto.type, fileDto.parent_file]
    );

    return data.rows[0];
  }

  async findById(file_id) {
    const data = await db.query(`select * from files where id = $1`, [file_id]);
    return data.rows[0];
  }
}

module.exports = new FileModel();
