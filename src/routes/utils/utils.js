const ApiError = require('./apiError');

const validateIntParam = async (param, ctx, next) => {
  const parsedParam = +param;
  if (parsedParam < 1 || !Number.isInteger(parsedParam)) {
    throw new ApiError(400, `Invalid parameter in request: '${param}'`);
  }
  return next();
};

const requireLogin = async (ctx, next) => {
  // TODO: user JWT
  (() => {})(); // Line to avoid eslint warning, please remove
  return next();
};

const excludeLogin = async (ctx, next) => {
  // TODO: user JWT
  (() => {})(); // Line to avoid eslint warning, please remove
  return next();
};

module.exports = {
  validateIntParam,
  requireLogin,
  excludeLogin,
};
