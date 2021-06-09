const KoaRouter = require('koa-router');
const ApiError = require('./utils/apiError');

const { validateIntParam } = require('./utils/utils');

const router = new KoaRouter();

router.param('propertyId', validateIntParam);

// router.post('property.meeting.create', '/properties/:propertyId/meetings', async (ctx) => {
//   // TODO: only return meaningful properties
// });

router.get('property.meeting.list', '/properties/:propertyId/meetings', async (ctx) => {
  const { propertyId } = ctx.params;
  try {
    const property = ctx.orm.Propety.findByPk(propertyId);
    const meetings = property.getMeetings();
    ctx.body = {
      meetings,
    };
  } catch (error) {
    throw new ApiError(404, `Property '${propertyId}' not found`);
  }
});

module.exports = router;
