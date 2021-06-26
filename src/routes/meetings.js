const KoaRouter = require('koa-router');
const ApiError = require('./utils/apiError');

const {
  validateIntParam, //
  authJWT,
  getUserIdFromToken,
  requiredParams,
} = require('./utils/utils');
const { loadSingleProperty, loadSingleMeeting } = require('./utils/queries');

const router = new KoaRouter();

router.param('propertyId', validateIntParam);
router.param('meetingId', validateIntParam);

router.post(
  'property.meeting.create',
  '/properties/:propertyId/meetings',
  authJWT,
  getUserIdFromToken,
  loadSingleProperty,
  requiredParams({
    type: 'string',
    date: 'string',
  }),
  async (ctx) => {
    const { type, date } = ctx.request.body;
    if (ctx.state.userId === ctx.state.property.userId) {
      throw new ApiError(400, 'Cannot create meeting for your own property');
    }
    try {
      const meeting = await ctx.orm.Meeting.create({
        buyerId: ctx.state.userId,
        sellerId: ctx.state.property.userId,
        propertyId: ctx.state.property.id,
        type,
        date,
      });
      ctx.status = 201;
      ctx.body = {
        id: meeting.id,
      };
    } catch (error) {
      const errors = {};
      if (error instanceof ctx.orm.Sequelize.ValidationError) {
        error.errors.forEach((errorItem) => {
          errors[errorItem.path] = errorItem.message;
        });
        throw new ApiError(400, 'Could not create meeting', { errors });
      }
      throw error;
    }
  },
);

router.get(
  'property.meeting.list',
  '/properties/:propertyId/meetings',
  authJWT,
  getUserIdFromToken,
  loadSingleProperty,
  async (ctx) => {
    if (ctx.state.userId !== ctx.state.property.userId) {
      ctx.throw(401, 'Unauthorized');
    }
    try {
      const meetings = await ctx.state.property.getMeetings();
      ctx.body = {
        meetings,
      };
    } catch (error) {
      throw new ApiError(
        400,
        `Could not retrieve property listing '${ctx.state.property.id}' meetings`,
      );
    }
  },
);

router.get('user.meeting.list', '/users/me/meetings', authJWT, getUserIdFromToken, async (ctx) => {
  try {
    const user = await ctx.orm.User.findByPk(ctx.state.userId);
    const sellerMeetings = await user.getSellerMeetings();
    const buyerMeetings = await user.getBuyerMeetings();
    ctx.body = {
      sellerMeetings,
      buyerMeetings,
    };
  } catch (error) {
    throw new ApiError(400, `Could not retrieve user '${ctx.state.userId}' meetings`);
  }
});

router.get(
  'meeting.show',
  '/meetings/:meetingId',
  authJWT,
  getUserIdFromToken,
  loadSingleMeeting,
  async (ctx) => {
    const { userId } = ctx.state;
    const { buyerId, sellerId } = ctx.state.meeting;
    if (userId !== buyerId && userId !== sellerId) {
      ctx.throw(401, 'Unauthorized');
    }
    ctx.response.body = { meeting: ctx.state.meeting };
  },
);

router.patch(
  'meeting.edit',
  '/meetings/:meetingId',
  authJWT,
  getUserIdFromToken,
  loadSingleMeeting,
  async (ctx) => {
    const { userId } = ctx.state;
    const { buyerId, sellerId } = ctx.state.meeting;
    if (userId !== buyerId && userId !== sellerId) {
      ctx.throw(401, 'Unauthorized');
    }
    try {
      Object.keys(ctx.request.body).forEach((key) => {
        ctx.state.meeting[key] = ctx.request.body[key];
      });
      await ctx.state.meeting.save();
      ctx.status = 204;
    } catch (error) {
      const errors = {};
      if (error instanceof ctx.orm.Sequelize.ValidationError) {
        error.errors.forEach((errorItem) => {
          errors[errorItem.path] = errorItem.message;
        });
        throw new ApiError(400, 'Could not modify meeting', { errors });
      }
      throw error;
    }
  },
);

router.delete(
  'meeting.delete',
  '/meetings/:meetingId',
  authJWT,
  getUserIdFromToken,
  loadSingleMeeting,
  async (ctx) => {
    const { userId } = ctx.state;
    const { buyerId, sellerId } = ctx.state.meeting;
    if (userId !== buyerId && userId !== sellerId) {
      ctx.throw(401, 'Unauthorized');
    }
    try {
      ctx.state.meeting.destroy();
      ctx.status = 204;
    } catch (error) {
      throw new ApiError(400, 'Could not delete meeting');
    }
  },
);

module.exports = router;
