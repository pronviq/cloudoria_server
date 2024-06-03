const ApiError = require("../exceptions/ApiError");
const LogModel = require("../models/LogModel");

module.exports = async function (error, req, res, next) {
  try {
    let status = error.status;
    const message = error.message;

    if (!status) {
      status = 500;
    }

    let id;
    if (status !== 401) id = await LogModel.makeLog(status, message);

    if (status === 500) {
      return res.status(500).json(`Internal Server Error || Error ID = ${id}`);
    }

    if (status === 401) {
      return res.status(401).json(`Unathorized`);
    }

    if (status === 400) {
      return res.status(400).json(error.message);
    }

    return res.status(500).json(`Error ID = ${id}`);
  } catch (error) {
    console.log(error.message);
    // return res.status(500).json("Error");
  }
};
