const KoaRouter = require('koa-router');
const { loadSingleComment } = require('./utils/queries');

const {
  validateIntParam, //
  getUserIdFromToken,
  authJWT,
} = require('./utils/utils');

const router = new KoaRouter();

router.param('userId', validateIntParam);
router.param('commentId', validateIntParam);

router.post(
  'report.user.create',
  '/comments/:commentId/comments',
  authJWT,
  getUserIdFromToken,
  loadSingleComment,
  async (ctx) => {
    const { commentId } = ctx.params;
    const { body } = ctx.request.body;
    try {
      const comment = await ctx.state.property.createComment({
        userId: ctx.state.userId,
        propertyId,
        body,
      });
      ctx.status = 201;
      ctx.body = {
        id: comment.id,
      };
    } catch (error) {
      throw new ApiError(404, `Could not create comment for property listing '${propertyId}'`);
    }
  },
);

module.exports = router;
