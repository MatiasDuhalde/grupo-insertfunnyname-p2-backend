const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReportComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      this.belongsTo(models.Comment, {
        foreignKey: 'commentId',
      });
    }
  }
  ReportComment.init(
    {
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          isNumeric: true,
        },
      },
      commentId: {
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
      modelName: 'ReportComment',
    },
  );
  return ReportComment;
};
