const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Comment routes', () => {
  const dummyUserA = {
    firstName: 'Buyer',
    lastName: 'User',
    email: 'buyer@gmail.com',
    hashedPassword: 'testuser',
    avatarLink: 'https://cdn.fakercloud.com/avatars/tgerken_128.jpg',
  };
  const dummyUserB = {
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
  const dummyComment = {
    body: 'this is a test comment',
  };

  let userA;
  let userB;
  let authUserB;
  let propertyId;

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    // Create test user
    userA = await app.context.orm.User.create(dummyUserA);
    userB = await app.context.orm.User.create(dummyUserB);

    authUserB = (
      await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyUserB.email, password: dummyUserB.hashedPassword })
    ).body;

    dummyProperty.userId = userA.id;

    const property = await app.context.orm.Property.create(dummyProperty);
    propertyId = String(property.id);
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET /properties/:propertyId/comments', () => {
    let dummyComments;

    beforeAll(async () => {
      dummyComments = [
        {
          propertyId,
          userId: String(userA.id),
          body: 'comment one',
        },
        {
          propertyId,
          userId: String(userB.id),
          body: 'comment two',
        },
        {
          propertyId,
          userId: String(userA.id),
          body: 'comment three',
        },
        {
          propertyId,
          userId: String(userB.id),
          body: 'comment four',
        },
      ];
      const promises = dummyComments.map((commentData) => {
        const promise = app.context.orm.Comment.create(commentData);
        return promise;
      });
      await Promise.all(promises);
    });

    describe('when user reqests comments', () => {
      let response;

      beforeAll(async () => {
        response = await request.get(`/properties/${propertyId}/comments`);
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('responds with comments', () => {
        expect(response.body).toHaveProperty('comments');
      });

      test('responds with list of comments', () => {
        expect(response.body.comments).toBeInstanceOf(Array);
      });

      test('responds with list with 4 or more elements', () => {
        expect(response.body.comments.length).toBeGreaterThanOrEqual(dummyComments.length);
      });

      test('responds with matching comment contents', () => {
        expect(response.body.comments).toEqual(
          expect.arrayContaining([expect.objectContaining(dummyComments[1])]),
        );
      });
    });
  });

  describe('POST /properties/:propertyId/comments', () => {
    describe('when user is authorized', () => {
      describe('when fields are empty', () => {
        let response;
        beforeAll(async () => {
          response = await request
            .post(`/properties/${propertyId}/comments`)
            .set('Content-type', 'application/json')
            .auth(authUserB.token, { type: 'bearer' })
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
        const wrongCommentFields = {
          body: null,
        };

        beforeAll(async () => {
          response = await request
            .post(`/properties/${propertyId}/comments`)
            .set('Content-type', 'application/json')
            .auth(authUserB.token, { type: 'bearer' })
            .send(wrongCommentFields);
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
            .post(`/properties/${propertyId}/comments`)
            .set('Content-type', 'application/json')
            .auth(authUserB.token, { type: 'bearer' })
            .send(dummyComment);
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
          .post(`/properties/${propertyId}/comments`)
          .set('Content-type', 'application/json')
          .send(dummyComment);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });

  describe('PATCH /properties/:propertyId/comments/:commentId', () => {
    const modifiedDummyComment = {
      body: 'modified comment',
    };

    let commentId;
    beforeAll(async () => {
      const comment = await app.context.orm.Comment.create({
        userId: userB.id,
        propertyId,
        ...dummyComment,
      });
      commentId = comment.id;
    });

    describe('when authorized user modifies a comment', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .patch(`/properties/${propertyId}/comments/${commentId}`)
          .auth(authUserB.token, { type: 'bearer' })
          .set('Content-type', 'application/json')
          .send(modifiedDummyComment);
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
          .patch(`/properties/${propertyId}/comments/${commentId}`)
          .set('Content-type', 'application/json')
          .send(modifiedDummyComment);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with an empty body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });

  describe('DELETE /properties/:propertyId/comments/:commentId', () => {
    let commentId;
    beforeAll(async () => {
      const comment = await app.context.orm.Comment.create({
        userId: userB.id,
        propertyId,
        ...dummyComment,
      });
      commentId = comment.id;
    });

    describe('when unauthorized user deletes a comment', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .delete(`/properties/${propertyId}/comments/${commentId}`)
          .set('Content-type', 'application/json')
          .send();
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with an empty body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });

    describe('when authorized user deletes a comment', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .delete(`/properties/${propertyId}/comments/${commentId}`)
          .auth(authUserB.token, { type: 'bearer' })
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
  });
});
