const KoaRouter = require('koa-router');
const ApiError = require('./utils/apiError');

const { validateIntParam } = require('./utils/utils');

const router = new KoaRouter();

router.param('propertyId', validateIntParam);

router.get('property.list', '/properties', async (ctx) => {
  // TODO: only return meaningful properties
  const properties = ctx.orm.Property.findAll();
  ctx.body = {
    properties,
  };
});

router.get('property.get', '/properties/:propertyId', async (ctx) => {
  const { propertyId } = ctx.params;
  try {
    const property = ctx.orm.Propety.findByPk(propertyId);
    ctx.body = {
      property,
    };
  } catch (error) {
    throw new ApiError(404, `Property '${propertyId}' not found`);
  }
});

module.exports = router;
