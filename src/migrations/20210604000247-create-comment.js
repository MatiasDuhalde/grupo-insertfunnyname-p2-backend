module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'User', key: 'id'},
      },
      propertyId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'Property', key: 'id'},
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Comments');
  },
};
