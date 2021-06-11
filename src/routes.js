const KoaRouter = require('koa-router');

const ApiError = require('./routes/utils/apiError');
const index = require('./routes/index');
const users = require('./routes/users');
const properties = require('./routes/properties');
const meetings = require('./routes/meetings');
const comments = require('./routes/comments');
const reports = require('./routes/reports');
const admin = require('./routes/admins');
const auth = require('./routes/auth');

const router = new KoaRouter();

router.use(async (ctx, next) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof ApiError) {
      ctx.status = error.statusCode;
      const contents = error.contents || {};
      ctx.body = {
        error: error.message,
        ...contents,
      };
      return ctx.body;
    }
    throw error;
  }
});

router.use(index.routes());
router.use(users.routes());
router.use(properties.routes());
router.use(meetings.routes());
router.use(comments.routes());
router.use(reports.routes());
router.use(admin.routes());
router.use(auth.routes());

module.exports = router;
