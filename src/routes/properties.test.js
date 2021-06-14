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
  describe('GET /properties', () => {
    const dummyProperty1 = {
      title: 'Cool House and Such',
      type: 'other',
      region: 'Metropolitana',
      commune: 'Macul',
      street: 'Vicuña Mackenna 4860',
      price: 1,
      listingType: 'rent',
    };
    const dummyProperty2 = {
      title: 'Cool House and Such the Sequel',
      type: 'other',
      region: 'Metropolitana',
      commune: 'Macul',
      street: 'Vicuña Mackenna 4860, Campus 2',
      price: 2,
      listingType: 'rent',
    };

    const dummyProperty3 = {
      title: 'The house electric boogaloo',
      type: 'other',
      region: 'Maule',
      commune: 'Linares',
      street: 'My street 123',
      price: 100,
      listingType: 'rent',
    };

    const authorizedPostProperty = (body) => {
      const req = request
        .post('/properties')
        .auth(auth.token, { type: 'bearer' })
        .set('Content-type', 'application/json');
      return req.send(body);
    };

    const authorizedGetProperties = () => request
      .get('/properties')
      .auth(auth.token, { type: 'bearer' });

    let getResponse;
    describe('when user sees properties', () => {
      beforeAll(async () => {
        await authorizedPostProperty(dummyProperty1);
        await authorizedPostProperty(dummyProperty2);
        await authorizedPostProperty(dummyProperty3);
        getResponse = await authorizedGetProperties();
      });
      test('responds with 200 status code', () => {
        expect(getResponse.status).toBe(200);
      });
      test('responds with a json body type', () => {
        expect(getResponse.type).toEqual('application/json');
      });
    });
  });
  describe('Get /property/:id', () => {
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
        .post('/property')
        .auth(auth.token, { type: 'bearer' })
        .set('Content-type', 'application/json');
      return req.send(body);
    };

    const authorizedGetProperty = (id) => request
      .get(`/property/${id}`)
      .auth(auth.token, { type: 'bearer' });

    const unauthorizedGetProperty = (id) => request.get(`/property/${id}`);

    let getResponseAuthorized;
    let getResponseUnauthorized;

    let property;
    beforeAll(async () => {
      await authorizedPostProperty(dummyProperty);
      property = await app.context.orm.Property.findOne({ where: { userId: 1 } });
      getResponseAuthorized = await authorizedGetProperty(property.dataValues.id);
      getResponseUnauthorized = await unauthorizedGetProperty(property.dataValues.id);
      console.log(getResponseAuthorized); // Issue finding ID in Property
    });
  
    describe('when user sees an authorized property', () => {
      test('responds with 200 status code', async () => {
        expect(getResponseAuthorized.status).toBe(200);
      });
    });

    describe('when user sees an unauthorized property', () => {
      test('responds with 401 status code', () => {
        expect(getResponseUnauthorized.status).toBe(401);
      });
    });
  });
});
