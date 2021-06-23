const KoaRouter = require('koa-router');
const ApiError = require('./utils/apiError');
const { loadSingleComment } = require('./utils/queries');

const {
  validateIntParam, //
  getUserIdFromToken,
  authJWT,
  requiredParams,
} = require('./utils/utils');

const router = new KoaRouter();

router.param('userId', validateIntParam);
router.param('commentId', validateIntParam);

router.post(
  'report.user.create',
  '/users/:userId/reports',
  authJWT,
  getUserIdFromToken,
  requiredParams({
    reason: 'string',
  }),
  async (ctx) => {
    const reportedUserId = ctx.params.userId;
    const { reason } = ctx.request.body;
    const reportedUser = await ctx.orm.User.findByPk(reportedUserId, {
      attributes: { exclude: ['hashedPassword'] },
    });
    if (reportedUser === null) {
      throw new ApiError(404, `Could not find user with id '${reportedUserId}'`);
    }
    try {
      const userReport = await reportedUser.createMadeUserReport({
        userId: ctx.state.userId,
        reportedUserId,
        reason,
      });
      ctx.status = 201;
      ctx.body = {
        id: userReport.id,
      };
    } catch (error) {
      throw new ApiError(400, `Could not create report for user with id '${reportedUserId}'`);
    }
  },
);

router.post(
  'report.comment.create',
  '/comments/:commentId/reports',
  authJWT,
  getUserIdFromToken,
  loadSingleComment,
  requiredParams({
    reason: 'string',
  }),
  async (ctx) => {
    const { commentId } = ctx.params;
    const { reason } = ctx.request.body;
    try {
      const commentReport = await ctx.state.comment.createReceivedCommentReport({
        userId: ctx.state.userId,
        commentId,
        reason,
      });
      ctx.status = 201;
      ctx.body = {
        id: commentReport.id,
      };
    } catch (error) {
      throw new ApiError(400, `Could not create report for comment with id '${commentId}'`);
    }
  },
);

module.exports = router;
