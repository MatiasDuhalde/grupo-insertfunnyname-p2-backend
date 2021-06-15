const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

const postUser = (body) => {
  const req = request.post('/users').set('Content-type', 'application/json');
  return req.send(body);
};

const postAuth = async (body) => {
  const req = request.post('/auth').set('Content-type', 'application/json');
  return req.send(body);
};

describe('User routes', () => {
  const dummyUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@gmail.com',
    password: 'testuser',
  };

  beforeEach(async () => {
    await app.context.orm.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('POST /users', () => {
    describe('when a user is created with valid fields', () => {
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

    describe('when a user is created with empty fields', () => {
      let response;

      beforeAll(async () => {
        response = await postUser({});
      });

      test('responds with 201 status code', () => {
        expect(response.status).toBe(422);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });

    describe('when a user is created with invalid fields', () => {
      const wrongUserData = {
        firstName: '',
        lastName: '',
        password: '',
      };

      let response;

      beforeAll(async () => {
        response = await postUser(wrongUserData);
      });

      test('responds with 201 status code', () => {
        expect(response.status).toBe(422);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });
  });

  describe('POST /auth', () => {
    describe('when user is authenticated correctly', () => {
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

    describe('when email or password are wrong', () => {
      let response;

      beforeAll(async () => {
        await postUser(dummyUser);
        response = await postAuth({ email: 'notanemail@gmail.com', password: 'password' });
      });

      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });
  });

  describe('GET users/me', () => {
    let auth;

    beforeAll(async () => {
      await postUser(dummyUser);
      const authResponse = await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyUser.email, password: dummyUser.password });
      auth = authResponse.body;
    });

    describe('when authenticated user sees their profile', () => {
      let response;
      beforeAll(async () => {
        response = await request.get('/users/me').auth(auth.token, { type: 'bearer' }).send();
      });

      test('responds with 200 status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });

    describe('when unauthenticated user enters the route', () => {
      let response;
      beforeAll(async () => {
        response = await request.get('/users/me').send();
      });
      test('responds with 401 status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with plain body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });
  });

  describe('PATCH /users/:userId', () => {
    let auth;
    const modifiedDummyUser = {
      firstName: 'modifiedTest',
      lastName: 'modifiedUser',
    };

    let userResponse;
    beforeAll(async () => {
      await postUser(dummyUser);

      const authResponse = await request
        .post('/auth')
        .set('Content-type', 'application/json')
        .send({ email: dummyUser.email, password: dummyUser.password });
      auth = authResponse.body;

      userResponse = await request.get('/users/me').auth(auth.token, { type: 'bearer' }).send();
    });

    describe('when authorized user modifies profile information', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .patch(`/users/${userResponse.body.user.id}`)
          .set('Content-type', 'application/json')
          .auth(auth.token, { type: 'bearer' })
          .send(modifiedDummyUser);
      });

      test('responds with 204 status code', () => {
        expect(response.status).toBe(204);
      });

      test('responds with an empty body type', () => {
        expect(response.type).toEqual('');
      });
    });

    describe('when unauthorized user modifies profile information', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .patch(`/users/${userResponse.body.user.id}`)
          .set('Content-type', 'application/json')
          .send(modifiedDummyUser);
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
