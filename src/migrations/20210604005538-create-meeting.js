module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Meetings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      buyerId: {
        type: Sequelize.BIGINT,
        onDelete: 'CASCADE',
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      sellerId: {
        type: Sequelize.BIGINT,
        onDelete: 'CASCADE',
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      propertyId: {
        type: Sequelize.BIGINT,
        onDelete: 'CASCADE',
        allowNull: false,
        references: { model: 'Properties', key: 'id' },
      },
      type: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Meetings');
  },
};
