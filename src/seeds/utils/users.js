const bcrypt = require('bcrypt');
const faker = require('faker');

const PASSWORD_SALT_ROUNDS = 8;

const generateRandomUser = () => {
  const randomDate = faker.date.between('2016-04-30', '2021-06-06');
  const user = {
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    avatarLink: faker.image.avatar(),
    createdAt: randomDate,
    updatedAt: randomDate,
  };
  user.hashedPassword = bcrypt.hashSync(
    user.email.split('@')[0],
    bcrypt.genSaltSync(PASSWORD_SALT_ROUNDS),
  );
  return user;
};

module.exports = {
  generateRandomUsers: (n = 1) => {
    const users = [];
    for (let i = 0; i < n; i += 1) {
      users.push(generateRandomUser());
    }
    return users;
  },
};
