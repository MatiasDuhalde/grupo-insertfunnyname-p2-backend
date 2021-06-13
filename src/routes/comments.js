const KoaRouter = require('koa-router');
const ApiError = require('./utils/apiError');

const { validateIntParam } = require('./utils/utils');

const router = new KoaRouter();

router.param('propertyId', validateIntParam);
router.param('commentId', validateIntParam);

// router.post('property.meeting.create', '/properties/:propertyId/meetings', async (ctx) => {
//   // TODO: only return meaningful properties
// });

router.get('property.comment.list', '/properties/:propertyId/comments', async (ctx) => {
  const { propertyId } = ctx.params;
  let property;
  try {
    property = ctx.orm.Propety.findByPk(propertyId);
    if (!property) {
      throw new Error();
    }
  } catch (error) {
    throw new ApiError(404, `Property listing '${propertyId}' not found`);
  }
  try {
    const comments = property.getComments();
    ctx.body = {
      comments,
    };
  } catch (error) {
    throw new ApiError(404, `Could not retrieve property listing '${propertyId}' comments`);
  }
});

module.exports = router;
