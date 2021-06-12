const KoaRouter = require('koa-router');

const { ApiError } = require('./utils/apiError');
const { validateIntParam, authJWT } = require('./utils/utils');

const router = new KoaRouter();

router.param('userId', validateIntParam);

router.get('user.me', '/users/me', authJWT, async (ctx) => {
  const {
    jwtDecoded: { sub },
  } = ctx.state;
  const user = await ctx.orm.User.findByPk(sub);
  ctx.body = { user };
});

router.patch('user.edit', '/users/:userId', authJWT, async (ctx) => {
  const { userId } = ctx.params;
  const {
    jwtDecoded: { sub },
  } = ctx.state;
  if (sub !== +userId) {
    ctx.throw(401, 'Unauthorized');
  }
  try {
    const user = await ctx.orm.User.findByPk(sub);
    Object.keys(ctx.request.body).forEach((key) => {
      user[key] = ctx.request.body[key];
    });
    await user.save();
    console.log(user);
    ctx.status = 204;
  } catch (error) {
    const errors = {};
    if (error instanceof ctx.orm.Sequelize.ValidationError) {
      error.errors.forEach((errorItem) => {
        errors[errorItem.path] = errorItem.message;
      });
      throw new ApiError(400, 'Could not modify user', { errors });
    }
    throw error;
  }
});

module.exports = router;
