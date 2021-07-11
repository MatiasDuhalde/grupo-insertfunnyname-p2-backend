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

    const propertyImages = {
      house: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6',
      apartment: 'https://images.unsplash.com/photo-1484154218962-a197022b5858',
      tent: 'https://images.unsplash.com/photo-1565578151233-45758846ae9a',
      cabin: 'https://images.unsplash.com/photo-1568729937315-2ef5ee9cf4f2',
      lot: 'https://pinnacle.ph/images/properties/P3121578/P3121578.jpg',
      farm: 'https://images.unsplash.com/photo-1523867574998-1a336b6ded04',
      room: 'https://images.unsplash.com/photo-1549638441-b787d2e11f14',
      mansion: 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2',
      business: 'https://images.unsplash.com/photo-1527368746281-798b65e1ac6e',
      office: 'https://images.unsplash.com/photo-1577412647305-991150c7d163',
      other: 'https://images.unsplash.com/photo-1587071915152-c4360eff3eb5',
    };
    const promises = Object.keys(propertyImages).map((key) => {
      const image = propertyImages[key];
      return queryInterface.bulkUpdate('Properties', { imageLink: image }, { type: key });
    });
    await Promise.all(promises);
  },

  down: async (queryInterface) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkUpdate(
      'Properties',
      {
        imageLink:
          'https://ia800707.us.archive.org/25/items/MinecraftSmallDirtHouse/Minecraft_Small_Dirt_House.png',
      },
      {},
    );
  },
};
