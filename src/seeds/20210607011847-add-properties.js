const { generateRandomProperties } = require('./utils/properties');

module.exports = {
  up: async (queryInterface) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    const query = await queryInterface.sequelize.query('SELECT id, "createdAt" from "Users";');
    const users = query[0];
    const properties = generateRandomProperties(75, users);

    await queryInterface.bulkInsert('Properties', properties, {});
  },

  down: async (queryInterface) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Properties', null, {});
  },
};
