const KoaRouter = require('koa-router');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('./utils/apiError');

const { validateIntParam } = require('./utils/utils');

const router = new KoaRouter();

require('dotenv').config();

const DEFAULT_AVATAR = `https://png.pngtree.com/png-vector/20191026/ourlarge/\
pngtree-avatar-vector-icon-white-background-png-image_1870181.jpg${''}`;

router.param('userId', validateIntParam);

router.post('user.create', '/users', async (ctx) => {
  const {
    firstName,
    lastName,
    email,
    password,
  } = ctx.request.body;
  try {
    const user = await ctx.orm.User.create({
      firstName,
      lastName,
      email,
      hashedPassword: password,
      avatarLink: DEFAULT_AVATAR,
    });
    // TODO: Return JWT somewhere??
    ctx.body = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
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
    throw new ApiError(400, 'Could not create user', {
      errors,
    });
  }
});

router.post('auth.create', '/', async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await ctx.orm.User.findOne({ where: { email } });
  const authenticated = user && (await bcrypt.compare(password, user.hashedPassword));
  if (user && authenticated) {
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
    ctx.body = { token };
  } else {
    ctx.throw(401, 'Correo y/o contraseña incorrectos');
  }
});

module.exports = router;
