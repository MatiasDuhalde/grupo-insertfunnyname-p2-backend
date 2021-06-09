class ApiError extends Error {
  constructor(statusCode, message, contents) {
    super(message);
    this.statusCode = statusCode;
    this.contents = contents;
  }
}

module.exports = ApiError;
