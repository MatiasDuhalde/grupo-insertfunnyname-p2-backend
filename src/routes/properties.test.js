const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Property routes', () => {
  const dummyUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@gmail.com',
    hashedPassword: 'testuser',
    avatarLink: 'https://cdn.fakercloud.com/avatars/tgerken_128.jpg',
  };

  let auth;

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    await app.context.orm.User.create(dummyUser);

    const authResponse = await request
      .post('/auth')
      .set('Content-type', 'application/json')
      .send({ email: dummyUser.email, password: dummyUser.hashedPassword });
    auth = authResponse.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('POST /property', () => {
    const dummyProperty = {
      title: 'Cool House and Such',
      type: 'other',
      region: 'Metropolitana',
      commune: 'Macul',
      street: 'Vicuña Mackenna 4860',
      price: 1,
      listingType: 'rent',
    };

    const authorizedPostProperty = (body) => {
      const req = request
        .post('/properties')
        .auth(auth.token, { type: 'bearer' })
        .set('Content-type', 'application/json');
      return req.send(body);
    };

    const unauthorizedPostProperty = (body) => {
      const req = request.post('/properties').set('Content-type', 'application/json');
      return req.send(body);
    };

    describe('when user is authorized', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedPostProperty(dummyProperty);
      });

      test('responds with 201 status code', () => {
        expect(response.status).toBe(201);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('responds with property id', () => {
        expect(response.body).toHaveProperty('id');
      });
    });

    describe('when user is not authorized', () => {
      let response;

      beforeAll(async () => {
        response = await unauthorizedPostProperty(dummyProperty);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });
});
