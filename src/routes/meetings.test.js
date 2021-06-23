const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Meeting routes', () => {
  const dummyUserBuyer = {
    firstName: 'Buyer',
    lastName: 'User',
    email: 'buyer@gmail.com',
    hashedPassword: 'testuser',
    avatarLink: 'https://cdn.fakercloud.com/avatars/tgerken_128.jpg',
  };
  const dummyUserSeller = {
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
  };
  const dummyMeeting = {
    type: 'remote',
    date: new Date('2022-10-09T15:00:00.000Z').toISOString(),
  };

  let authBuyer;
  let authSeller;
  let propertyId;
  let buyerUser;
  let sellerUser;

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    // Create test user
    buyerUser = await app.context.orm.User.create(dummyUserBuyer);
    sellerUser = await app.context.orm.User.create(dummyUserSeller);

    // Get auth token
    authBuyer = (
      await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyUserBuyer.email, password: dummyUserBuyer.hashedPassword })
    ).body;
    authSeller = (
      await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyUserSeller.email, password: dummyUserSeller.hashedPassword })
    ).body;

    dummyProperty.userId = sellerUser.id;

    const property = await app.context.orm.Property.create(dummyProperty);
    propertyId = property.id;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('POST /properties/:propertyId/meetings', () => {
    describe('when user is authorized', () => {
      describe('when fields are empty', () => {
        let response;
        beforeAll(async () => {
          response = await request
            .post(`/properties/${propertyId}/meetings`)
            .set('Content-type', 'application/json')
            .auth(authBuyer.token, { type: 'bearer' })
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
        const wrongMeetingFields = {
          type: 'invalid',
          date: new Date('1999'),
        };

        beforeAll(async () => {
          response = await request
            .post(`/properties/${propertyId}/meetings`)
            .set('Content-type', 'application/json')
            .auth(authBuyer.token, { type: 'bearer' })
            .send(wrongMeetingFields);
        });

        test('responds with 400 status code', () => {
          expect(response.status).toBe(400);
        });

        test('responds with JSON body type', () => {
          expect(response.type).toEqual('application/json');
        });
      });

      describe('when fields are valid', () => {
        let response;

        beforeAll(async () => {
          response = await request
            .post(`/properties/${propertyId}/meetings`)
            .set('Content-type', 'application/json')
            .auth(authBuyer.token, { type: 'bearer' })
            .send(dummyMeeting);
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
          .post(`/properties/${propertyId}/meetings`)
          .set('Content-type', 'application/json')
          .send(dummyProperty);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with text body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });

  describe('GET /properties/:propertyId/meetings', () => {
    const dummyMeetings = [
      {
        type: 'remote',
        date: new Date('2022-10-09T15:00:00.000Z').toISOString(),
      },
      {
        type: 'face-to-face',
        date: new Date('2022-08-09T15:00:00.000Z').toISOString(),
      },
      {
        type: 'remote',
        date: new Date('2021-12-18T22:00:00.000Z').toISOString(),
      },
    ];

    beforeAll(async () => {
      const promises = dummyMeetings.map((body) => {
        const req = request
          .post(`/properties/${propertyId}/meetings`)
          .auth(authBuyer.token, { type: 'bearer' })
          .set('Content-type', 'application/json')
          .send(body);
        return req;
      });
      await Promise.all(promises);
    });

    describe('when user seller sees meetings', () => {
      let response;

      beforeAll(async () => {
        response = await request
          .get(`/properties/${propertyId}/meetings`)
          .auth(authSeller.token, { type: 'bearer' })
          .send();
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('responds with meetings', () => {
        expect(response.body).toHaveProperty('meetings');
      });

      test('responds with list of meetings', () => {
        expect(response.body.meetings).toBeInstanceOf(Array);
      });

      test(`responds with list with ${dummyMeetings.length} or more elements`, () => {
        expect(response.body.meetings.length).toBeGreaterThanOrEqual(dummyMeetings.length);
      });

      test('responds with matching property contents', () => {
        expect(response.body.meetings).toEqual(
          expect.arrayContaining([expect.objectContaining(dummyMeetings[1])]),
        );
      });
    });
  });

  describe('GET /users/me/meetings', () => {
    describe('when user is authenticated', () => {
      let response;

      beforeAll(async () => {
        response = await request
          .get('/users/me/meetings')
          .auth(authSeller.token, { type: 'bearer' })
          .send();
      });

      test('responds with 200 status code', async () => {
        expect(response.status).toBe(200);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('responds with buyerMeetings and sellerMeetings', () => {
        expect(response.body).toHaveProperty('buyerMeetings');
        expect(response.body).toHaveProperty('sellerMeetings');
      });

      test('responds with Array objects', () => {
        expect(response.body.buyerMeetings).toBeInstanceOf(Array);
        expect(response.body.sellerMeetings).toBeInstanceOf(Array);
      });
    });

    describe('when property is not authenticated', () => {
      let response;

      beforeAll(async () => {
        response = await request.get('/users/me/meetings').send();
      });

      test('responds with 401 status code', async () => {
        expect(response.status).toBe(401);
      });

      test('responds with text body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });

  // GET HERE
  describe('GET /meetings/:meetingId', () => {
    let meetingId;
    beforeAll(async () => {
      const meeting = await app.context.orm.Meeting.create({
        sellerId: sellerUser.id,
        buyerId: buyerUser.id,
        propertyId,
        ...dummyMeeting,
      });
      meetingId = meeting.id;
    });

    describe('when seller user is authenticated', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .get(`/meetings/${meetingId}`)
          .auth(authSeller.token, { type: 'bearer' })
          .send();
      });
      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });
    describe('when buyer user is authenticated', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .get(`/meetings/${meetingId}`)
          .auth(authBuyer.token, { type: 'bearer' })
          .send();
      });
      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });
    describe('when user is not authenticated', () => {
      let response;
      beforeAll(async () => {
        response = await request.get(`/meetings/${meetingId}`).send();
      });
      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });
      test('responds with text body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });

  describe('PATCH /meetings/:meetingId', () => {
    const modifiedDummyMeeting = {
      body: 'modified comment',
    };

    let meetingId;
    beforeAll(async () => {
      const meeting = await app.context.orm.Meeting.create({
        sellerId: sellerUser.id,
        buyerId: buyerUser.id,
        propertyId,
        ...dummyMeeting,
      });
      meetingId = meeting.id;
    });

    describe('when authorized buyer user modifies a meeting', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .patch(`/meetings/${meetingId}`)
          .auth(authBuyer.token, { type: 'bearer' })
          .set('Content-type', 'application/json')
          .send(modifiedDummyMeeting);
      });

      test('responds with 204 status code', () => {
        expect(response.status).toBe(204);
      });

      test('responds with an empty body type', () => {
        expect(response.type).toEqual('');
      });
    });

    describe('when authorized seller user modifies a meeting', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .patch(`/meetings/${meetingId}`)
          .auth(authSeller.token, { type: 'bearer' })
          .set('Content-type', 'application/json')
          .send(modifiedDummyMeeting);
      });

      test('responds with 204 status code', () => {
        expect(response.status).toBe(204);
      });

      test('responds with an empty body type', () => {
        expect(response.type).toEqual('');
      });
    });

    describe('when unauthorized user modifies a comment', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .patch(`/meetings/${meetingId}`)
          .set('Content-type', 'application/json')
          .send(modifiedDummyMeeting);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with text body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });

  describe('DELETE /meetings/:meetingId', () => {
    let meetingId;
    beforeAll(async () => {
      const meeting = await app.context.orm.Meeting.create({
        sellerId: sellerUser.id,
        buyerId: buyerUser.id,
        propertyId,
        ...dummyMeeting,
      });
      meetingId = meeting.id;
    });

    beforeEach(async () => {
      const meeting = await app.context.orm.Meeting.create({
        sellerId: sellerUser.id,
        buyerId: buyerUser.id,
        propertyId,
        ...dummyMeeting,
      });
      meetingId = meeting.id;
    });

    describe('when authorized buyer user deletes a meeting', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .delete(`/meetings/${meetingId}`)
          .auth(authBuyer.token, { type: 'bearer' })
          .set('Content-type', 'application/json')
          .send();
      });

      test('responds with 204 status code', () => {
        expect(response.status).toBe(204);
      });

      test('responds with an empty body type', () => {
        expect(response.type).toEqual('');
      });
    });

    describe('when authorized seller user deletes a meeting', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .delete(`/meetings/${meetingId}`)
          .auth(authSeller.token, { type: 'bearer' })
          .set('Content-type', 'application/json')
          .send();
      });

      test('responds with 204 status code', () => {
        expect(response.status).toBe(204);
      });

      test('responds with an empty body type', () => {
        expect(response.type).toEqual('');
      });
    });

    describe('when unauthorized user deletes a comment', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .delete(`/meetings/${meetingId}`)
          .set('Content-type', 'application/json')
          .send();
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with text body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });
});
