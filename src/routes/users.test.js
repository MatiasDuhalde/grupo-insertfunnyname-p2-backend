const supertest = require('supertest');
const app = require('../app');
const { test } = require('../config/database');

const request = supertest(app.callback());

describe('Users routes', () => {
  let user;
  
  const dummyUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@gmail.com',
    password: 'testuser',
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true, alter: true });
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('POST /users', () => {
    const postUser = (body) => {
      const req = request.post('/users').set('Content-type', 'application/json');
      return req.send(body);
    };
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
    const postUser = (body) => {
      const req = request.post('/users').set('Content-type', 'application/json');
      return req.send(body);
    };
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
    let auth;

    beforeAll(async () => {
      const authResponse = await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyUser.email, password: dummyUser.password });
      auth = authResponse.body;
    });

    const postUser = (body) => {
      const req = request.post('/users').set('Content-type', 'application/json');
      return req.send(body);
    };

    const authorizedGetUser = () => request
      .get('/users/me')
      .auth(auth.token, { type: 'bearer' })
      .set('Content-type', 'application/json');

    const unauthorizedGetUser = () => request
      .get('/users/me')
      .set('Content-type', 'application/json');

    let getResponseAuthorized;
    let getResponseunAuthorized;

    beforeAll(async () => {
      user = await postUser(dummyUser);
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
      test('responds with JSON body type', () => {
        expect(getResponseunAuthorized.type).toEqual('text/plain');
      });
    });
  });
  describe('PATCH /users/:userId', () => {
    let auth;
    const modifiedDummyUser = {
      firstName: 'modifiedTest',
      lastName: 'modifiedUser',
    };
    
    const postUser = (body) => {
      const req = request.post('/users').set('Content-type', 'application/json');
      return req.send(body);
    };
    const authorizedPatchUser = (id, body) => {
      const req = request
        .patch(`/users/${id}`)
        .auth(auth.token, { type: 'bearer' })
        .set('Content-type', 'application/json');
      return req.send(body);
    };
    const unauthorizedPatchUser = (id, body) => {
      const req = request
        .patch(`/users/${id}`)
        .set('Content-type', 'application/json');
      return req.send(body);
    };
    let user;
    let patchResponseAuthorized;
    let patchResponseUnauthorized;
    beforeAll(async () => {
      const authResponse = await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyUser.email, password: dummyUser.hashedPassword });
      auth = authResponse.body;
      user = await postUser(dummyUser);
      patchResponseAuthorized = await authorizedPatchUser(user.body.id, modifiedDummyUser);
      patchResponseUnauthorized = await unauthorizedPatchUser(user.body.id, modifiedDummyUser);
    });
    describe('when authorized user modifies profile information', () => {
      test('responds with 204 status code', () => {
        expect(patchResponseAuthorized.status).toBe(204);
      });
      test('responds with an empty body type', () => {
        expect(patchResponseAuthorized.type).toEqual('');
      });
    });
  });
});
