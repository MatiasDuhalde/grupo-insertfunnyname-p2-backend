const ApiError = require('./apiError');

const loadSingleProperty = async (ctx, next) => {
  const { propertyId } = ctx.params;
  ctx.state.property = await ctx.orm.Property.findByPk(propertyId);
  if (!ctx.state.property) throw new ApiError(404, `Property listing '${propertyId}' not found`);
  return next();
};

const loadSingleComment = async (ctx, next) => {
  const { commentId } = ctx.params;
  ctx.state.comment = await ctx.orm.Comment.findByPk(commentId);
  if (!ctx.state.comment) throw new ApiError(404, `Comment '${commentId}' not found`);
  return next();
};

const loadSingleMeeting = async (ctx, next) => {
  const { meetingId } = ctx.params;
  ctx.state.meeting = await ctx.orm.Meeting.findByPk(meetingId, {
    include: [
      {
        model: ctx.orm.User,
        as: 'buyerUser',
        attributes: ['id', 'firstName', 'lastName', 'avatarLink', 'email'],
      },
      {
        model: ctx.orm.User,
        as: 'sellerUser',
        attributes: ['id', 'firstName', 'lastName', 'avatarLink', 'email'],
      },
    ],
  });
  if (!ctx.state.meeting) throw new ApiError(404, `Meeting '${meetingId}' not found`);
  return next();
};

const loadSingleUser = async (ctx, next) => {
  const { userId } = ctx.params;
  ctx.state.user = await ctx.orm.User.findByPk(userId);
  if (!ctx.state.user) throw new ApiError(404, `User '${userId}' not found`);
  return next();
};

module.exports = {
  loadSingleProperty,
  loadSingleComment,
  loadSingleMeeting,
  loadSingleUser,
};
