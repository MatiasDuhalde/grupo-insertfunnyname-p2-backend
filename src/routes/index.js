const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('/', async (ctx) => {
  ctx.body = {
    hello: 'hello',
  };
});

module.exports = router;
