const db = require("../database/postgresql");

class UserModel {
  async deleteAccount(user_id) {
    await db.query("delete from files where user_id = $1", [user_id]);

    await db.query("delete from users where id = $1", [user_id]);
  }

  async uploadAvatar(avatarName, user_id) {
    const data = await db.query("update users set avatar = $1 where id = $2 returning *", [
      avatarName,
      user_id,
    ]);
    return data.rows[0];
  }

  async updateRootDirectory(root_directory, id) {
    await db.query("update users set root_directory = $1 where id = $2", [root_directory, id]);
  }

  async updateProperty(property, value, id) {
    await db.query(`update users set ${property} = $1 where id = $2`, [value, id]);
  }

  async getAllUsers() {
    try {
      const data = await db.query("select * from users");
      const rows = data.rows;

      return rows;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async findUserById(id) {
    try {
      const data = await db.query("select * from users where id = $1", [id]);
      const rows = data.rows;

      return rows ? rows[0] : null;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async findUser(user_info) {
    try {
      const data = await db.query("select * from users where username = $1 or email = $1", [
        user_info,
      ]);

      return data.rows[0];
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async addUser(email, username, hashedPassword, gender, root_directory, ip) {
    try {
      const data = await db.query(
        "insert into users (email, username, password, gender, root_directory, ip) values ($1, $2, $3, $4, $5, $6) returning *",
        [email, username, hashedPassword, gender, root_directory, ip]
      );
      const rows = data.rows;

      return rows ? rows[0] : null;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = new UserModel();
