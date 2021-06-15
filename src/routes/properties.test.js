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
    // Create test user
    await app.context.orm.User.create(dummyUser);

    // Get auth token
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

    describe('when user is authorized', () => {
      describe('when fields are empty', () => {
        let response;
        beforeAll(async () => {
          response = await request
            .post('/properties')
            .set('Content-type', 'application/json')
            .auth(auth.token, { type: 'bearer' })
            .send({});
        });

        test('responds with 422 status code', () => {
          expect(response.status).toBe(422);
        });

        test('responds with JSON body type', () => {
          expect(response.type).toEqual('application/json');
        });
      });

      describe('when fields are invalid', () => {
        let response;
        const wrongPropertyFields = {
          title: '',
          type: 'something wrong',
          bathrooms: 1000,
          bedrooms: -1,
          size: -1,
          region: null,
          commune: null,
          street: null,
          streetNumber: 9999999999,
          description: 'Generic description',
          price: -100,
          listingType: 'something wrong',
        };

        beforeAll(async () => {
          response = await request
            .post('/properties')
            .set('Content-type', 'application/json')
            .auth(auth.token, { type: 'bearer' })
            .send(wrongPropertyFields);
        });

        test('responds with 422 status code', () => {
          expect(response.status).toBe(422);
        });

        test('responds with JSON body type', () => {
          expect(response.type).toEqual('application/json');
        });
      });

      describe('when fields are valid', () => {
        let response;

        beforeAll(async () => {
          response = await request
            .post('/properties')
            .set('Content-type', 'application/json')
            .auth(auth.token, { type: 'bearer' })
            .send(dummyProperty);
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
    });

    describe('when user is not authorized', () => {
      let response;

      beforeAll(async () => {
        response = await request
          .post('/properties')
          .set('Content-type', 'application/json')
          .send(dummyProperty);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });

  describe('GET /properties', () => {
    const dummyProperties = [
      {
        title: 'Cool House and Such',
        type: 'other',
        region: 'Metropolitana',
        commune: 'Macul',
        street: 'Vicuña Mackenna 4860',
        price: 1,
        listingType: 'rent',
      },
      {
        title: 'Cool House and Such the Sequel',
        type: 'other',
        region: 'Metropolitana',
        commune: 'Macul',
        street: 'Vicuña Mackenna 4860, Campus 2',
        price: 2,
        listingType: 'rent',
      },
      {
        title: 'The house electric boogaloo',
        type: 'other',
        region: 'Maule',
        commune: 'Linares',
        street: 'My street 123',
        price: 100,
        listingType: 'rent',
      },
    ];

    beforeAll(async () => {
      const promises = dummyProperties.map((body) => {
        const req = request
          .post('/properties')
          .auth(auth.token, { type: 'bearer' })
          .set('Content-type', 'application/json')
          .send(body);
        return req;
      });
      await Promise.all(promises);
    });

    describe('when user sees properties', () => {
      let response;

      beforeAll(async () => {
        response = await request.get('/properties');
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('responds with properties', () => {
        expect(response.body).toHaveProperty('properties');
      });

      test('responds with list of properties', () => {
        expect(response.body.properties).toBeInstanceOf(Array);
      });

      test(`responds with list with ${dummyProperties.length} or more elements`, () => {
        expect(response.body.properties.length).toBeGreaterThanOrEqual(dummyProperties.length);
      });

      test('responds with matching property contents', () => {
        expect(response.body.properties).toEqual(
          expect.arrayContaining([expect.objectContaining(dummyProperties[1])]),
        );
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

    let property;
    beforeAll(async () => {
      property = await request
        .post('/properties')
        .auth(auth.token, { type: 'bearer' })
        .set('Content-type', 'application/json')
        .send(dummyProperty);
    });

    describe('when property id exists', () => {
      let response;

      beforeAll(async () => {
        response = await request.get(`/properties/${property.body.id}`).send();
      });

      test('responds with 200 status code', async () => {
        expect(response.status).toBe(200);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('responds with property', () => {
        expect(response.body).toHaveProperty('property');
      });

      test('responds with property object', () => {
        expect(response.body.property).toBeInstanceOf(Object);
      });

      test('responds with matching property contents', () => {
        expect(response.body.property).toMatchObject(dummyProperty);
      });
    });

    describe('when property does not exist', () => {
      let response;

      beforeAll(async () => {
        response = await request.get('/properties/1000').send();
      });

      test('responds with 404 status code', async () => {
        expect(response.status).toBe(404);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
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

    let property;
    beforeAll(async () => {
      // Create property
      property = await request
        .post('/properties')
        .auth(auth.token, { type: 'bearer' })
        .set('Content-type', 'application/json')
        .send(dummyProperty);
    });

    describe('when authorized user modifies a property', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .patch(`/properties/${property.body.id}`)
          .auth(auth.token, { type: 'bearer' })
          .set('Content-type', 'application/json')
          .send(modifiedDummyProperty);
      });

      test('responds with 204 status code', () => {
        expect(response.status).toBe(204);
      });

      test('responds with an empty body type', () => {
        expect(response.type).toEqual('');
      });
    });

    describe('when unauthorized user modifies a property', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .patch(`/properties/${property.body.id}`)
          .set('Content-type', 'application/json')
          .send(modifiedDummyProperty);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with an empty body type', () => {
        expect(response.type).toEqual('text/plain');
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

    let property;
    beforeAll(async () => {
      property = await request
        .post('/properties')
        .auth(auth.token, { type: 'bearer' })
        .set('Content-type', 'application/json')
        .send(dummyProperty);
    });

    describe('when authorized user deletes a property', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .delete(`/properties/${property.body.id}`)
          .auth(auth.token, { type: 'bearer' })
          .send();
      });

      test('responds with 204 status code', () => {
        expect(response.status).toBe(204);
      });

      test('responds with an empty body type', () => {
        expect(response.type).toEqual('');
      });
    });

    describe('when unauthorized user deletes a property', () => {
      let response;
      beforeAll(async () => {
        response = await request.delete(`/properties/${property.body.id}`).send();
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with an empty body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });
});
