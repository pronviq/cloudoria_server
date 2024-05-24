const db = require("../database/postgresql");
const ApiError = require("../exceptions/ApiError");

class LogModel {
  async makeLog(status, message) {
    try {
      const data = await db.query("insert into logs(status, message) values ($1, $2) returning *", [
        status,
        message,
      ]);

      return data.rows[0] ? data.rows[0].id : data.rows[0];
    } catch (error) {
      console.log("LogModel -> makeLog -> Error: ", error.message);
      throw ApiError.ServerError("LogModel -> makeLog -> Error ->" + error.message);
    }
  }
}

module.exports = new LogModel();
