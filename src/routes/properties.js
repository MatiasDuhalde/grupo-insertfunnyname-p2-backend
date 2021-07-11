const KoaRouter = require('koa-router');

const ApiError = require('./utils/apiError');
const { loadSingleProperty } = require('./utils/queries');
const { deletePropertyImage, uploadPropertyImage } = require('./utils/storage');

const {
  validateIntParam, //
  authJWT,
  requiredParams,
  getUserIdFromToken,
} = require('./utils/utils');

const DEFAULT_PROPERTY_IMAGE = `https://ia800707.us.archive.org/25/items/MinecraftSmallDirtHouse\
/Minecraft_Small_Dirt_House.png${''}`;

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
  getUserIdFromToken,
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
    try {
      const property = await ctx.orm.Property.build({
        userId: ctx.state.userId,
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
        imageLink: DEFAULT_PROPERTY_IMAGE,
      });
      await property.validate();

      // Image
      if (ctx.request.files && ctx.request.files.imageFile) {
        const { imageFile } = ctx.request.files;
        const newImageUrl = await uploadPropertyImage(property, imageFile);
        await deletePropertyImage(property);
        property.imageLink = newImageUrl;
      }

      await property.save();

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

router.get('property.get', '/properties/:propertyId', loadSingleProperty, async (ctx) => {
  ctx.body = {
    property: ctx.state.property,
  };
});

router.patch(
  'property.edit',
  '/properties/:propertyId',
  authJWT,
  getUserIdFromToken,
  loadSingleProperty,
  async (ctx) => {
    if (ctx.state.userId !== ctx.state.property.userId) {
      ctx.throw(401, 'Unauthorized');
    }
    try {
      delete ctx.request.body.imageFile;
      Object.keys(ctx.request.body).forEach((key) => {
        ctx.state.property[key] = ctx.request.body[key];
      });
      ctx.state.property.validate();

      // Image
      if (ctx.request.files && ctx.request.files.imageFile) {
        const { imageFile } = ctx.request.files;
        const newImageUrl = await uploadPropertyImage(ctx.state.property, imageFile);
        await deletePropertyImage(ctx.state.property);
        ctx.state.property.imageLink = newImageUrl;
      }

      await ctx.state.property.save({
        fields: [
          'title',
          'type',
          'bathroom',
          'bedrooms',
          'bedrooms',
          'size',
          'region',
          'commune',
          'street',
          'streetNumber',
          'description',
          'listingType',
          'imageLink',
        ],
      });
      ctx.status = 204;
    } catch (error) {
      const errors = {};
      if (error instanceof ctx.orm.Sequelize.ValidationError) {
        error.errors.forEach((errorItem) => {
          errors[errorItem.path] = errorItem.message;
        });
        throw new ApiError(400, 'Could not modify property listing', { errors });
      }
      throw error;
    }
  },
);

router.delete(
  'property.delete',
  '/properties/:propertyId',
  authJWT,
  getUserIdFromToken,
  loadSingleProperty,
  async (ctx) => {
    if (ctx.state.userId !== ctx.state.property.userId) {
      ctx.throw(401, 'Unauthorized');
    }
    try {
      await deletePropertyImage(ctx.state.property);
      ctx.state.property.destroy();
      ctx.status = 204;
    } catch (error) {
      throw new ApiError(400, 'Could not delete property listing');
    }
  },
);

module.exports = router;
