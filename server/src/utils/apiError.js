class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }

  static notFound(msg = 'Not found') { return new ApiError(404, msg); }
  static badRequest(msg = 'Bad request') { return new ApiError(400, msg); }
  static internal(msg = 'Internal server error') { return new ApiError(500, msg); }
}

module.exports = ApiError;
