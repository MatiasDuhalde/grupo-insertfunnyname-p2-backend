const koaJwt = require('koa-jwt');
const ApiError = require('./apiError');

require('dotenv').config();

const validateIntParam = async (param, ctx, next) => {
  const parsedParam = +param;
  if (parsedParam < 1 || !Number.isInteger(parsedParam)) {
    throw new ApiError(400, `Invalid parameter in request: '${param}'`);
  }
  return next();
};

const debug = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

const authJWT = koaJwt({ secret: process.env.JWT_SECRET, key: 'jwtDecoded', debug });

const requiredParams = (params) => (ctx, next) => {
  const errors = {};
  Object.keys(params).forEach((param) => {
    if (ctx.request.body[param] === undefined) {
      errors[param] = `${param} is required`;
      return;
    }
    const paramType = typeof ctx.request.body[param];
    if (paramType !== params[param]) {
      errors[param] = `${param} must have type ${params[param]} (received ${paramType})`;
    }
  });
  if (Object.keys(errors).length !== 0) {
    throw new ApiError(422, 'Wrong parameters', { errors });
  }
  return next();
};

const getUserIdFromToken = (ctx, next) => {
  const {
    jwtDecoded: { sub, admin },
  } = ctx.state;
  // Block admin from using user routes
  if (admin) {
    ctx.throw(401, 'Action unavailable for admin accounts');
  }
  ctx.state.userId = `${sub}`;
  return next();
};

const getAdminIdFromToken = (ctx, next) => {
  const {
    jwtDecoded: { sub, admin },
  } = ctx.state;
  ctx.state.adminId = `${sub}`;
  if (!admin) {
    ctx.throw(401, 'Unauthorized');
  }
  return next();
};

module.exports = {
  validateIntParam,
  authJWT,
  requiredParams,
  getUserIdFromToken,
  getAdminIdFromToken,
};
