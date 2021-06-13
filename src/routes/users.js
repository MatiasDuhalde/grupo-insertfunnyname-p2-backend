const KoaRouter = require('koa-router');

const ApiError = require('./utils/apiError');
const { validateIntParam, authJWT, getUserIdFromToken } = require('./utils/utils');

const router = new KoaRouter();

router.param('userId', validateIntParam);

router.get('user.me', '/users/me', authJWT, getUserIdFromToken, async (ctx) => {
  const user = await ctx.orm.User.findByPk(ctx.state.userId, {
    attributes: { exclude: ['hashedPassword'] },
  });
  ctx.body = { user };
});

router.patch('user.edit', '/users/:userId', authJWT, getUserIdFromToken, async (ctx) => {
  const { userId } = ctx.params;
  if (ctx.state.userId !== userId) {
    ctx.throw(401, 'Unauthorized');
  }
  try {
    const user = await ctx.orm.User.findByPk(ctx.state.userId);
    ctx.request.body.hashedPassword = ctx.request.body.password;
    delete ctx.request.body.password;
    Object.keys(ctx.request.body).forEach((key) => {
      user[key] = ctx.request.body[key];
    });
    await user.save();
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
