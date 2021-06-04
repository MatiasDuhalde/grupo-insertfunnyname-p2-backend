const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      this.hasMany(models.Comment, {
        foreignKey: 'propertyId',
      });
      this.hasMany(models.Meeting, {
        foreignKey: 'propertyId',
      });
    }
  }
  Property.init(
    {
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        
        validate: {
          isNumeric: true,
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Title cannot be empty',
          },
          len: {
            args: [1, 255],
            msg: 'Title length must be between 1 and 255 characters',
          },
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [
            [
              'house',
              'apartment',
              'tent',
              'cabin',
              'lot',
              'farm',
              'room',
              'mansion',
              'business',
              'office',
              'other',
            ],
          ],
        },
      },
      bathrooms: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isNumeric: true,
          min: {
            args: 0,
            msg: 'Bathroom quantity cannot be negative',
          },
          max: {
            args: 999,
            msg: 'Bathroom quantity cannot be larger than 999',
          },
        },
      },
      bedrooms: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isNumeric: true,
          min: {
            args: 0,
            msg: 'Bedroom quantity cannot be negative',
          },
          max: {
            args: 999,
            msg: 'Bedroom quantity cannot be larger than 999',
          },
        },
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isNumeric: true,
          min: {
            args: 0,
            msg: 'Size cannot be negative',
          },
          max: {
            args: 999999,
            msg: 'Size cannot be larger than 999999',
          },
        },
      },
      region: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Region name cannot be empty',
          },
          len: {
            args: [1, 255],
            msg: 'Region name length must be between 1 and 255 characters',
          },
        },
      },
      commune: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Commune name cannot be empty',
          },
          len: {
            args: [1, 255],
            msg: 'Commune name length must be between 1 and 255 characters',
          },
        },
      },
      street: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Street name cannot be empty',
          },
          len: {
            args: [1, 255],
            msg: 'Street name length must be between 1 and 255 characters',
          },
        },
      },
      streetNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isNumeric: true,
          min: {
            args: 0,
            msg: 'Street number cannot be negative',
          },
          max: {
            args: 999999,
            msg: 'Street number cannot be larger than 999999',
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 1000],
            msg: 'Description cannot be longer than 1000 characters',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Property',
    },
  );
  return Property;
};
