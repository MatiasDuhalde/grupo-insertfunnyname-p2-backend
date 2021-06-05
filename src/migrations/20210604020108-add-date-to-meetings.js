module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Meetings', 'date', {
      allowNull: false,
      type: Sequelize.DATE,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Meetings', 'date');
  },
};
