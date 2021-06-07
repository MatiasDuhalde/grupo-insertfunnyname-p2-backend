const bcrypt = require('bcrypt');

const PASSWORD_SALT_ROUNDS = 8;

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

    const nowDate = new Date();
    const adminEmails = [
      'catalina.alamos@uc.cl',
      'matias.duhalde@uc.cl',
      'faguzman2@uc.cl',
      'nicastillo@uc.cl',
    ];
    const admins = [];
    adminEmails.forEach((adminEmail) => {
      admins.push({
        email: adminEmail,
        hashedPassword: bcrypt.hashSync(
          adminEmail.split('@')[0],
          bcrypt.genSaltSync(PASSWORD_SALT_ROUNDS),
        ),
        createdAt: nowDate,
        updatedAt: nowDate,
      });
    });
    await queryInterface.bulkInsert('Admins', admins, {});
  },

  down: async (queryInterface) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Admins', null, {});
  },
};
