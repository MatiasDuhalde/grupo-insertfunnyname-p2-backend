const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

const postUser = (body) => {
  const req = request.post('/users').set('Content-type', 'application/json');
  return req.send(body);
};

describe('Users routes', () => {
  const dummyUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@gmail.com',
    password: 'testuser',
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await app.context.orm.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('POST /users', () => {
    describe('when a user is created', () => {
      let response;

      beforeAll(async () => {
        response = await postUser(dummyUser);
      });

      test('responds with 201 status code', () => {
        expect(response.status).toBe(201);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });
  });

  describe('POST /auth', () => {
    const postAuth = (body) => {
      const req = request.post('/auth').set('Content-type', 'application/json');
      return req.send(body);
    };

    describe('when user is authenticated', () => {
      let response;

      beforeAll(async () => {
        await postUser(dummyUser);
        response = await postAuth({ email: dummyUser.email, password: dummyUser.password });
      });

      test('responds with 201 status code', () => {
        expect(response.status).toBe(201);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });
  });

  describe('GET users/me', () => {
    let authGet;

    const authorizedGetUser = () => request
      .get('/users/me')
      .auth(authGet.token, { type: 'bearer' })
      .set('Content-type', 'application/json');

    const unauthorizedGetUser = () => request
      .get('/users/me')
      .set('Content-type', 'application/json');

    let getResponseAuthorized;
    let getResponseunAuthorized;
    beforeAll(async () => {
      await postUser(dummyUser);

      const authResponse = await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyUser.email, password: dummyUser.password });
      authGet = authResponse.body;

      getResponseAuthorized = await authorizedGetUser();
      getResponseunAuthorized = await unauthorizedGetUser();
    });

    describe('when authenticated user sees their profile', () => {
      test('responds with 200 status code', () => {
        expect(getResponseAuthorized.status).toBe(200);
      });

      test('responds with JSON body type', () => {
        expect(getResponseAuthorized.type).toEqual('application/json');
      });
    });

    describe('when unauthenticated user enters the route', () => {
      test('responds with 401 status code', () => {
        expect(getResponseunAuthorized.status).toBe(401);
      });

      test('responds with plain body type', () => {
        expect(getResponseunAuthorized.type).toEqual('text/plain');
      });
    });
  });

  describe('PATCH /users/:userId', () => {
    let authPatch;
    const modifiedDummyUser = {
      firstName: 'modifiedTest',
      lastName: 'modifiedUser',
    };

    const authorizedPatchUser = (id, body) => {
      const req = request
        .patch(`/users/${id}`)
        .auth(authPatch.token, { type: 'bearer' })
        .set('Content-type', 'application/json');
      return req.send(body);
    };
    const unauthorizedPatchUser = (id, body) => {
      const req = request
        .patch(`/users/${id}`)
        .set('Content-type', 'application/json');
      return req.send(body);
    };

    let patchUser;
    let patchResponseAuthorized;
    let patchResponseUnauthorized;

    beforeAll(async () => {
      await postUser(dummyUser);

      const authResponse = await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyUser.email, password: dummyUser.password });
      authPatch = authResponse.body;

      patchUser = await request
        .get('/users/me')
        .auth(authPatch.token, { type: 'bearer' })
        .send();

      patchResponseAuthorized = await authorizedPatchUser(
        patchUser.body.user.id,
        modifiedDummyUser,
      );
      patchResponseUnauthorized = await unauthorizedPatchUser(
        patchUser.body.user.id,
        modifiedDummyUser,
      );
    });

    describe('when authorized user modifies profile information', () => {
      test('responds with 204 status code', () => {
        expect(patchResponseAuthorized.status).toBe(204);
      });

      test('responds with an empty body type', () => {
        expect(patchResponseAuthorized.type).toEqual('');
      });
    });

    describe('when unauthorized user modifies profile information', () => {
      test('responds with 401 status code', () => {
        expect(patchResponseUnauthorized.status).toBe(401);
      });

      test('responds with an empty body type', () => {
        expect(patchResponseUnauthorized.type).toEqual('text/plain');
      });
    });
  });
});
