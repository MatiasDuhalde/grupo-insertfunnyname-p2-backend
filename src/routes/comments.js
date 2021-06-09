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
  try {
    const property = ctx.orm.Propety.findByPk(propertyId);
    const comments = property.getComments();
    ctx.body = {
      comments,
    };
  } catch (error) {
    throw new ApiError(404, `Property '${propertyId}' not found`);
  }
});

module.exports = router;
