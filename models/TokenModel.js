const db = require("../database/postgresql");
const ApiError = require("../exceptions/ApiError");

class TokenModel {
  async findRefresh(refresh) {
    try {
      const data = await db.query("select refreshtoken from users where refreshtoken = $1", [
        refresh,
      ]);
      const rows = data.rows;
      return rows ? rows[0] : null;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateRefresh(email, refresh) {
    try {
      const data = await db.query(
        "update users set refreshtoken = $1 where email = $2 returning *",
        [refresh, email]
      );
      const rows = data.rows;

      return rows ? rows[0] : null;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async removeRefresh(refresh) {
    try {
      const data = await db.query(
        "update users set refreshtoken = '' where refreshtoken = $1 returning id",
        [refresh]
      );
      return data.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new TokenModel();
