const supertest = require('supertest');
const bcrypt = require('bcrypt');
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
  const dummyAdmin = {
    email: 'admin@example.com',
    hashedPassword: 'password',
  };

  let reportedUser;
  let reportingUser;
  let comment;
  let property;
  let authReporterUser;
  let adminAuth;

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    // Create admin
    await app.context.orm.Admin.create({
      email: dummyAdmin.email,
      hashedPassword: bcrypt.hashSync(dummyAdmin.hashedPassword, 8),
    });
    // Create test user
    reportedUser = await app.context.orm.User.create(dummyReportedUser);
    reportingUser = await app.context.orm.User.create(dummyReporterUser);

    authReporterUser = (
      await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyReporterUser.email, password: dummyReporterUser.hashedPassword })
    ).body;

    adminAuth = (
      await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyAdmin.email, password: dummyAdmin.hashedPassword })
    ).body;

    dummyProperty.userId = reportedUser.id;
    property = await app.context.orm.Property.create(dummyProperty);

    dummyComment.userId = reportedUser.id;
    dummyComment.propertyId = property.id;
    comment = await app.context.orm.Comment.create(dummyComment);

    // Create reports

    await app.context.orm.ReportComment.create({
      userId: reportingUser.id,
      commentId: reportedUser.id,
      ...dummyReport,
    });
    await app.context.orm.ReportUser.create({
      userId: reportingUser.id,
      reportedUserId: reportedUser.id,
      ...dummyReport,
    });
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET /admin/reports', () => {
    describe('when user is authorized (admin)', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .get('/admin/reports')
          .set('Content-type', 'application/json')
          .auth(adminAuth.token, { type: 'bearer' })
          .send(dummyReport);
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('responds with user reports', () => {
        expect(response.body).toHaveProperty('userReports');
      });

      test('responds with list of user reports', () => {
        expect(response.body.userReports).toBeInstanceOf(Array);
      });

      test('responds with comment reports', () => {
        expect(response.body).toHaveProperty('commentReports');
      });

      test('responds with list of comment reports', () => {
        expect(response.body.commentReports).toBeInstanceOf(Array);
      });
    });

    describe('when user is authorized (user account)', () => {
      let response;

      beforeAll(async () => {
        response = await request
          .get('/admin/reports')
          .set('Content-type', 'application/json')
          .auth(authReporterUser.token, { type: 'bearer' })
          .send(dummyReport);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });

    describe('when user is not authorized', () => {
      let response;

      beforeAll(async () => {
        response = await request
          .get('/admin/reports')
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

  describe('DELETE /admin/properties/:propertyId/comments/:commentId', () => {
    describe('when user is authorized (admin)', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .delete(`/admin/properties/${property.id}/comments/${comment.id}`)
          .set('Content-type', 'application/json')
          .auth(adminAuth.token, { type: 'bearer' })
          .send(dummyReport);
      });

      test('responds with 204 status code', () => {
        expect(response.status).toBe(204);
      });

      test('responds with empty body', () => {
        expect(response.type).toEqual('');
      });
    });

    describe('when user is authorized (user account)', () => {
      let response;

      beforeAll(async () => {
        response = await request
          .delete(`/admin/properties/${property.id}/comments/${comment.id}`)
          .set('Content-type', 'application/json')
          .auth(authReporterUser.token, { type: 'bearer' })
          .send(dummyReport);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });

    describe('when user is not authorized', () => {
      let response;

      beforeAll(async () => {
        response = await request
          .delete(`/admin/properties/${property.id}/comments/${comment.id}`)
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

  describe('DELETE /admin/properties/:propertyId', () => {
    describe('when user is authorized (admin)', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .delete(`/admin/properties/${property.id}`)
          .set('Content-type', 'application/json')
          .auth(adminAuth.token, { type: 'bearer' })
          .send(dummyReport);
      });

      test('responds with 204 status code', () => {
        expect(response.status).toBe(204);
      });

      test('responds with empty body', () => {
        expect(response.type).toEqual('');
      });
    });

    describe('when user is authorized (user account)', () => {
      let response;

      beforeAll(async () => {
        response = await request
          .delete(`/admin/properties/${property.id}`)
          .set('Content-type', 'application/json')
          .auth(authReporterUser.token, { type: 'bearer' })
          .send(dummyReport);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });

    describe('when user is not authorized', () => {
      let response;

      beforeAll(async () => {
        response = await request
          .delete(`/admin/properties/${property.id}`)
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

  describe('DELETE /admin/users/:userId', () => {
    describe('when user is authorized (admin)', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .delete(`/admin/users/${reportedUser.id}`)
          .set('Content-type', 'application/json')
          .auth(adminAuth.token, { type: 'bearer' })
          .send(dummyReport);
      });

      test('responds with 204 status code', () => {
        expect(response.status).toBe(204);
      });

      test('responds with empty body', () => {
        expect(response.type).toEqual('');
      });
    });

    describe('when user is authorized (user account)', () => {
      let response;

      beforeAll(async () => {
        response = await request
          .delete(`/admin/users/${reportedUser.id}`)
          .set('Content-type', 'application/json')
          .auth(authReporterUser.token, { type: 'bearer' })
          .send(dummyReport);
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });

    describe('when user is not authorized', () => {
      let response;

      beforeAll(async () => {
        response = await request
          .delete(`/admin/users/${reportedUser.id}`)
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
