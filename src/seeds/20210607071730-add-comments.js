const { generateRandomComments } = require('./utils/comments');

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

    const usersQuery = await queryInterface.sequelize.query('SELECT id, "createdAt" from "Users";');
    const users = usersQuery[0];
    const propertiesQuery = await queryInterface.sequelize.query(
      'SELECT id, "createdAt" from "Properties";',
    );
    const properties = propertiesQuery[0];

    const comments = generateRandomComments(properties.length * 3, users, properties);

    await queryInterface.bulkInsert('Comments', comments, {});
  },

  down: async (queryInterface) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Comments', null, {});
  },
};
