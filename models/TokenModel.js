const db = require("../database/postgresql");

class TokenModel {
  async addRefresh(user_id, token, ip, email) {
    try {
      await db.query("insert into tokens (user_id, token, ip, email) values ($1, $2, $3, $4)", [
        user_id,
        token,
        ip,
        email,
      ]);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findRefresh(refresh) {
    try {
      const data = await db.query("select token from tokens where token = $1", [refresh]);
      return data.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateRefresh(email, refresh) {
    try {
      const data = await db.query("update tokens set token = $1 where email = $2 returning *", [
        refresh,
        email,
      ]);
      return data.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async removeRefresh(refresh) {
    try {
      const data = await db.query("delete from tokens where token = $1 returning *", [refresh]);
      return data.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new TokenModel();
