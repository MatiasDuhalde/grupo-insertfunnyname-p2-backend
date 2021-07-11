const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Comment routes', () => {
  const dummyReportedUser = {
    firstName: 'Buyer',
    lastName: 'User',
    email: 'buyer@gmail.com',
    hashedPassword: 'testuser',
    avatarLink: 'https://cdn.fakercloud.com/avatars/tgerken_128.jpg',
  };
  const dummyReporterUser = {
    firstName: 'Seller',
    lastName: 'User',
    email: 'seller@gmail.com',
    hashedPassword: 'testuser',
    avatarLink: 'https://cdn.fakercloud.com/avatars/tgerken_128.jpg',
  };
  const dummyProperty = {
    title: 'My test property',
    type: 'cabin',
    bathrooms: 10,
    bedrooms: 100,
    size: 100,
    region: 'Test region',
    commune: 'Test commune',
    street: 'Test street',
    streetNumber: 0,
    description: 'Generic description',
    price: 1,
    listingType: 'sale',
    imageLink:
      'https://ia800707.us.archive.org/25/items/MinecraftSmallDirtHouse/Minecraft_Small_Dirt_House.png',
  };
  const dummyComment = {
    body: 'this is a test comment',
  };
  const dummyReport = {
    reason: 'random reason',
  };

  let reportedUser;
  let comment;
  let property;
  let authReporterUser;

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    // Create test user
    reportedUser = await app.context.orm.User.create(dummyReportedUser);
    await app.context.orm.User.create(dummyReporterUser);

    authReporterUser = (
      await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyReporterUser.email, password: dummyReporterUser.hashedPassword })
    ).body;

    dummyProperty.userId = reportedUser.id;
    property = await app.context.orm.Property.create(dummyProperty);

    dummyComment.userId = reportedUser.id;
    dummyComment.propertyId = property.id;
    comment = await app.context.orm.Comment.create(dummyComment);
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('POST /users/:userId/reports', () => {
    describe('when user is authorized', () => {
      describe('when fields are empty', () => {
        let response;
        beforeAll(async () => {
          response = await request
            .post(`/users/${reportedUser.id}/reports`)
            .set('Content-type', 'application/json')
            .auth(authReporterUser.token, { type: 'bearer' })
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
        const wrongReportFields = {
          reason: null,
        };

        beforeAll(async () => {
          response = await request
            .post(`/users/${reportedUser.id}/reports`)
            .set('Content-type', 'application/json')
            .auth(authReporterUser.token, { type: 'bearer' })
            .send(wrongReportFields);
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
            .post(`/users/${reportedUser.id}/reports`)
            .set('Content-type', 'application/json')
            .auth(authReporterUser.token, { type: 'bearer' })
            .send(dummyReport);
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
          .post(`/users/${reportedUser.id}/reports`)
          .set('Content-type', 'application/json')
          .send(dummyReport);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });

  describe('POST /comments/:commentId/reports', () => {
    describe('when user is authorized', () => {
      describe('when fields are empty', () => {
        let response;
        beforeAll(async () => {
          response = await request
            .post(`/comments/${comment.id}/reports`)
            .set('Content-type', 'application/json')
            .auth(authReporterUser.token, { type: 'bearer' })
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
        const wrongReportFields = {
          reason: null,
        };

        beforeAll(async () => {
          response = await request
            .post(`/comments/${comment.id}/reports`)
            .set('Content-type', 'application/json')
            .auth(authReporterUser.token, { type: 'bearer' })
            .send(wrongReportFields);
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
            .post(`/comments/${comment.id}/reports`)
            .set('Content-type', 'application/json')
            .auth(authReporterUser.token, { type: 'bearer' })
            .send(dummyReport);
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
          .post(`/comments/${comment.id}/reports`)
          .set('Content-type', 'application/json')
          .send(dummyReport);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });
});
