const { clientUrls } = require('../routes/utils/client');

const sendWelcomeEmail = (ctx, to, data) => {
  const templateContext = { ...data, clientUrls };
  const subject = 'Welcome to FindHomy!';
  return ctx.sendMail('signup-email', { to, subject }, templateContext);
};

module.exports = {
  sendWelcomeEmail,
};
