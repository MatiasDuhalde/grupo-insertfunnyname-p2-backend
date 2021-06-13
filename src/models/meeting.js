const { Model } = require('sequelize');

const MEETING_TYPES = ['remote', 'face-to-face'];

module.exports = (sequelize, DataTypes) => {
  class Meeting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        as: 'buyerUser',
        foreignKey: 'buyerId',
      });
      this.belongsTo(models.User, {
        as: 'sellerUser',
        foreignKey: 'sellerId',
      });
      this.belongsTo(models.Property, {
        foreignKey: 'propertyId',
      });
    }
  }
  Meeting.init(
    {
      buyerId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          isNumeric: true,
          notSellerId(value) {
            return this.sellerId !== value;
          },
        },
      },
      sellerId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          isNumeric: true,
          notBuyerId(value) {
            return this.buyerId !== value;
          },
        },
      },
      propertyId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          isNumeric: true,
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [MEETING_TYPES],
            msg: `Type must be one of the following: ${MEETING_TYPES.join(', ')}`,
          },
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isAfter: {
            args: [new Date().toISOString()],
            msg: 'Date cannot be earlier than present',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Meeting',
    },
  );
  return Meeting;
};
