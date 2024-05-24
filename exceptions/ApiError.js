class ApiError extends Error {
  status;

  constructor(status, message) {
    super(message);
    this.status = status;
  }

  static Unathorized() {
    return new ApiError(401, "Unathorized");
  }

  static BadRequest(message) {
    return new ApiError(400, message);
  }

  static ServerError(message) {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
