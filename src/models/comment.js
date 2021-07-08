const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      this.belongsTo(models.Property, {
        foreignKey: 'propertyId',
      });
      this.hasMany(models.ReportComment, {
        as: 'receivedCommentReports',
        foreignKey: 'commentId',
        onDelete: 'CASCADE',
        hooks: true,
      });
    }
  }
  Comment.init(
    {
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Comment body cannot be empty',
          },
          len: {
            args: [1, 500],
            msg: 'Comment cannot be longer than 500 characters',
          },
        },
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          isNumeric: true,
        },
      },
      propertyId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          isNumeric: true,
        },
      },
    },
    {
      sequelize,
      modelName: 'Comment',
    },
  );
  return Comment;
};
