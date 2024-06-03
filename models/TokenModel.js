const db = require("../database/postgresql");

class TokenModel {
  async clearTokens(user_id) {
    await db.query("delete from tokens where user_id = $1", [user_id]);
  }

  async terminateSession(session_id, user_id) {
    try {
      const data = await db.query("delete from tokens where id = $1 and user_id = $2 returning *", [
        session_id,
        user_id,
      ]);
      return data.rows;
    } catch (error) {}
  }

  async getSessions(user_id) {
    try {
      const data = await db.query(
        "select *, timestamp at time zone 'utc' as timestamp from tokens where user_id = $1",
        [user_id]
      );
      return data.rows;
    } catch (error) {}
  }

  async addRefresh(user_id, token, ip, email, browser, os) {
    try {
      // console.log(user_id, ip, email, browser, os);
      await db.query(
        "insert into tokens (user_id, token, ip, email, browser, os) values ($1, $2, $3, $4, $5, $6)",
        [user_id, token, ip, email, browser, os]
      );
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
