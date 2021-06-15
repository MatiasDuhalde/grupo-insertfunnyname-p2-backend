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
      test('responds with a JSON body type', () => {
        expect(getResponse.type).toEqual('application/json');
      });
    });
  });
  describe('GET /property/:propertyId', () => {
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

    const authorizedGetProperty = (id) => request
      .get(`/properties/${id}`)
      .auth(auth.token, { type: 'bearer' });

    let getResponseAuthorized;

    let property;
    beforeAll(async () => {
      property = await authorizedPostProperty(dummyProperty);
      getResponseAuthorized = await authorizedGetProperty(property.body.id);
    });
    describe('when user sees an authorized property', () => {
      test('responds with 200 status code', async () => {
        expect(getResponseAuthorized.status).toBe(200);
      });
      test('responds with JSON body type', () => {
        expect(getResponseAuthorized.type).toEqual('application/json');
      });
    });
  });
  describe('PATCH /properties/:propertyId', () => {
    const dummyProperty = {
      title: 'Cool House and Such',
      type: 'other',
      region: 'Metropolitana',
      commune: 'Macul',
      street: 'Vicuña Mackenna 4860',
      price: 1,
      listingType: 'rent',
    };

    const modifiedDummyProperty = {
      title: 'Cool House and Such Modified',
      street: 'Vicuña Mackenna 480',
      price: 112,
    };

    const authorizedPostProperty = (body) => {
      const req = request
        .post('/properties')
        .auth(auth.token, { type: 'bearer' })
        .set('Content-type', 'application/json');
      return req.send(body);
    };

    const authorizedPatchProperty = (id, body) => {
      const req = request
        .patch(`/properties/${id}`)
        .auth(auth.token, { type: 'bearer' })
        .set('Content-type', 'application/json');
      return req.send(body);
    };

    const unauthorizedPatchProperty = (id, body) => {
      const req = request
        .patch(`/properties/${id}`)
        .set('Content-type', 'application/json');
      return req.send(body);
    };

    let property;
    let patchResponseAuthorized;
    let patchResponseUnauthorized;
    beforeAll(async () => {
      property = await authorizedPostProperty(dummyProperty);
      patchResponseAuthorized = await authorizedPatchProperty(property.body.id,
        modifiedDummyProperty);
      patchResponseUnauthorized = await unauthorizedPatchProperty(property.body.id,
        modifiedDummyProperty);
    });

    describe('when authorized user modifies a property', () => {
      test('responds with 204 status code', () => {
        expect(patchResponseAuthorized.status).toBe(204);
      });
      test('responds with an empty body type', () => {
        expect(patchResponseAuthorized.type).toEqual('');
      });
    });
    describe('when unauthorized user modifies a property', () => {
      test('responds with 401 status code', () => {
        expect(patchResponseUnauthorized.status).toBe(401);
      });
      test('responds with an empty body type', () => {
        expect(patchResponseUnauthorized.type).toEqual('text/plain');
      });
    });
  });
  describe('DELETE /properties/:propertyId', () => {
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

    const authorizedDeleteProperty = (id) => request
      .delete(`/properties/${id}`)
      .auth(auth.token, { type: 'bearer' });

    const unauthorizedDeleteProperty = (id) => request
      .delete(`/properties/${id}`);

    let property;
    let deleteResponseAuthorized;
    let deleteResponseUnauthorized;
    beforeAll(async () => {
      property = await authorizedPostProperty(dummyProperty);
      deleteResponseAuthorized = await authorizedDeleteProperty(property.body.id);
      deleteResponseUnauthorized = await unauthorizedDeleteProperty(property.body.id);
    });

    describe('when authorized user deletes a property', () => {
      test('responds with 204 status code', () => {
        expect(deleteResponseAuthorized.status).toBe(204);
      });
      test('responds with an empty body type', () => {
        expect(deleteResponseAuthorized.type).toEqual('');
      });
    });
    describe('when unauthorized user deletes a property', () => {
      test('responds with 401 status code', () => {
        expect(deleteResponseUnauthorized.status).toBe(401);
      });
      test('responds with an empty body type', () => {
        expect(deleteResponseUnauthorized.type).toEqual('text/plain');
      });
    });
  });
});
