module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'price', {
      allowNull: false,
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('Properties', 'listingType', {
      allowNull: false,
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Properties', 'price');
    await queryInterface.removeColumn('Properties', 'listingType');
  },
};
