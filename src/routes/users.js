const KoaRouter = require('koa-router');

const ApiError = require('./utils/apiError');
const { uploadProfileImage, deleteProfileImage } = require('./utils/storage');
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
    // Password
    if (ctx.request.body.password !== undefined) {
      ctx.request.body.hashedPassword = ctx.request.body.password;
      delete ctx.request.body.password;
    }
    // Map objects
    delete ctx.request.body.avatarLink;
    Object.keys(ctx.request.body).forEach((key) => {
      user[key] = ctx.request.body[key];
    });
    await user.validate();

    // Image
    if (ctx.request.files && ctx.request.files.avatarFile) {
      const { avatarFile } = ctx.request.files;
      const newImageUrl = await uploadProfileImage(user, avatarFile);
      await deleteProfileImage(user);
      user.avatarLink = newImageUrl;
    }

    await user.save({ fields: ['email', 'firstName', 'lastName', 'avatarLink', 'hashedPassword'] });
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
