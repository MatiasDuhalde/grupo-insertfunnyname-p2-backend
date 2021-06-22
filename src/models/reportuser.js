const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReportUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      this.belongsTo(models.User, {
        as: 'reportedUser',
        foreignKey: 'reportedUserId',
      });
    }
  }
  ReportUser.init(
    {
      userId: {
        type: DataTypes.BIGINT,
        anllowNull: false,
        validate: {
          isNumeric: true,
        },
      },
      reportedUserId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          isNumeric: true,
        },
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'You need a reason for the report',
          },
          len: {
            args: [1, 255],
            msg: 'Your report reason cannot be longer than 255 characters',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'ReportUser',
    },
  );
  return ReportUser;
};
