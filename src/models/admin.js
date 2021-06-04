const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    validatePassword(password) {
      return bcrypt.compare(password, this.hashedPassword);
    }
  }
  Admin.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "There's already another account using that email",
        },
        validate: {
          isEmail: {
            args: true,
            msg: 'Email must have a valid format',
          },
        },
      },
      hashedPassword: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      modelName: 'Admin',
    },
  );
  return Admin;
};
