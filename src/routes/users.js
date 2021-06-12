const KoaRouter = require('koa-router');

const { validateIntParam, authJWT } = require('./utils/utils');

const router = new KoaRouter();

require('dotenv').config();

router.param('userId', validateIntParam);

router.get('user.me', '/me', authJWT, async (ctx) => {
  const {
    jwtDecoded: { sub },
  } = ctx.state;
  const user = await ctx.orm.User.findByPk(sub);
  ctx.body = { user };
});

router.patch('user.byId', '/:userId', authJWT, async (ctx) => {
  try {
    const { userId } = ctx.params;
    const fetchedUser = await ctx.orm.User.findByPk(userId);
    const {
      jwtDecoded: { sub },
    } = ctx.state;
    const currentUser = await ctx.orm.User.findByPk(sub);
    if (currentUser.id === fetchedUser.id) {
      const { firstName, lastName, email, avatarLink } = ctx.request.body;
      currentUser.firstName = firstName;
      currentUser.lastName = lastName;
      currentUser.email = email;
      currentUser.avatarLink = avatarLink; // Add password help :(
      await ctx.state.currentUser.save();
      return ctx.redirect(ctx.router.url('userId', { userId: ctx.state.currentUser.id }));
    }
    ctx.status = 401;
    ctx.throw(401, 'Unauthorized');
  } catch (error) {
    const messages = {};
    if (error instanceof ctx.orm.Sequelize.ValidationError) {
      error.errors.forEach((errorItem) => {
        messages[errorItem.path] = errorItem.message;
      });
    } else {
      messages.post = 'Could not modify this user';
    }
    ctx.flashMessages.danger = messages;
    return ctx.redirect(ctx.router.url(':userId', { userId: ctx.state.currentUser.id }));
  }
});
module.exports = router;
