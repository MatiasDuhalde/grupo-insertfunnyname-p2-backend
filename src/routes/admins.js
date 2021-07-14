const KoaRouter = require('koa-router');
const ApiError = require('./utils/apiError');
const { loadSingleProperty, loadSingleComment, loadSingleUser } = require('./utils/queries');

const { validateIntParam, authJWT, getAdminIdFromToken } = require('./utils/utils');

const router = new KoaRouter();

router.param('userId', validateIntParam);
router.param('propertyId', validateIntParam);
router.param('commentId', validateIntParam);

router.get('admin.report.list', '/admin/reports', authJWT, getAdminIdFromToken, async (ctx) => {
  const commentReports = await ctx.orm.ReportComment.findAll({
    include: [{ model: ctx.orm.Comment, attributes: ['body', 'createdAt'] }],
  });
  const userReports = await ctx.orm.ReportUser.findAll({
    include: [
      {
        model: ctx.orm.User,
        as: 'reportedUser',
        attributes: ['id', 'firstName', 'lastName', 'avatarLink', 'email'],
      },
    ],
  });

  ctx.body = {
    commentReports,
    userReports,
  };
});

router.delete(
  'admin.user.delete',
  '/admin/users/:userId',
  authJWT,
  getAdminIdFromToken,
  loadSingleUser,
  (ctx) => {
    try {
      ctx.state.user.destroy();
      ctx.status = 204;
    } catch (error) {
      throw new ApiError(400, 'Could not delete user');
    }
  },
);

router.delete(
  'admin.propery.delete',
  '/admin/properties/:propertyId',
  authJWT,
  getAdminIdFromToken,
  loadSingleProperty,
  (ctx) => {
    try {
      ctx.state.property.destroy();
      ctx.status = 204;
    } catch (error) {
      throw new ApiError(400, 'Could not delete property listing');
    }
  },
);

router.delete(
  'admin.comment.delete',
  '/admin/properties/:propertyId/comments/:commentId',
  authJWT,
  getAdminIdFromToken,
  loadSingleComment,
  (ctx) => {
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

module.exports = router;
