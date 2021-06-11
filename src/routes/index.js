const KoaRouter = require('koa-router');
const auth = require('./auth');
const user = require('./users');

require('dotenv').config();

const router = new KoaRouter();

router.get('/', async (ctx) => {
  ctx.body = {
    hello: 'hello',
  };
});

router.use('/auth', auth.routes());

router.use();

router.use('/users', user.routes());

module.exports = router;
