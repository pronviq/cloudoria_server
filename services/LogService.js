const LogModel = require("../models/LogModel");

class LogService {
  async makeLog(status, action, message) {
    await LogModel.makeLog(status, action, message);
  }
}

module.exports = new LogService();
