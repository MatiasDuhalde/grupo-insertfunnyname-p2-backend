const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const KoaRouter = require('koa-router');

const ApiError = require('./utils/apiError');
const { validateIntParam, requiredParams } = require('./utils/utils');

const router = new KoaRouter();

const DEFAULT_AVATAR = `https://png.pngtree.com/png-vector/20191026/ourlarge/\
pngtree-avatar-vector-icon-white-background-png-image_1870181.jpg${''}`;

router.param('userId', validateIntParam);

router.post(
  'user.create',
  '/users',
  requiredParams({
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    password: 'string',
  }),
  async (ctx) => {
    const {
      firstName, //
      lastName,
      email,
      password,
    } = ctx.request.body;
    try {
      const user = await ctx.orm.User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        hashedPassword: password,
        avatarLink: DEFAULT_AVATAR,
      });
      ctx.status = 201;
      ctx.body = {
        email: user.email,
      };
    } catch (error) {
      const errors = {};
      if (error instanceof ctx.orm.Sequelize.ValidationError) {
        error.errors.forEach((errorItem) => {
          errors[errorItem.path] = errorItem.message;
        });
      } else {
        errors.password = error.message;
      }
      throw new ApiError(400, 'Could not create user', { errors });
    }
  },
);

router.post(
  'auth.create',
  '/auth',
  requiredParams({
    email: 'string',
    password: 'string',
  }),
  async (ctx) => {
    const { email, password } = ctx.request.body;
    if (password.length < 6) {
      throw new ApiError(422, 'Invalid password');
    }
    const user = await ctx.orm.User.findOne({ where: { email: email.trim() } });
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      throw new ApiError(401, 'Incorrect email or password');
    }
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
    ctx.body = { token };
  },
);

module.exports = router;
