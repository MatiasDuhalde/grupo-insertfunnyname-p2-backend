const KoaRouter = require('koa-router');
const ApiError = require('./utils/apiError');
const { loadSingleProperty, loadSingleComment } = require('./utils/queries');

const {
  validateIntParam, //
  requiredParams,
  getUserIdFromToken,
  authJWT,
} = require('./utils/utils');

const router = new KoaRouter();

router.param('propertyId', validateIntParam);
router.param('commentId', validateIntParam);

router.get(
  'property.comment.list',
  '/properties/:propertyId/comments',
  loadSingleProperty,
  async (ctx) => {
    const { propertyId } = ctx.params;
    try {
      const comments = await ctx.state.property.getComments();
      ctx.body = {
        comments,
      };
    } catch (error) {
      throw new ApiError(404, `Could not retrieve property listing '${propertyId}' comments`);
    }
  },
);

router.post(
  'property.comment.create',
  '/properties/:propertyId/comments',
  authJWT,
  getUserIdFromToken,
  loadSingleProperty,
  requiredParams({
    body: 'string',
  }),
  async (ctx) => {
    const { propertyId } = ctx.params;
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

router.delete(
  'property.comment.delete',
  '/properties/:propertyId/comments/:commentId',
  authJWT,
  getUserIdFromToken,
  loadSingleComment,
  async (ctx) => {
    if (ctx.state.userId !== ctx.state.comment.userId) {
      ctx.throw(401, 'Unauthorized');
    }
    const { propertyId, commentId } = ctx.params;
    try {
      if (ctx.state.comment.propertyId !== propertyId) throw new Error();
      ctx.state.comment.destroy();
      ctx.status = 204;
    } catch (error) {
      throw new ApiError(404, `Could not delete comment '${commentId}'`);
    }
  },
);

router.patch(
  'property.comment.edit',
  '/properties/:propertyId/comments/:commentId',
  authJWT,
  getUserIdFromToken,
  loadSingleComment,
  requiredParams({
    body: 'string',
  }),
  async (ctx) => {
    if (ctx.state.userId !== ctx.state.comment.userId) {
      ctx.throw(401, 'Unauthorized');
    }
    const { propertyId, commentId } = ctx.params;
    const { body } = ctx.request.body;
    try {
      if (ctx.state.comment.propertyId !== propertyId) throw new Error();
      ctx.state.comment.body = body;
      await ctx.state.comment.save();
      ctx.status = 204;
    } catch (error) {
      throw new ApiError(404, `Could not edit comment '${commentId}'`);
    }
  },
);

module.exports = router;
