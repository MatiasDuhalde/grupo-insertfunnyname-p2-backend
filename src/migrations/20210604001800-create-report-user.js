module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ReportUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'User', key: 'id'},
      },
      reportedUserId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'User', key: 'id'},
      },
      reason: {
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
    await queryInterface.dropTable('ReportUsers');
  },
};
