const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

const PASSWORD_SALT_ROUNDS = 8;

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Comment, {
        foreignKey: 'userId',
      });
      this.hasMany(models.Property, {
        foreignKey: 'userId',
      });
      this.hasMany(models.Reports, {
        as: 'madeReports',
        foreignKey: 'userId',
      });
      this.hasMany(models.Reports, {
        as: 'receivedReports',
        foreignKey: 'reportedUserId',
      });
      this.hasMany(models.Meeting, {
        as: 'buyerMeetings',
        foreignKey: 'buyerId',
      });
      this.hasMany(models.Meeting, {
        as: 'sellerMeetings',
        foreignKey: 'sellerId',
      });
    }

    getFullName() {
      return `${this.firstName} ${this.lastName}`;
    }

    static generateHash(password) {
      if (password.length < 6) {
        throw Error('Password must be at least 6 characters');
      }
      return bcrypt.hash(password, bcrypt.genSaltSync(PASSWORD_SALT_ROUNDS));
    }

    validatePassword(password) {
      return bcrypt.compare(password, this.hashedPassword);
    }
  }
  User.init(
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
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'First name cannot be empty',
          },
          len: {
            args: [2, 70],
            msg: 'First name length must be between 2 and 70 characters',
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'First name cannot be empty',
          },
          len: {
            args: [2, 70],
            msg: 'First name length must be between 2 and 70 characters',
          },
        },
      },
      avatarLink: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true,
          notEmpty: false,
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
      modelName: 'User',
    },
  );

  User.beforeSave(async (instance) => {
    if (instance.changed('email')) {
      const email = await sequelize.models.Admin.findOne({ where: { email: instance.email } });
      if (email) {
        throw Error("There's already another account using that email");
      }
    }
    if (instance.changed('hashedPassword')) {
      const hash = await User.generateHash(instance.hashedPassword);
      instance.set('hashedPassword', hash);
    }
  });

  return User;
};
