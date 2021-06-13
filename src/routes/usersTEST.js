// const { supertest } = require('supertest');
// const app = require('../app');

// const request = supertest(app.callback());

// describe('Users routes', () => {
//   let auth;
//   let user;

//   const dummyUser = {
//     firstName: 'Test',
//     lastName: 'User',
//     email: 'test@gmail.com',
//     hashedPassword: 'passwordIIC',
//   };

//   beforeAll(async () => {
//     await app.context.orm.sequelize.sync({ force: true });
//     user = await app.context.orm.User.create(dummyUser);
//     const authResponse = await request
//       .post('/auth')
//       .set('Content-type', 'application/json')
//       .send({ email: dummyUser.email, hashedPassword: dummyUser.hashedPassword });
//     auth = authResponse.body;
//   });

//   afterAll(async () => {
//     await app.context.orm.sequelize.close();
//   });

//   describe('GET /user/me', () => {
//     let response;
    
//     const authorizedGetUser = (body) => request
//       .get('/users/me')
//       .auth(auth.access_token, { type: 'bearer' });
//     const unauthorizedGetUser = (body) => request.get('/users/me');
    
//     describe('unauthorized user ')
    
       

//   });

// });
