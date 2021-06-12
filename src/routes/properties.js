const KoaRouter = require('koa-router');
const ApiError = require('./utils/apiError');

const { validateIntParam, authJWT, requiredParams } = require('./utils/utils');

const router = new KoaRouter();

router.param('propertyId', validateIntParam);

router.get('property.list', '/properties', async (ctx) => {
  // TODO: only return meaningful properties
  const properties = await ctx.orm.Property.findAll();
  ctx.body = {
    properties,
  };
});

router.post(
  'property.create',
  '/properties',
  authJWT,
  requiredParams({
    title: 'string',
    type: 'string',
    region: 'string',
    commune: 'string',
    street: 'string',
    price: 'number',
    listingType: 'string',
    // description, streetNumber, size, bedrooms, bathrooms may be null
  }),
  async (ctx) => {
    const {
      title,
      type,
      bathrooms,
      bedrooms,
      size,
      region,
      commune,
      street,
      streetNumber,
      description,
      price,
      listingType,
    } = ctx.request.body;
    const {
      jwtDecoded: { sub: userId },
    } = ctx.state;
    try {
      const property = await ctx.orm.Property.create({
        userId,
        title: title.trim(),
        type,
        bathrooms,
        bedrooms,
        size,
        region: region.trim(),
        commune: commune.trim(),
        street: street.trim(),
        streetNumber,
        description: description ? description.trim() : description,
        price,
        listingType,
      });
      ctx.status = 201;
      ctx.body = {
        id: property.id,
      };
    } catch (error) {
      const errors = {};
      if (error instanceof ctx.orm.Sequelize.ValidationError) {
        error.errors.forEach((errorItem) => {
          errors[errorItem.path] = errorItem.message;
        });
        throw new ApiError(400, 'Could not create property listing', { errors });
      }
      throw error;
    }
  },
);

router.get('property.get', '/properties/:propertyId', async (ctx) => {
  const { propertyId } = ctx.params;
  try {
    const property = await ctx.orm.Property.findByPk(propertyId);
    if (!property) {
      throw new Error();
    }
    ctx.body = {
      property,
    };
  } catch (error) {
    throw new ApiError(404, `Property listing '${propertyId}' not found`);
  }
});

router.patch('property.edit', '/properties/:propertyId', authJWT, async (ctx) => {
  const { propertyId } = ctx.params;
  const {
    jwtDecoded: { sub: userId },
  } = ctx.state;
  let property;
  try {
    property = await ctx.orm.Property.findByPk(propertyId);
    if (!property) {
      throw new Error();
    }
  } catch (error) {
    throw new ApiError(404, `Property '${propertyId}' not found`);
  }
  if (userId !== property.userId) {
    ctx.throw(401, 'Unauthorized');
  }
  try {
    Object.keys(ctx.request.body).forEach((key) => {
      property[key] = ctx.request.body[key];
    });
    await property.save();
    ctx.status = 204;
  } catch (error) {
    const errors = {};
    if (error instanceof ctx.orm.Sequelize.ValidationError) {
      error.errors.forEach((errorItem) => {
        errors[errorItem.path] = errorItem.message;
      });
      throw new ApiError(400, 'Could not modify property', { errors });
    }
    throw error;
  }
});

module.exports = router;
