module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'imageLink', {
      allowNull: false,
      type: Sequelize.STRING,
      defaultValue:
        'https://ia800707.us.archive.org/25/items/MinecraftSmallDirtHouse/Minecraft_Small_Dirt_House.png',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Properties', 'imageLink');
  },
};
