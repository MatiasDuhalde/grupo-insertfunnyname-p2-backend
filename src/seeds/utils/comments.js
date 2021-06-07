const faker = require('faker');

const generateRandomComment = (user, property) => {
  const maxDate = Math.max(property.createdAt, user.createdAt);
  const randomDate = faker.date.between(new Date(maxDate), '2021-06-06');
  const comment = {
    userId: user.id,
    propertyId: property.id,
    body: faker.lorem.words(Math.floor(Math.random() * 100)),
    createdAt: randomDate,
    updatedAt: randomDate,
  };
  return comment;
};

module.exports = {
  generateRandomComments: (n = 1, users, properties) => {
    const comments = [];
    for (let i = 0; i < n; i += 1) {
      const user = users[Math.floor(Math.random() * users.length)];
      const property = properties[Math.floor(Math.random() * properties.length)];
      comments.push(generateRandomComment(user, property));
    }
    return comments;
  },
};
